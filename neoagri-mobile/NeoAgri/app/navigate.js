import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { calculateDistance, calculateBearing, getDirectionText } from '../utils/haversine';
import { getAllMarkers } from '../db/schema';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function NavigationScreen() {
  const [location, setLocation] = useState(null);
  const [nearestMarker, setNearestMarker] = useState(null);
  const [distance, setDistance] = useState(null);
  const [direction, setDirection] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const locationSubscription = useRef(null);
  const lastSpokenRef = useRef(0);

  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  const startNavigation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission to access location was denied");
      return;
    }

    const markers = getAllMarkers();
    if (markers.length === 0) {
      Speech.speak('खेत में कोई बीमारी नहीं मिली।', { language: 'hi-IN' });
      Alert.alert("No disease markers found in database.");
      return;
    }

    Speech.speak('मार्गदर्शन शुरू हो रहा है।', { language: 'hi-IN' });
    setIsNavigating(true);

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,
        distanceInterval: 1,
      },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        setLocation(loc.coords);

        let minDistance = Infinity;
        let closest = null;
        let bestBearing = 0;

        markers.forEach(marker => {
          const dist = calculateDistance(latitude, longitude, marker.lat, marker.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closest = marker;
            bestBearing = calculateBearing(latitude, longitude, marker.lat, marker.lng);
          }
        });

        if (closest) {
          setNearestMarker(closest);
          setDistance(Math.round(minDistance));
          const dirText = getDirectionText(bestBearing);
          setDirection(dirText);

          const now = Date.now();
          if (now - lastSpokenRef.current > 10000) {
            if (minDistance < 5) {
              Speech.speak('आप लक्ष्य पर पहुँच गए हैं। कृपया फसल को स्कैन करें।', { language: 'hi-IN' });
              stopNavigation();
              return;
            } else {
              Speech.speak(`${dirText} की ओर ${Math.round(minDistance)} मीटर चलें।`, { language: 'hi-IN' });
            }
            lastSpokenRef.current = now;
          }
        }
      }
    );
  };

  const stopNavigation = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsNavigating(false);
    Speech.stop();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ड्रोन नेविगेशन</Text>
        <View style={{ width: 40 }} />
      </View>

      {isNavigating ? (
        <View style={styles.content}>
          {nearestMarker && (
            <View style={styles.activeNavCard}>
              <View style={styles.diseaseBadge}>
                <Ionicons name="warning" size={20} color="#fff" />
                <Text style={styles.diseaseText}>{nearestMarker.disease}</Text>
              </View>

              <View style={styles.radarContainer}>
                <View style={styles.radarCircle1}>
                  <View style={styles.radarCircle2}>
                    <View style={styles.radarCenter}>
                      <Ionicons name="navigate" size={40} color="#fff" style={{ transform: [{ rotate: '45deg' }] }} />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Ionicons name="compass-outline" size={24} color="#3498db" />
                  <Text style={styles.statLabel}>दिशा</Text>
                  <Text style={styles.statValue}>{direction}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Ionicons name="location-outline" size={24} color="#e74c3c" />
                  <Text style={styles.statLabel}>दूरी</Text>
                  <Text style={styles.statValue}>{distance}m</Text>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity style={[styles.btn, styles.btnStop]} onPress={stopNavigation}>
             <Ionicons name="close-circle" size={24} color="#fff" />
             <Text style={styles.btnText}>नेविगेशन रोकें (Stop)</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.idleContent}>
          <View style={styles.illustrationBox}>
             <Ionicons name="map-outline" size={100} color="#bdc3c7" />
             <Ionicons name="location" size={40} color="#e74c3c" style={{ position: 'absolute', top: '30%', right: '35%' }} />
          </View>
          <Text style={styles.idleTitle}>खेत में बीमारी ढूंढें</Text>
          <Text style={styles.idleSubtitle}>
            ड्रोन द्वारा चिन्हित किए गए बीमार पौधों तक पहुंचने के लिए GPS नेविगेशन चालू करें।
          </Text>
          
          <TouchableOpacity style={styles.btnStart} onPress={startNavigation}>
             <Text style={styles.btnStartText}>नेविगेशन शुरू करें (Start)</Text>
             <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  activeNavCard: {
    backgroundColor: '#f8f9f9',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    flex: 1,
    marginBottom: 20,
  },
  diseaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30,
  },
  diseaseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  radarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarCircle1: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(41, 128, 185, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarCircle2: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(41, 128, 185, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2980b9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 15,
  },
  statLabel: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  btn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  btnStop: {
    backgroundColor: '#e74c3c',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  idleContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  illustrationBox: {
    marginBottom: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  idleSubtitle: {
    fontSize: 15,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  btnStart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 16,
    width: '100%',
    elevation: 3,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  btnStartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  }
});
