/**
 * LeagueOfStonesLoader
 *
 * A transparent overlay loader for React Native.
 * Drop it anywhere in your component tree — it renders above
 * the current screen with a fully transparent background.
 *
 * Dependencies:
 *   npm install react-native-svg
 *   npx pod-install   (iOS)
 *
 * Usage:
 *   import LeagueOfStonesLoader from './LeagueOfStonesLoader';
 *   {isLoading && <LeagueOfStonesLoader visible={isLoading} />}
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Modal,
} from 'react-native';
import Svg, {
  Circle,
  Polygon,
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
  Rect,
} from 'react-native-svg';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Palette ───────────────────────────────────────────────────────────────
const GOLD   = '#c8922a';
const PURPLE = '#9b5de5';
const BLUE   = '#3cc4ff';
const PINK   = '#ff6b9d';
const MINT   = '#5affb0';
const ORB_COLORS = [PURPLE, BLUE, GOLD, PINK, MINT];

const LOADING_MSGS = [
  'Summoning...',
  'Drawing cards...',
  'Entering the arena...',
  'Preparing deck...',
];

// ─── Animated Svg helper wrappers ──────────────────────────────────────────
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Star ──────────────────────────────────────────────────────────────────
function Star({ x, y, maxOp, duration, delay }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: maxOp, duration: duration / 2, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(scale,   { toValue: 1.5,   duration: duration / 2, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: duration / 2, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(scale,   { toValue: 1, duration: duration / 2, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        { left: x, top: y, opacity, transform: [{ scale }] },
      ]}
    />
  );
}

// ─── Stars field (memoised, generated once) ────────────────────────────────
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id:       i,
  x:        Math.random() * SW,
  y:        Math.random() * SH,
  maxOp:    0.3 + Math.random() * 0.7,
  duration: (2 + Math.random() * 4) * 1000,
  delay:    Math.random() * 5000,
}));

// ─── Mana Orb ──────────────────────────────────────────────────────────────
function ManaOrb({ color, size, startX, startY, endX, endY, duration }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
  }, []);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [startX, endX] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [startY, endY] });
  const opacity    = progress.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.8, 0.4, 0] });
  const scale      = progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0.3] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: size,
        opacity,
        transform: [{ translateX }, { translateY }, { scale }],
      }}
    />
  );
}

// ─── Orb spawner ───────────────────────────────────────────────────────────
function ManaOrbs() {
  const [orbs, setOrbs] = useState([]);
  const counter = useRef(0);

  const spawn = useCallback(() => {
    const id    = counter.current++;
    const size  = 4 + Math.random() * 6;
    const color = ORB_COLORS[Math.floor(Math.random() * ORB_COLORS.length)];
    const dur   = (1.5 + Math.random() * 2) * 1000;

    // Card is 120×160, orbs spawn within it
    const startX = Math.random() * 80 + 10;
    const startY = Math.random() * 80 + 40;
    const endX   = Math.random() * 100 - 10;
    const endY   = -(20 + Math.random() * 60);

    setOrbs(prev => [...prev, { id, color, size, startX, startY, endX, endY, dur }]);
    setTimeout(() => setOrbs(prev => prev.filter(o => o.id !== id)), dur + 50);
  }, []);

  useEffect(() => {
    const interval = setInterval(spawn, 300);
    return () => clearInterval(interval);
  }, [spawn]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {orbs.map(o => (
        <ManaOrb
          key={o.id}
          color={o.color}
          size={o.size}
          startX={o.startX}
          startY={o.startY}
          endX={o.endX}
          endY={o.endY}
          duration={o.dur}
        />
      ))}
    </View>
  );
}

// ─── Animated Rune SVG ─────────────────────────────────────────────────────
function CardRune() {
  const ring1Rot = useRef(new Animated.Value(0)).current;
  const ring2Rot = useRef(new Animated.Value(0)).current;
  const coreR    = useRef(new Animated.Value(8)).current;
  const coreOp   = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(ring1Rot, { toValue: 1, duration: 4000, useNativeDriver: true, easing: Easing.linear })).start();
    Animated.loop(Animated.timing(ring2Rot, { toValue: 1, duration: 6000, useNativeDriver: true, easing: Easing.linear })).start();
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(coreR,  { toValue: 11, duration: 1000, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(coreOp, { toValue: 1,  duration: 1000, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.timing(coreR,  { toValue: 8,   duration: 1000, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(coreOp, { toValue: 0.4, duration: 1000, useNativeDriver: false }),
        ]),
      ])
    ).start();
  }, []);

  const spin1 = ring1Rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spin2 = ring2Rot.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

  return (
    <View style={styles.cardRune}>
      <Svg width={64} height={64} viewBox="0 0 64 64">
        {/* Outer dashed ring */}
        <AnimatedSvgCircle
          cx="32" cy="32" r="26"
          fill="none"
          stroke="rgba(140,90,255,0.7)"
          strokeWidth="1.5"
          strokeDasharray="8,4"
          rotation={ring1Rot}
        />
        {/* Inner dashed ring (reverse) */}
        <AnimatedSvgCircle
          cx="32" cy="32" r="20"
          fill="none"
          stroke="rgba(60,180,255,0.5)"
          strokeWidth="1"
          strokeDasharray="5,3"
          rotation={ring2Rot}
          reverse
        />
        {/* Star polygon */}
        <Polygon
          points="32,10 37,26 54,26 40,36 45,52 32,42 19,52 24,36 10,26 27,26"
          fill="none"
          stroke="rgba(200,140,255,0.6)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Pulsing core */}
        <AnimatedCircle
          cx="32"
          cy="32"
          r={coreR}
          fill="none"
          stroke="rgba(200,140,255,0.9)"
          strokeWidth="1.5"
          opacity={coreOp}
        />
        {/* Centre dot */}
        <Circle cx="32" cy="32" r="3" fill="rgba(220,170,255,0.9)" />
      </Svg>
    </View>
  );
}

