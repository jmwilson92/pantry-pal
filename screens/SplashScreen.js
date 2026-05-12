import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FOOD_EMOJIS = ['🍎', '🥑', '🥦', '🍞', '🥓', '🍒', '🥬'];

export default function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(FOOD_EMOJIS.map(() => new Animated.Value(0.3))).current;
  const dotAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    // Fade in title
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Animate emojis popping in
    const emojiAnimations = scaleAnims.map((anim, index) =>
      Animated.sequence([
        Animated.delay(index * 120),
        Animated.spring(anim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel(emojiAnimations).start();

    // Animated loading dots
    const animateDots = () => {
      dotAnims.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });

      setTimeout(animateDots, 1400);
    };

    animateDots();

    // Auto finish after animation
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        Pantry Pal
      </Animated.Text>

      <View style={styles.emojiRow}>
        {FOOD_EMOJIS.map((emoji, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.emoji,
              {
                transform: [{ scale: scaleAnims[index] }],
              },
            ]}
          >
            {emoji}
          </Animated.Text>
        ))}
      </View>

      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your pantry</Text>
        <View style={styles.dotsContainer}>
          {dotAnims.map((anim, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.dot,
                { opacity: anim },
              ]}
            >
              .
            </Animated.Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f1e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#3f2a1d',
    marginBottom: 40,
    letterSpacing: 1,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 60,
  },
  emoji: {
    fontSize: 38,
    marginHorizontal: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b5b4f',
    marginRight: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  dot: {
    fontSize: 24,
    color: '#6b5b4f',
    marginHorizontal: 1,
  },
});