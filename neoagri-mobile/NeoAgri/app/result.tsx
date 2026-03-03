import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import Card from '../components/Card';
import BigButton from '../components/BigButton';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { PredictionResult, LangKey } from '../types';
import { getLocalizedResult } from '../services/inference';
import { saveToHistory, generateScanId } from '../services/history';

export default function ResultScreen() {
  const router = useRouter();
  const { photoUri, prediction } = useLocalSearchParams<{
    photoUri: string;
    prediction: string;
  }>();

  const [lang, setLang] = useState<LangKey>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);

  // Parse prediction from route params
  let predictionData: PredictionResult | null = null;
  try {
    if (prediction) {
      predictionData = JSON.parse(prediction);
    }
  } catch {
    console.error('[NeoAgri] Failed to parse prediction data');
  }

  useEffect(() => {
    AsyncStorage.getItem('selectedLanguage').then((savedLang) => {
      if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) {
        setLang(savedLang as LangKey);
      }
    });
  }, []);

  // Get localized result
  const result = predictionData
    ? getLocalizedResult(predictionData, lang)
    : {
        disease: 'Unknown',
        confidence: 0,
        severity: 'Unknown',
        remedy: 'N/A',
        dosage: 'N/A',
        instructions: 'Could not analyze image.',
        prevention: 'N/A',
      };

  // Save to history on first render
  useEffect(() => {
    if (predictionData && !savedToHistory) {
      const scan = {
        id: generateScanId(),
        photoUri: photoUri || '',
        timestamp: Date.now(),
        prediction: predictionData,
        language: lang,
      };
      saveToHistory(scan);
      setSavedToHistory(true);
    }
  }, [predictionData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      speakResult();
    }, 1000);

    return () => {
      clearTimeout(timer);
      Speech.stop();
    };
  }, [lang]);

  const speakResult = () => {
    const speechLang =
      lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';

    const text = `${result.disease}. ${result.remedy}. ${result.dosage}. ${result.instructions}`;

    setIsSpeaking(true);
    Speech.speak(text, {
      language: speechLang,
      rate: 0.85,
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleScanAgain = () => {
    Speech.stop();
    router.replace('/camera');
  };

  const severityColor =
    predictionData?.severity === 'High'
      ? COLORS.danger
      : predictionData?.severity === 'Moderate'
      ? COLORS.warning
      : COLORS.success;

  const severityBg =
    predictionData?.severity === 'High'
      ? COLORS.dangerLight
      : predictionData?.severity === 'Moderate'
      ? '#FFF3E0'
      : COLORS.successLight;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>📋</Text>
          <Text style={styles.headerTitle}>
            {lang === 'hi'
              ? 'निदान रिपोर्ट'
              : lang === 'mr'
              ? 'निदान अहवाल'
              : 'Diagnosis Report'}
          </Text>
        </View>

        {/* Healthy badge or disease alert */}
        {predictionData?.isHealthy && (
          <View style={styles.healthyBanner}>
            <Text style={styles.healthyIcon}>🎉</Text>
            <Text style={styles.healthyText}>
              {lang === 'hi'
                ? 'आपका पौधा स्वस्थ है!'
                : lang === 'mr'
                ? 'तुमचे झाड निरोगी आहे!'
                : 'Your plant is healthy!'}
            </Text>
          </View>
        )}

        {/* Diagnosis Card */}
        <Card
          title={
            lang === 'hi'
              ? '🔍 रोग की पहचान'
              : lang === 'mr'
              ? '🔍 रोगाची ओळख'
              : '🔍 Disease Identified'
          }
          variant={predictionData?.isHealthy ? 'success' : 'warning'}
        >
          <View style={styles.diagnosisContent}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.leafImage} />
            ) : (
              <View style={[styles.leafImage, styles.placeholderImage]}>
                <Text style={styles.placeholderEmoji}>🍂</Text>
              </View>
            )}
            <View style={styles.diagnosisInfo}>
              <Text style={styles.diseaseName}>{result.disease}</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {result.confidence}%{' '}
                  {lang === 'hi'
                    ? 'सटीकता'
                    : lang === 'mr'
                    ? 'अचूकता'
                    : 'Confidence'}
                </Text>
              </View>
              {!predictionData?.isHealthy && (
                <View style={[styles.severityBadge, { backgroundColor: severityBg }]}>
                  <Text style={[styles.severityText, { color: severityColor }]}>
                    ⚠️ {result.severity}
                  </Text>
                </View>
              )}
              {predictionData?.cropName && (
                <Text style={styles.cropName}>
                  🌱 {predictionData.cropName}
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Remedy Card (only for diseased plants) */}
        {!predictionData?.isHealthy && (
          <Card
            title={
              lang === 'hi'
                ? '💊 उपचार'
                : lang === 'mr'
                ? '💊 उपचार'
                : '💊 Recommended Treatment'
            }
            variant="success"
          >
            <View style={styles.remedySection}>
              <View style={styles.remedyHeader}>
                <Text style={styles.remedyIcon}>🧪</Text>
                <Text style={styles.remedyName}>{result.remedy}</Text>
              </View>

              <View style={styles.dosageBox}>
                <Text style={styles.dosageLabel}>
                  {lang === 'hi'
                    ? 'खुराक:'
                    : lang === 'mr'
                    ? 'मात्रा:'
                    : 'Dosage:'}
                </Text>
                <Text style={styles.dosageValue}>{result.dosage}</Text>
              </View>

              <View style={styles.instructionBox}>
                <Text style={styles.instructionLabel}>
                  {lang === 'hi'
                    ? 'निर्देश:'
                    : lang === 'mr'
                    ? 'सूचना:'
                    : 'Instructions:'}
                </Text>
                <Text style={styles.instructionValue}>{result.instructions}</Text>
              </View>

              <View style={styles.preventionBox}>
                <Text style={styles.preventionLabel}>
                  {lang === 'hi'
                    ? '🛡️ रोकथाम:'
                    : lang === 'mr'
                    ? '🛡️ प्रतिबंध:'
                    : '🛡️ Prevention:'}
                </Text>
                <Text style={styles.preventionValue}>{result.prevention}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Healthy plant tips */}
        {predictionData?.isHealthy && (
          <Card
            title={
              lang === 'hi'
                ? '💡 स्वस्थ रखने के टिप्स'
                : lang === 'mr'
                ? '💡 निरोगी ठेवण्याचे टिप्स'
                : '💡 Keeping It Healthy'
            }
            variant="success"
          >
            <View style={styles.instructionBox}>
              <Text style={styles.instructionValue}>{result.instructions}</Text>
            </View>
            <View style={[styles.preventionBox, { marginTop: SPACING.sm }]}>
              <Text style={styles.preventionLabel}>
                {lang === 'hi'
                  ? '🌱 सर्वोत्तम अभ्यास:'
                  : lang === 'mr'
                  ? '🌱 सर्वोत्तम पद्धती:'
                  : '🌱 Best Practices:'}
              </Text>
              <Text style={styles.preventionValue}>{result.prevention}</Text>
            </View>
          </Card>
        )}

        {/* Audio Card */}
        <Card
          title={
            lang === 'hi' ? '🔊 ऑडियो' : lang === 'mr' ? '🔊 ऑडिओ' : '🔊 Listen'
          }
        >
          <TouchableOpacity
            style={[
              styles.audioButton,
              isSpeaking && styles.audioButtonActive,
            ]}
            onPress={speakResult}
            activeOpacity={0.7}
          >
            <Text style={styles.audioButtonIcon}>
              {isSpeaking ? '🔊' : '▶️'}
            </Text>
            <Text style={styles.audioButtonText}>
              {isSpeaking
                ? lang === 'hi'
                  ? 'सुन रहे हैं...'
                  : lang === 'mr'
                  ? 'ऐकत आहे...'
                  : 'Playing...'
                : lang === 'hi'
                ? 'ऑडियो सुनें'
                : lang === 'mr'
                ? 'ऑडिओ ऐका'
                : 'Play Audio'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Scan Again */}
        <View style={styles.bottomAction}>
          <BigButton
            title={
              lang === 'hi'
                ? '📷 फिर से स्कैन करें'
                : lang === 'mr'
                ? '📷 पुन्हा स्कॅन करा'
                : '📷 Scan Again'
            }
            onPress={handleScanAgain}
            variant="primary"
            size="large"
          />
        </View>

        {/* Offline badge */}
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>
            📡 {lang === 'hi'
              ? 'ऑफलाइन विश्लेषण — इंटरनेट नहीं चाहिए'
              : lang === 'mr'
              ? 'ऑफलाइन विश्लेषण — इंटरनेट नको'
              : 'Analyzed offline — no internet needed'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  headerIcon: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading,
    color: COLORS.text,
  },
  // Healthy banner
  healthyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.successLight,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  healthyIcon: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  healthyText: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.success,
  },
  // Diagnosis card
  diagnosisContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  leafImage: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  placeholderImage: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  diagnosisInfo: {
    flex: 1,
  },
  diseaseName: {
    ...TYPOGRAPHY.heading,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  confidenceBadge: {
    backgroundColor: COLORS.successLight,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  confidenceText: {
    ...TYPOGRAPHY.label,
    color: COLORS.success,
    fontWeight: '700',
  },
  severityBadge: {
    backgroundColor: '#FFF3E0',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  severityText: {
    ...TYPOGRAPHY.label,
    color: COLORS.warning,
    fontWeight: '600',
  },
  cropName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  // Remedy
  remedySection: {
    gap: SPACING.md,
  },
  remedyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  remedyIcon: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  remedyName: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.primaryDark,
    flex: 1,
  },
  dosageBox: {
    backgroundColor: COLORS.surfaceWarm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  dosageLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  dosageValue: {
    ...TYPOGRAPHY.heading,
    color: COLORS.text,
  },
  instructionBox: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
  },
  instructionLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  instructionValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  preventionBox: {
    padding: SPACING.md,
    backgroundColor: '#E3F2FD',
    borderRadius: RADIUS.md,
  },
  preventionLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  preventionValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  // Audio
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.accentDark,
    ...SHADOWS.medium,
  },
  audioButtonActive: {
    backgroundColor: COLORS.primary,
    borderBottomColor: COLORS.primaryDark,
  },
  audioButtonIcon: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  audioButtonText: {
    ...TYPOGRAPHY.heading,
    color: COLORS.textLight,
  },
  // Bottom
  bottomAction: {
    marginTop: SPACING.lg,
  },
  offlineBadge: {
    alignItems: 'center',
    marginTop: SPACING.md,
    backgroundColor: COLORS.successLight,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    alignSelf: 'center',
  },
  offlineText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
});