// ─── Wrapper that handles SVG ring rotation via transform ──────────────────
function AnimatedSvgCircle({ rotation, reverse, ...props }) {
  const AnimCircle = Animated.createAnimatedComponent(Circle);
  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg'],
  });
  // SVG transforms are not natively-driven; use View wrapper trick
  return (
    <G>
      <AnimatedSvgG rotation={spin} originX={32} originY={32}>
        <Circle {...props} />
      </AnimatedSvgG>
    </G>
  );
}

const AnimatedG = Animated.createAnimatedComponent(G);
function AnimatedSvgG({ rotation, originX, originY, children }) {
  return (
    <AnimatedG rotation={rotation} originX={originX} originY={originY}>
      {children}
    </AnimatedG>
  );
}

// ─── Card float + glow animation ───────────────────────────────────────────
function FloatingCard() {
  const floatY  = useRef(new Animated.Value(0)).current;
  const rotate  = useRef(new Animated.Value(-2)).current;
  const glowOp  = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(floatY, { toValue: -12, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(rotate, { toValue: 2,   duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ]),
        Animated.parallel([
          Animated.timing(floatY, { toValue: 0,  duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(rotate, { toValue: -2, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ]),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOp, { toValue: 1,   duration: 1000, useNativeDriver: true }),
        Animated.timing(glowOp, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const deg = rotate.interpolate({ inputRange: [-2, 2], outputRange: ['-2deg', '2deg'] });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        { transform: [{ translateY: floatY }, { rotate: deg }] },
      ]}
    >
      {/* Card body gradient — pure SVG, no native dependency */}
      <Svg style={StyleSheet.absoluteFill} width="120" height="160">
        <Defs>
          <LinearGradient id="cardGrad" x1="0.1" y1="0" x2="0.9" y2="1">
            <Stop offset="0"   stopColor="#1e0a3c" stopOpacity="1" />
            <Stop offset="0.5" stopColor="#0d1a2e" stopOpacity="1" />
            <Stop offset="1"   stopColor="#1a0a2c" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="120" height="160" fill="url(#cardGrad)" />
      </Svg>

      {/* Glow overlay */}
      <Animated.View style={[styles.cardGlow, { opacity: glowOp }]} />

      {/* Inner border */}
      <View style={styles.cardBorderInner} />

      {/* Corner runes */}
      <CornerRune style={styles.cornerTL} />
      <CornerRune style={styles.cornerTR} rotate={90} />
      <CornerRune style={styles.cornerBL} rotate={-90} />
      <CornerRune style={styles.cornerBR} rotate={180} />

      <CardRune />
      <ManaOrbs />
    </Animated.View>
  );
}

// ─── Corner rune SVG ───────────────────────────────────────────────────────
function CornerRune({ style, rotate = 0 }) {
  return (
    <View style={[styles.cornerRune, style, { transform: [{ rotate: `${rotate}deg` }] }]}>
      <Svg width={20} height={20} viewBox="0 0 20 20">
        <Path d="M2 18 L2 2 L18 2" stroke={GOLD} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <Circle cx="2" cy="2" r="2" fill={GOLD} />
      </Svg>
    </View>
  );
}

// ─── Progress bar ──────────────────────────────────────────────────────────
function RuneBar() {
  const width   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(width,   { toValue: 1,   duration: 1920, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(opacity, { toValue: 0,   duration: 192,  useNativeDriver: false }),
        Animated.timing(width,   { toValue: 0,   duration: 0,    useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 1,   duration: 192,  useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const widthPct = width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.runeBarWrap}>
      <Animated.View style={[styles.runeBarFill, { width: widthPct, opacity }]} />
    </View>
  );
}

// ─── Loading text cycler ───────────────────────────────────────────────────
function LoadingText() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % LOADING_MSGS.length), 2400);
    return () => clearInterval(t);
  }, []);

  return <Text style={styles.loadingText}>{LOADING_MSGS[idx]}</Text>;
}

