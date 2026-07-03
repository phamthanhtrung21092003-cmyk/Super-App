import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  TextInput, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function RideSearch() {
  const router = useRouter();
  const [pickup, setPickup] = useState('Vị trí hiện tại');
  const [destination, setDestination] = useState('');
  const [region, setRegion] = useState({
    latitude: 21.028511,
    longitude: 105.804817,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* Top Search Area */}
        <View style={styles.searchHeader}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chọn điểm đến</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.timeline}>
              <View style={styles.dotBlue} />
              <View style={styles.line} />
              <View style={styles.dotRed} />
            </View>
            <View style={styles.inputs}>
              <TextInput
                style={styles.inputBox}
                value={pickup}
                onChangeText={setPickup}
                placeholder="Điểm đón"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={[styles.inputBox, styles.inputBoxActive]}
                value={destination}
                onChangeText={setDestination}
                placeholder="Bạn muốn đi đâu?"
                placeholderTextColor="#94A3B8"
                autoFocus
              />
            </View>
            <TouchableOpacity style={styles.addStopBtn}>
              <Ionicons name="add" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Map Area */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
            // provider={PROVIDER_GOOGLE}
          >
            <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
          </MapView>
          
          {/* Mock AI Suggestion for Search */}
          {destination.toLowerCase().includes('royal') && (
            <View style={styles.aiFloatingBubble}>
              <Ionicons name="sparkles" size={16} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.aiFloatingText}>Ý bạn là Royal City hay Royal Hotel?</Text>
            </View>
          )}
        </View>

        {/* Suggestions List */}
        <ScrollView style={styles.suggestionsList}>
          <TouchableOpacity style={styles.suggestionItem} onPress={() => router.push('/ride/booking')}>
            <View style={styles.suggestionIcon}>
              <Ionicons name="business" size={20} color="#475569" />
            </View>
            <View style={styles.suggestionInfo}>
              <Text style={styles.suggestionName}>Royal City</Text>
              <Text style={styles.suggestionAddress}>72A Nguyễn Trãi, Thanh Xuân</Text>
            </View>
            <View style={styles.aiTag}>
              <Text style={styles.aiTagText}>Gần nhất</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.suggestionItem} onPress={() => router.push('/ride/booking')}>
            <View style={styles.suggestionIcon}>
              <Ionicons name="bed" size={20} color="#475569" />
            </View>
            <View style={styles.suggestionInfo}>
              <Text style={styles.suggestionName}>Royal Hotel</Text>
              <Text style={styles.suggestionAddress}>15 Ba Đình, Hà Nội</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  searchHeader: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, zIndex: 10 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  timeline: { alignItems: 'center', marginRight: 16, width: 12 },
  dotBlue: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6' },
  line: { width: 2, height: 40, backgroundColor: '#E2E8F0', marginVertical: 4 },
  dotRed: { width: 10, height: 10, backgroundColor: '#EF4444' }, // Square for destination
  
  inputs: { flex: 1, gap: 12 },
  inputBox: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, fontSize: 16, color: '#0F172A', fontWeight: '500' },
  inputBoxActive: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#10B981' },
  addStopBtn: { padding: 12, marginLeft: 8 },
  
  mapContainer: { flex: 1, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  
  aiFloatingBubble: { position: 'absolute', top: 16, left: 16, right: 16, backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', elevation: 4, shadowColor: '#10B981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  aiFloatingText: { color: '#0F172A', fontWeight: '500', fontSize: 14, flex: 1 },
  
  suggestionsList: { height: 250, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, padding: 20, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  suggestionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  suggestionInfo: { flex: 1 },
  suggestionName: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  suggestionAddress: { fontSize: 13, color: '#64748B' },
  aiTag: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  aiTagText: { color: '#10B981', fontSize: 11, fontWeight: 'bold' }
});
