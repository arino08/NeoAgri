import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const { width, height } = Dimensions.get('window');

const NEOAGRI_LETTERS = ['N', 'e', 'o', 'A', 'g', 'r', 'i'];

export default function SplashScreen({ navigation }: Props) {
  // Each letter gets its own animated value
  const letterAnims = useRef(
    NEOAGRI_LETTERS.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
      scale: new Animated.Value(0.5),
    }))
  ).current;

  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const farmerAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Step 1: Fade in farmer image
    Animated.timing(farmerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Step 2: Fade in overlay after 400ms
    setTimeout(() => {
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 400);

    // Step 3: Stagger each letter at 700ms start
    const letterDelay = 700;
    const letterStagger = 90;
    const letterAnimations = NEOAGRI_LETTERS.map((_, i) =>
      Animated.parallel([
        Animated.timing(letterAnims[i].opacity, {
          toValue: 1,
          duration: 350,
          delay: letterDelay + i * letterStagger,
          useNativeDriver: true,
        }),
        Animated.spring(letterAnims[i].scale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          delay: letterDelay + i * letterStagger,
          useNativeDriver: true,
        }),
        Animated.timing(letterAnims[i].translateY, {
          toValue: 0,
          duration: 350,
          delay: letterDelay + i * letterStagger,
          useNativeDriver: true,
        }),
      ])
    );

    // Step 4: Subtitle after all letters
    const subtitleDelay = letterDelay + NEOAGRI_LETTERS.length * letterStagger + 200;
    const subtitleAnimation = Animated.timing(subtitleAnim, {
      toValue: 1,
      duration: 600,
      delay: subtitleDelay,
      useNativeDriver: true,
    });

    Animated.parallel([...letterAnimations, subtitleAnimation]).start();

    // Navigate away after 3.2 seconds
    const timer = setTimeout(() => {
      navigation.replace('Language');
    }, 3400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Farmer image */}
      <Animated.Image
        source={require('../../assets/farmer.png')}
        style={[styles.farmerImage, { opacity: farmerAnim }]}
        resizeMode="cover"
      />

      {/* Gradient overlay for text readability */}
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.45)', 'rgba(0,30,0,0.85)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      {/* Bottom content */}
      <View style={styles.bottomContent}>
        {/* Letter-by-letter NeoAgri */}
        <View style={styles.titleRow}>
          {NEOAGRI_LETTERS.map((letter, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.titleLetter,
                // Green accent on 'N','A' for branding
                (i === 0 || i === 3) && styles.titleLetterAccent,
                {
                  opacity: letterAnims[i].opacity,
                  transform: [
                    { scale: letterAnims[i].scale },
                    { translateY: letterAnims[i].translateY },
                  ],
                },
              ]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, { opacity: subtitleAnim }]}>
          Smart Farming Assistant
        </Animated.Text>

        {/* Loading dot indicator */}
        <Animated.View style={[styles.dotRow, { opacity: subtitleAnim }]}>
          {[0, 1, 2].map((d) => (
            <View key={d} style={styles.dot} />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1a0a',
  },
  farmerImage: {
    position: 'absolute',
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  titleLetter: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  titleLetterAccent: {
    color: '#69F0AE',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1.5,
    fontWeight: '400',
    textTransform: 'uppercase',
    marginBottom: 28,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#69F0AE',
    opacity: 0.8,
  },
});