// ─── Title glow ────────────────────────────────────────────────────────────
function GameTitle() {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1000, useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0, duration: 1000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  // textShadowRadius can't be easily animated natively; animate opacity of a glow layer instead
  return (
    <View>
      <Text style={styles.gameTitle}>League of Stones</Text>
    </View>
  );
}

// ─── Main loader ───────────────────────────────────────────────────────────
export default function Chargement({ visible = true }) {
  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.overlay}>
        {/* Starfield */}
        {STARS.map(s => (
          <Star key={s.id} x={s.x} y={s.y} maxOp={s.maxOp} duration={s.duration} delay={s.delay} />
        ))}

        {/* Centre content */}
        <View style={styles.content}>
          <FloatingCard />

          <View style={styles.titleBlock}>
            <GameTitle />
            <LoadingText />
            <RuneBar />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // fully transparent — sits above current screen
  },

  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },

  content: {
    alignItems: 'center',
  },

  // ── Card ──
  cardContainer: {
    width: 120,
    height: 160,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8b6914',
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#7833dc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },

  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(120,60,220,0.15)',
  },

  cardBorderInner: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(180,130,30,0.4)',
  },

  cornerRune: {
    position: 'absolute',
    width: 20,
    height: 20,
    opacity: 0.4,
  },
  cornerTL: { top: 12,  left: 12  },
  cornerTR: { top: 12,  right: 12 },
  cornerBL: { bottom: 12, left: 12  },
  cornerBR: { bottom: 12, right: 12 },

  cardRune: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
    width: 64,
    height: 64,
  },

  // ── Title ──
  titleBlock: {
    alignItems: 'center',
  },

  gameTitle: {
    fontFamily: 'serif', // swap for a custom Cinzel font if loaded via expo-font
    fontSize: 20,
    fontWeight: '700',
    color: GOLD,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 4,
    textShadowColor: 'rgba(200,146,42,0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },

  loadingText: {
    fontFamily: 'serif',
    fontSize: 11,
    color: 'rgba(180,140,255,0.7)',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 20,
  },

  runeBarWrap: {
    width: 180,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(140,90,255,0.3)',
  },

  runeBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: PURPLE, // LinearGradient can be used here too if desired
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
});