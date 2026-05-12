import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FOOD_EMOJIS = ['🍎', '🥑', '🥦', '🍞', '🥓', '🍒', '🥬', '🍌', '🥜', '🍪'];

export default function SplashScreen({ onFinish }) {
  const [emojis, setEmojis] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in title
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Create floating emojis
    const floatingEmojis = [];
    for (let i = 0; i < 18; i++) {
      const anim = {
        id: i,
        emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
        x: Math.random() * (SCREEN_WIDTH - 60),
        y: Math.random() * (SCREEN_HEIGHT * 0.65),
        scale: new Animated.Value(0.3),
        opacity: new Animated.Value(0),
      };
      floatingEmojis.push(anim);
    }
    setEmojis(floatingEmojis);

    // Animate each emoji appearing and disappearing
    floatingEmojis.forEach((animData, index) => {
      const delay = index * 80;

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animData.opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(animData.scale, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(600 + Math.random() * 400),
        Animated.parallel([
          Animated.timing(animData.opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animData.scale, {
            toValue: 0.4,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    // Finish splash after ~3 seconds
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        Pantry Pal
      </Animated.Text>

      {emojis.map((emojiData) => (
        <Animated.Text
          key={emojiData.id}
          style={[
            styles.floatingEmoji,
            {
              left: emojiData.x,
              top: emojiData.y,
              opacity: emojiData.opacity,
              transform: [{ scale: emojiData.scale }],
            },
          ]}
        >
          {emojiData.emoji}
        </Animated.Text>
      ))}

      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your pantry</Text>
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
    fontSize: 44,
    fontWeight: 'bold',
    color: '#3f2a1d',
    position: 'absolute',
    top: '22%',
    letterSpacing: 1,
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 32,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: '18%',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b5b4f',
  },
});