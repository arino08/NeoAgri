import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { LanguageContext } from '../context/LanguageContext';

export default function DroneServiceScreen() {
  const ctx = useContext(LanguageContext);
  const t = ctx?.t ?? ((k: string) => k);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="map" color={colors.primaryGreen} size={28} />
        <Text style={styles.headerTitle}>{t('droneMonitor')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('latestScan')}</Text>
          <Text style={styles.timestamp}>{t('scannedToday')}</Text>

          <View style={styles.mapContainer}>
            <View style={[styles.mapBlock, { backgroundColor: colors.softGreen, width: '40%' }]} />
            <View style={[styles.mapBlock, { backgroundColor: colors.warning, width: '30%', marginLeft: '5%' }]} />
            <View style={[styles.mapBlock, { backgroundColor: colors.error, width: '20%', marginTop: '5%' }]} />
            <View style={[styles.mapBlock, { backgroundColor: colors.softGreen, width: '60%', marginLeft: '25%', marginTop: '-10%' }]} />
          </View>

          <View style={styles.legendContainer}>
            {[
              { icon: 'checkmark-circle' as const, color: colors.softGreen, key: 'healthy' },
              { icon: 'warning' as const, color: colors.warning, key: 'suspicious' },
              { icon: 'information-circle' as const, color: colors.error, key: 'diseaseHotspot' },
            ].map((item) => (
              <View key={item.key} style={styles.legendItem}>
                <Ionicons name={item.icon} color={item.color} size={16} />
                <Text style={styles.legendText}>{t(item.key)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <Ionicons name="navigate" color={colors.white} size={24} />
            <Text style={styles.actionTitle}>{t('requestDroneScan')}</Text>
          </View>
          <Text style={styles.actionDesc}>{t('requestDroneDesc')}</Text>
          <TouchableOpacity style={styles.requestButton}>
            <Text style={styles.requestButtonText}>{t('submitRequest')}</Text>
            <Ionicons name="send" color={colors.primaryGreen} size={16} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: colors.cardBackground, ...shadows.soft, zIndex: 10,
  },
  headerTitle: {
    fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary,
  },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  card: { backgroundColor: colors.cardBackground, borderRadius: borderRadius.lg, padding: spacing.lg, ...shadows.soft },
  sectionTitle: {
    fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: 4,
  },
  timestamp: {
    fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.lg,
  },
  mapContainer: {
    height: 250, backgroundColor: '#E8F5E9', borderRadius: borderRadius.md,
    padding: spacing.sm, position: 'relative', overflow: 'hidden',
  },
  mapBlock: { height: '45%', borderRadius: 8, position: 'absolute', opacity: 0.8 },
  legendContainer: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg,
    paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: '#F5F5F5',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: {
    fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.medium,
  },
  actionCard: { backgroundColor: colors.primaryGreen, borderRadius: borderRadius.lg, padding: spacing.lg, ...shadows.medium },
  actionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  actionTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.white },
  actionDesc: { fontSize: typography.sizes.md, color: 'rgba(255,255,255,0.9)', lineHeight: 22, marginBottom: spacing.lg },
  requestButton: {
    backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderRadius: borderRadius.md,
  },
  requestButtonText: { fontSize: typography.sizes.md, color: colors.primaryGreen, fontWeight: typography.weights.bold },
});
