import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { ScanRecord, LangKey } from '../types';
import { getHistory, clearHistory } from '../services/history';
import { getLocalizedResult } from '../services/inference';

export default function HistoryScreen() {
  const router = useRouter();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [lang, setLang] = useState<LangKey>('en');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    const savedLang = await AsyncStorage.getItem('selectedLanguage');
    if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) {
      setLang(savedLang as LangKey);
    }
    const history = await getHistory();
    setScans(history);
    setLoading(false);
  };

  const handleClearHistory = () => {
    const msg =
      lang === 'hi'
        ? 'क्या आप सभी स्कैन इतिहास मिटाना चाहते हैं?'
        : lang === 'mr'
        ? 'सर्व स्कॅन इतिहास हटवायचा आहे का?'
        : 'Clear all scan history?';

    Alert.alert(
      lang === 'hi' ? 'पुष्टि करें' : lang === 'mr' ? 'पुष्टी करा' : 'Confirm',
      msg,
      [
        {
          text: lang === 'hi' ? 'रद्द करें' : lang === 'mr' ? 'रद्द करा' : 'Cancel',
          style: 'cancel',
        },
        {
          text: lang === 'hi' ? 'मिटाएं' : lang === 'mr' ? 'हटवा' : 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setScans([]);
          },
        },
      ]
    );
  };

  const handleScanPress = (scan: ScanRecord) => {
    router.push({
      pathname: '/result',
      params: {
        photoUri: scan.photoUri,
        prediction: JSON.stringify(scan.prediction),
      },
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return lang === 'hi' ? 'अभी' : lang === 'mr' ? 'आत्ता' : 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderScanItem = ({ item }: { item: ScanRecord }) => {
    const localized = getLocalizedResult(item.prediction, lang);
    const isHealthy = item.prediction.isHealthy;

    return (
      <TouchableOpacity
        style={styles.scanCard}
        onPress={() => handleScanPress(item)}
        activeOpacity={0.7}
      >
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Text style={styles.thumbnailEmoji}>🌿</Text>
          </View>
        )}
        <View style={styles.scanInfo}>
          <Text style={styles.scanDisease} numberOfLines={1}>
            {localized.disease}
          </Text>
          <View style={styles.scanMeta}>
            <View
              style={[
                styles.confidencePill,
                { backgroundColor: isHealthy ? COLORS.successLight : COLORS.surfaceWarm },
              ]}
            >
              <Text
                style={[
                  styles.confidenceValue,
                  { color: isHealthy ? COLORS.success : COLORS.accent },
                ]}
              >
                {isHealthy ? '✅' : '⚠️'} {localized.confidence}%
              </Text>
            </View>
            <Text style={styles.scanTime}>{formatDate(item.timestamp)}</Text>
          </View>
          <Text style={styles.cropLabel}>🌱 {item.prediction.cropName}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>
        {lang === 'hi'
          ? 'कोई स्कैन नहीं'
          : lang === 'mr'
          ? 'स्कॅन नाहीत'
          : 'No Scans Yet'}
      </Text>
      <Text style={styles.emptySubtext}>
        {lang === 'hi'
          ? 'पत्तियों को स्कैन करके शुरू करें। सभी परिणाम यहां सहेजे जाएंगे।'
          : lang === 'mr'
          ? 'पाने स्कॅन करून सुरुवात करा. सर्व निकाल येथे जतन केले जातील.'
          : 'Start scanning leaves. All results will be saved here.'}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.replace('/camera')}
      >
        <Text style={styles.emptyButtonText}>📷 Start Scanning</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← </Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {lang === 'hi'
              ? '📋 स्कैन इतिहास'
              : lang === 'mr'
              ? '📋 स्कॅन इतिहास'
              : '📋 Scan History'}
          </Text>
          <Text style={styles.headerCount}>
            {scans.length}{' '}
            {lang === 'hi' ? 'स्कैन' : lang === 'mr' ? 'स्कॅन' : 'scans'}
          </Text>
        </View>
        {scans.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearHistory}
          >
            <Text style={styles.clearText}>
              {lang === 'hi' ? 'मिटाएं' : lang === 'mr' ? 'हटवा' : 'Clear'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Scan list */}
      <FlatList
        data={scans}
        keyExtractor={(item) => item.id}
        renderItem={renderScanItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? EmptyState : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  backButton: {
    paddingRight: SPACING.sm,
  },
  backText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.text,
  },
  headerCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  clearButton: {
    backgroundColor: COLORS.dangerLight,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  clearText: {
    ...TYPOGRAPHY.label,
    color: COLORS.danger,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
  // Scan card
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thumbnailPlaceholder: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailEmoji: {
    fontSize: 28,
  },
  scanInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  scanDisease: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  scanMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  confidencePill: {
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  confidenceValue: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  scanTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  cropLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  chevron: {
    fontSize: 28,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.heading,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.primaryDark,
    ...SHADOWS.button3D,
  },
  emptyButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textLight,
  },
});
