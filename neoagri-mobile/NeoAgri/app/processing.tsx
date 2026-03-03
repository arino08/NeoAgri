import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { runInference } from '../services/inference';
import { PredictionResult } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH * 0.65;

type Step = 'captured' | 'preprocessing' | 'analyzing' | 'done' | 'error';

export default function ProcessingScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();

  const [currentStep, setCurrentStep] = useState<Step>('captured');
  const [errorMsg, setErrorMsg] = useState('');

  const scanLineY = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const dotOpacity1 = useRef(new Animated.Value(0)).current;
  const dotOpacity2 = useRef(new Animated.Value(0)).current;
  const dotOpacity3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Scan line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, {
          toValue: IMAGE_SIZE - 4,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineY, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.03,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Loading dots
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotOpacity2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotOpacity3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(dotOpacity1, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(dotOpacity2, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(dotOpacity3, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Voice prompt
    const speechTimer = setTimeout(() => {
      Speech.speak('Analyzing your plant, please wait.', {
        language: 'en-IN',
        rate: 0.9,
      });
    }, 500);

    // Run real on-device inference
    runRealInference();

    return () => {
      clearTimeout(speechTimer);
      Speech.stop();
    };
  }, []);

  const runRealInference = async () => {
    try {
      setCurrentStep('preprocessing');

      // Small delay for UI feedback
      await new Promise((r) => setTimeout(r, 500));
      setCurrentStep('analyzing');

      const result = await runInference(photoUri);

      setCurrentStep('done');

      // Brief pause to show "done" state
      await new Promise((r) => setTimeout(r, 600));

      Speech.stop();

      // Navigate to result with the prediction data
      router.replace({
        pathname: '/result',
        params: {
          photoUri,
          prediction: JSON.stringify(result),
        },
      });
    } catch (error: any) {
      console.error('[NeoAgri] Inference error:', error);
      setCurrentStep('error');
      setErrorMsg(error.message || 'An error occurred during analysis.');
      Speech.stop();
    }
  };

  const handleRetry = () => {
    setCurrentStep('captured');
    setErrorMsg('');
    runRealInference();
  };

  const handleGoBack = () => {
    Speech.stop();
    router.replace('/camera');
  };

  const getStepIcon = (step: Step, targetStep: Step): string => {
    const order: Step[] = ['captured', 'preprocessing', 'analyzing', 'done'];
    const currentIdx = order.indexOf(currentStep);
    const targetIdx = order.indexOf(targetStep);

    if (currentStep === 'error' && targetIdx >= order.indexOf('analyzing')) return '❌';
    if (currentIdx > targetIdx) return '✅';
    if (currentIdx === targetIdx) return '🔄';
    return '⏳';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.magnifyIcon}>🔬</Text>

        {/* Image with scan overlay */}
        <Animated.View
          style={[
            styles.imageContainer,
            { transform: [{ scale: pulseScale }] },
          ]}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Text style={styles.placeholderText}>🌿</Text>
            </View>
          )}

          {currentStep !== 'error' && currentStep !== 'done' && (
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanLineY }] },
              ]}
            />
          )}
        </Animated.View>

        {/* Status text */}
        <View style={styles.statusContainer}>
          {currentStep === 'error' ? (
            <>
              <Text style={styles.errorTitle}>Analysis Failed</Text>
              <Text style={styles.errorMessage}>{errorMsg}</Text>
            </>
          ) : (
            <>
              <Text style={styles.statusTitle}>
                {currentStep === 'done' ? 'Analysis Complete!' : 'Analyzing Your Plant'}
              </Text>
              <View style={styles.dotsRow}>
                <Text style={styles.statusSubtext}>
                  {currentStep === 'done' ? 'Loading results' : 'Please wait'}
                </Text>
                {currentStep !== 'done' && (
                  <>
                    <Animated.Text style={[styles.dot, { opacity: dotOpacity1 }]}>.</Animated.Text>
                    <Animated.Text style={[styles.dot, { opacity: dotOpacity2 }]}>.</Animated.Text>
                    <Animated.Text style={[styles.dot, { opacity: dotOpacity3 }]}>.</Animated.Text>
                  </>
                )}
              </View>
            </>
          )}
        </View>

        {/* Progress steps */}
        <View style={styles.steps}>
          <View style={styles.stepRow}>
            <Text style={styles.stepCheck}>{getStepIcon(currentStep, 'captured')}</Text>
            <Text style={currentStep !== 'captured' ? styles.stepText : styles.stepTextActive}>
              Image captured
            </Text>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepCheck}>{getStepIcon(currentStep, 'preprocessing')}</Text>
            <Text style={currentStep === 'preprocessing' ? styles.stepTextActive : styles.stepText}>
              Preprocessing image
            </Text>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepCheck}>{getStepIcon(currentStep, 'analyzing')}</Text>
            <Text style={currentStep === 'analyzing' ? styles.stepTextActive : styles.stepText}>
              Running AI analysis (on-device)
            </Text>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepCheck}>{getStepIcon(currentStep, 'done')}</Text>
            <Text style={currentStep === 'done' ? styles.stepTextActive : styles.stepText}>
              Disease identified
            </Text>
          </View>
        </View>

        {/* Offline badge */}
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>📡 Fully offline — no internet needed</Text>
        </View>

        {/* Error actions */}
        {currentStep === 'error' && (
          <View style={styles.errorActions}>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
              <Text style={styles.retryBtnText}>🔄 Retry Analysis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn} onPress={handleGoBack}>
              <Text style={styles.backBtnText}>← Back to Camera</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  magnifyIcon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.primary,
    ...SHADOWS.large,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.xl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  placeholderText: {
    fontSize: 80,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.8,
    ...SHADOWS.small,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  statusTitle: {
    ...TYPOGRAPHY.heading,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusSubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  dot: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginLeft: 2,
  },
  errorTitle: {
    ...TYPOGRAPHY.heading,
    color: COLORS.danger,
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  steps: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepCheck: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  stepText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  stepTextActive: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  offlineBadge: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.successLight,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  offlineText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  errorActions: {
    marginTop: SPACING.lg,
    alignSelf: 'stretch',
    gap: SPACING.sm,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: COLORS.primaryDark,
    ...SHADOWS.button3D,
  },
  retryBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textLight,
  },
  backBtn: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backBtnText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
});
