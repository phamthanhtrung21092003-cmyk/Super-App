import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCinema, MOCK_COMBOS } from '../../context/CinemaContext';

export default function ConcessionsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const { booking, updateComboQuantity, getGrandTotal } = useCinema();
  const [activeTab, setActiveTab] = useState('all');

  const movie = booking.movie || {
    title: 'Conan Movie 29 (2026): Thiên Thần Sa Ngã Trên Xa Lộ',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
  };

  const hasCombosSelected = booking.selectedCombos.length > 0;
  const grandTotal = getGrandTotal();

  const handleNextStep = () => {
    router.push('/cinema/checkout');
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/cinema/seat-selection');
    }
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFDFD" translucent={false} />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtnRow}>
            <Ionicons name="arrow-back" size={20} color="#64748B" />
            <Text style={[styles.backBtnText, { fontFamily: theme.fontFamily }]}>
              Quay lại chọn ghế
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Moveek Film-Strip Header Component */}
          <View style={styles.filmHeaderContainer}>
            <View style={styles.filmHolesRow}>
              {[...Array(12)].map((_, i) => (
                <View key={i} style={styles.filmHole} />
              ))}
            </View>

            <View style={styles.filmContentRow}>
              <Image source={{ uri: movie.poster }} style={styles.filmPoster} />
              <View style={styles.filmMetaColumn}>
                <View style={styles.filmTagBadge}>
                  <Text style={styles.filmTagText}>
                    {booking.format || '2D LỒNG TIẾNG'} · {booking.ageRating || 'T13'}
                  </Text>
                </View>

                <Text style={[styles.filmTitle, { fontFamily: theme.fontFamily }]} numberOfLines={2}>
                  {movie.title}
                </Text>

                <View style={styles.filmInfoDetailRow}>
                  <Ionicons name="time-outline" size={14} color="#CBD5E1" style={{ marginRight: 4 }} />
                  <Text style={styles.filmInfoDetailText}>
                    {booking.time || '17:30'} · {booking.dateLabel || 'Thứ Hai · 27/07'}
                  </Text>
                </View>

                <View style={styles.filmInfoDetailRow}>
                  <Ionicons name="location-outline" size={14} color="#CBD5E1" style={{ marginRight: 4 }} />
                  <Text style={styles.filmInfoDetailText}>
                    {booking.cinemaName || 'Beta Xuân Thủy'}   {booking.roomName || 'Phòng chiếu P7'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.filmHolesRow}>
              {[...Array(12)].map((_, i) => (
                <View key={i} style={styles.filmHole} />
              ))}
            </View>
          </View>

          {/* Filter Category Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.filterTabPill, activeTab === 'all' && styles.filterTabPillActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.filterTabText, activeTab === 'all' && styles.filterTabTextActive]}>
                Tất cả (2)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTabPill, activeTab === 'combo1' && styles.filterTabPillActive]}
              onPress={() => setActiveTab('combo1')}
            >
              <Text style={[styles.filterTabText, activeTab === 'combo1' && styles.filterTabTextActive]}>
                COMBO030158-09 (1)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTabPill, activeTab === 'combo2' && styles.filterTabPillActive]}
              onPress={() => setActiveTab('combo2')}
            >
              <Text style={[styles.filterTabText, activeTab === 'combo2' && styles.filterTabTextActive]}>
                COMBO GIA ĐÌNH
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Combo List Cards */}
          <View style={styles.comboList}>
            {MOCK_COMBOS.map(combo => {
              const selectedItem = booking.selectedCombos.find(c => c.id === combo.id);
              const qty = selectedItem ? selectedItem.quantity : 0;

              return (
                <View key={combo.id} style={styles.comboCard}>
                  <View style={styles.comboIconBox}>
                    <Ionicons name="fast-food" size={32} color="#FFF" />
                  </View>

                  <View style={styles.comboInfoColumn}>
                    <Text style={[styles.comboName, { fontFamily: theme.fontFamily }]}>
                      {combo.name}
                    </Text>

                    <Text style={styles.comboDesc} numberOfLines={2}>
                      {combo.description}
                    </Text>

                    <Text style={styles.comboPriceText}>
                      {combo.price.toLocaleString('vi-VN')} đ
                    </Text>
                  </View>

                  {/* Add / Counter Button */}
                  {qty === 0 ? (
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => updateComboQuantity(combo.id, 1)}
                    >
                      <Text style={[styles.addBtnText, { fontFamily: theme.fontFamily }]}>
                        + Thêm
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.counterRow}>
                      <TouchableOpacity
                        style={styles.counterBtn}
                        onPress={() => updateComboQuantity(combo.id, -1)}
                      >
                        <Ionicons name="remove" size={16} color="#E11D48" />
                      </TouchableOpacity>

                      <Text style={styles.counterValueText}>{qty}</Text>

                      <TouchableOpacity
                        style={styles.counterBtn}
                        onPress={() => updateComboQuantity(combo.id, 1)}
                      >
                        <Ionicons name="add" size={16} color="#E11D48" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomInfoColumn}>
            <Text style={styles.bottomLabelText}>TỔNG TẠM TÍNH</Text>
            <Text style={styles.bottomPriceText}>
              {grandTotal.toLocaleString('vi-VN')} đ
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleNextStep}>
            <Text style={[styles.primaryBtnText, { fontFamily: theme.fontFamily }]}>
              {hasCombosSelected ? 'Tiếp tục ➔' : 'Bỏ qua ➔'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 20 }) },
  safeArea: { flex: 1, backgroundColor: '#FFFDFD', width: '100%' },
  desktopFrame: { maxWidth: 390, maxHeight: 844, aspectRatio: 390 / 844, borderWidth: 12, borderColor: '#000000', borderRadius: 44, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },

  header: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFDFD' },
  backBtnRow: { flexDirection: 'row', alignItems: 'center' },
  backBtnText: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginLeft: 6 },

  container: { flex: 1, paddingHorizontal: 16 },

  /* Moveek Film Strip Header Card */
  filmHeaderContainer: { backgroundColor: '#18181B', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 16 },
  filmHolesRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginVertical: 4 },
  filmHole: { width: 14, height: 8, borderRadius: 2, backgroundColor: '#000' },
  filmContentRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  filmPoster: { width: 64, height: 90, borderRadius: 10, backgroundColor: '#3F3F46' },
  filmMetaColumn: { flex: 1, marginLeft: 12 },
  filmTagBadge: { backgroundColor: '#BE123C', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 6 },
  filmTagText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  filmTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', lineHeight: 20, marginBottom: 6 },
  filmInfoDetailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  filmInfoDetailText: { color: '#D4D4D8', fontSize: 12, fontWeight: '500' },

  /* Filter Tabs */
  tabsContainer: { flexDirection: 'row', marginBottom: 16 },
  filterTabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFF', marginRight: 8 },
  filterTabPillActive: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
  filterTabText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  filterTabTextActive: { color: '#FFF' },

  /* Combo List */
  comboList: { marginTop: 4 },
  comboCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  comboIconBox: { width: 64, height: 64, borderRadius: 14, backgroundColor: '#EA580C', alignItems: 'center', justifyContent: 'center' },
  comboInfoColumn: { flex: 1, marginLeft: 12, paddingRight: 8 },
  comboName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  comboDesc: { fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 15 },
  comboPriceText: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginTop: 6 },

  addBtn: { borderWidth: 1.5, borderColor: '#E11D48', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#E11D48', fontSize: 13, fontWeight: '700' },

  counterRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E11D48', borderRadius: 20, paddingHorizontal: 4, paddingVertical: 2 },
  counterBtn: { padding: 4 },
  counterValueText: { fontSize: 14, fontWeight: '700', color: '#0F172A', paddingHorizontal: 8 },

  /* Bottom Bar */
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9', boxShadow: '0 -4px 12px rgba(0,0,0,0.06)' },
  bottomInfoColumn: {},
  bottomLabelText: { fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  bottomPriceText: { fontSize: 20, fontWeight: '800', color: '#E11D48', marginTop: 2 },
  primaryBtn: { backgroundColor: '#E11D48', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
