import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCinema, MovieItem, ShowtimeSlotItem } from '../../context/CinemaContext';
import {
  movieService,
  BackendMovie,
  BackendShowtime,
} from '../../services/movieService';

function formatTimeHHMM(isoStr: string): string {
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return '19:30';
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function formatDateKey(isoStr: string): string {
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

function formatDateLabel(dateKey: string): string {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3) return dateKey;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return `${dayNames[d.getDay()]} • ${parts[2].toString().padStart(2, '0')}/${parts[1].toString().padStart(2, '0')}`;
}

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const { selectShowtime } = useCinema();

  const [movie, setMovie] = useState<BackendMovie | null>(null);
  const [showtimes, setShowtimes] = useState<BackendShowtime[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedDateKey, setSelectedDateKey] = useState<string>('all');
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const movieData = await movieService.getMovieById(String(id));
      setMovie(movieData);
      const stList =
        Array.isArray(movieData.showtimes) && movieData.showtimes.length > 0
          ? movieData.showtimes
          : await movieService.getShowtimes({ movieId: movieData.id });
      setShowtimes(Array.isArray(stList) ? stList : []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể tải chi tiết bộ phim từ máy chủ.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const availableDates = useMemo(() => {
    const keys = Array.from(new Set(showtimes.map(s => formatDateKey(s.startTime)).filter(Boolean))).sort();
    return ['all', ...keys];
  }, [showtimes]);

  const availableCinemas = useMemo(() => {
    const map = new Map<string, { id: string; name: string; brand: string }>();
    for (const st of showtimes) {
      if (st.cinema) {
        map.set(st.cinema.id, {
          id: st.cinema.id,
          name: st.cinema.name,
          brand: st.cinema.brand,
        });
      }
    }
    return Array.from(map.values());
  }, [showtimes]);

  const availableFormats = useMemo(() => {
    const set = new Set<string>();
    for (const st of showtimes) {
      if (st.screeningFormat) set.add(st.screeningFormat);
    }
    return ['all', ...Array.from(set)];
  }, [showtimes]);

  const filteredShowtimesByCinema = useMemo(() => {
    const filtered = showtimes.filter(st => {
      if (selectedDateKey !== 'all' && formatDateKey(st.startTime) !== selectedDateKey) return false;
      if (selectedCinemaId !== 'all' && st.cinemaId !== selectedCinemaId) return false;
      if (selectedFormat !== 'all' && st.screeningFormat !== selectedFormat) return false;
      return true;
    });

    const grouped = new Map<
      string,
      {
        cinemaId: string;
        cinemaName: string;
        cinemaBrand: string;
        cinemaAddress: string;
        slots: BackendShowtime[];
      }
    >();

    for (const st of filtered) {
      const cid = st.cinemaId;
      const existing = grouped.get(cid) || {
        cinemaId: cid,
        cinemaName: st.cinema?.name || 'Cụm rạp V-Life',
        cinemaBrand: st.cinema?.brand || 'BETA',
        cinemaAddress: st.cinema?.address || '',
        slots: [],
      };
      existing.slots.push(st);
      grouped.set(cid, existing);
    }

    return Array.from(grouped.values());
  }, [showtimes, selectedDateKey, selectedCinemaId, selectedFormat]);

  const handleSelectSlot = (st: BackendShowtime) => {
    if (!movie) return;
    const priceNum = Number(st.basePrice) || 75000;
    const timeStr = formatTimeHHMM(st.startTime);
    const dateKey = formatDateKey(st.startTime);
    const dateLabel = formatDateLabel(dateKey);

    const movieItem: MovieItem = {
      id: movie.id,
      slug: movie.slug,
      title: movie.title,
      originalTitle: movie.originalTitle || undefined,
      description: movie.description || undefined,
      poster: movie.posterUrl,
      bannerUrl: movie.bannerUrl || undefined,
      trailerUrl: movie.trailerUrl || undefined,
      ageRating: movie.ageRating || 'T13',
      duration: `${movie.durationMin || 120} phút`,
      durationMin: movie.durationMin,
      language: movie.language || 'Tiếng Việt',
      releaseDate: movie.releaseDate || undefined,
      isShowing: movie.isShowing,
      hasTrailer: Boolean(movie.trailerUrl),
      genres: Array.isArray(movie.genres) ? movie.genres.join(', ') : '',
      showtimes: [],
    };

    selectShowtime(
      movieItem,
      st.screeningFormat || '2D',
      timeStr,
      priceNum,
      dateLabel,
      st.cinema?.name || 'Cụm rạp V-Life',
      st.auditorium?.name || 'Phòng chiếu 01',
      {
        showtimeId: st.id,
        cinemaId: st.cinemaId,
        cinemaBrand: st.cinema?.brand || 'BETA',
        startTimeIso: st.startTime,
        selectedDate: dateKey,
      }
    );
    router.push('/cinema/seat-selection');
  };

  const handleOpenTrailer = () => {
    if (movie?.trailerUrl) {
      Linking.openURL(movie.trailerUrl).catch(() => {});
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/cinema');
    }
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={false} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: theme.fontFamily }]} numberOfLines={1}>
            {movie ? movie.title : 'Chi tiết phim'}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={styles.skeletonWrap}>
              <View style={styles.skeletonBanner} />
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonText} />
              <View style={styles.skeletonText} />
            </View>
          )}

          {!loading && errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={44} color="#DC2626" />
              <Text style={styles.errorTitle}>Không thể tải thông tin phim</Text>
              <Text style={styles.errorDesc}>{errorMessage}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchDetail}>
                <Text style={styles.retryBtnText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !errorMessage && movie && (
            <>
              {/* Hero Banner + Poster */}
              <View style={styles.heroContainer}>
                <Image
                  source={{ uri: movie.bannerUrl || movie.posterUrl }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
                <View style={styles.bannerOverlay} />
                <View style={styles.heroContentRow}>
                  <Image source={{ uri: movie.posterUrl }} style={styles.posterImage} />
                  <View style={styles.heroMetaCol}>
                    <View style={styles.badgeRow}>
                      <View style={styles.ageBadge}>
                        <Text style={styles.ageBadgeText}>{movie.ageRating}</Text>
                      </View>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>
                          {movie.isShowing ? 'ĐANG CHIẾU' : 'SẮP CHIẾU'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.movieTitle}>{movie.title}</Text>
                    {movie.originalTitle ? (
                      <Text style={styles.originalTitle}>{movie.originalTitle}</Text>
                    ) : null}

                    <Text style={styles.metaText}>
                      Thể loại: {(movie.genres || []).join(', ') || 'Điện ảnh'}
                    </Text>
                    <Text style={styles.metaText}>
                      Thời lượng: {movie.durationMin} phút • Ngôn ngữ: {movie.language || 'Tiếng Việt'}
                    </Text>
                    {movie.releaseDate ? (
                      <Text style={styles.metaText}>
                        Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                      </Text>
                    ) : null}

                    {movie.trailerUrl ? (
                      <TouchableOpacity style={styles.trailerBtn} onPress={handleOpenTrailer}>
                        <Ionicons name="play-circle" size={16} color="#FFF" style={{ marginRight: 6 }} />
                        <Text style={styles.trailerBtnText}>Xem Trailer</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Nội dung phim</Text>
                <Text style={styles.descriptionText}>
                  {movie.description || 'Chưa có mô tả chi tiết cho bộ phim này.'}
                </Text>
              </View>

              {/* Filters: Date, Cinema, Format */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Lọc suất chiếu</Text>

                {/* Date Filter */}
                <Text style={styles.filterLabel}>Ngày chiếu:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                  {availableDates.map(dk => {
                    const active = selectedDateKey === dk;
                    return (
                      <TouchableOpacity
                        key={dk}
                        style={[styles.filterChip, active && styles.filterChipActive]}
                        onPress={() => setSelectedDateKey(dk)}
                      >
                        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                          {dk === 'all' ? 'Tất cả ngày' : formatDateLabel(dk)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Cinema Filter */}
                <Text style={styles.filterLabel}>Cụm rạp:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                  <TouchableOpacity
                    style={[styles.filterChip, selectedCinemaId === 'all' && styles.filterChipActive]}
                    onPress={() => setSelectedCinemaId('all')}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedCinemaId === 'all' && styles.filterChipTextActive,
                      ]}
                    >
                      Tất cả rạp ({availableCinemas.length})
                    </Text>
                  </TouchableOpacity>
                  {availableCinemas.map(cin => {
                    const active = selectedCinemaId === cin.id;
                    return (
                      <TouchableOpacity
                        key={cin.id}
                        style={[styles.filterChip, active && styles.filterChipActive]}
                        onPress={() => setSelectedCinemaId(cin.id)}
                      >
                        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                          {cin.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Format Filter */}
                <Text style={styles.filterLabel}>Định dạng:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                  {availableFormats.map(fmt => {
                    const active = selectedFormat === fmt;
                    return (
                      <TouchableOpacity
                        key={fmt}
                        style={[styles.filterChip, active && styles.filterChipActive]}
                        onPress={() => setSelectedFormat(fmt)}
                      >
                        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                          {fmt === 'all' ? 'Tất cả định dạng' : fmt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Showtimes grouped by Cinema */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Danh sách suất chiếu ({showtimes.length})</Text>

                {filteredShowtimesByCinema.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Ionicons name="calendar-clear-outline" size={36} color="#94A3B8" />
                    <Text style={styles.emptyText}>
                      Không có suất chiếu phù hợp với bộ lọc đang chọn.
                    </Text>
                  </View>
                ) : (
                  filteredShowtimesByCinema.map(group => (
                    <View key={group.cinemaId} style={styles.cinemaGroupBox}>
                      <View style={styles.cinemaGroupHeader}>
                        <View style={styles.brandTag}>
                          <Text style={styles.brandTagText}>{group.cinemaBrand}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cinemaGroupName}>{group.cinemaName}</Text>
                          {group.cinemaAddress ? (
                            <Text style={styles.cinemaGroupAddr} numberOfLines={1}>
                              {group.cinemaAddress}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      <View style={styles.slotGrid}>
                        {group.slots.map(st => {
                          const priceNum = Number(st.basePrice) || 75000;
                          return (
                            <TouchableOpacity
                              key={st.id}
                              style={styles.slotButton}
                              onPress={() => handleSelectSlot(st)}
                            >
                              <Text style={styles.slotTimeText}>{formatTimeHHMM(st.startTime)}</Text>
                              <Text style={styles.slotFormatText}>{st.screeningFormat}</Text>
                              <Text style={styles.slotPriceText}>
                                {priceNum.toLocaleString('vi-VN')}đ
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { paddingVertical: 20 }),
  },
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', width: '100%' },
  desktopFrame: {
    maxWidth: 390,
    maxHeight: 844,
    aspectRatio: 390 / 844,
    borderWidth: 12,
    borderColor: '#000',
    borderRadius: 44,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  container: { flex: 1 },
  skeletonWrap: { padding: 16, gap: 12 },
  skeletonBanner: { height: 200, borderRadius: 16, backgroundColor: '#E2E8F0' },
  skeletonTitle: { height: 24, width: '70%', borderRadius: 6, backgroundColor: '#E2E8F0' },
  skeletonText: { height: 14, width: '90%', borderRadius: 6, backgroundColor: '#F1F5F9' },
  errorBox: { margin: 16, padding: 24, backgroundColor: '#FEF2F2', borderRadius: 16, alignItems: 'center' },
  errorTitle: { fontSize: 16, fontWeight: '800', color: '#991B1B', marginTop: 8 },
  errorDesc: { fontSize: 13, color: '#B91C1C', textAlign: 'center', marginTop: 4 },
  retryBtn: { marginTop: 12, backgroundColor: '#DC2626', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 18 },
  retryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  heroContainer: { backgroundColor: '#0F172A', paddingBottom: 16, position: 'relative' },
  bannerImage: { width: '100%', height: 150, opacity: 0.35 },
  bannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.65)' },
  heroContentRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: -70 },
  posterImage: {
    width: 105,
    height: 154,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#334155',
  },
  heroMetaCol: { flex: 1, marginLeft: 14, justifyContent: 'flex-end' },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  ageBadge: { backgroundColor: '#E11D48', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  ageBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  statusBadge: { backgroundColor: '#22C55E', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  statusBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  movieTitle: { color: '#FFF', fontSize: 17, fontWeight: '800', lineHeight: 22 },
  originalTitle: { color: '#CBD5E1', fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  metaText: { color: '#E2E8F0', fontSize: 11, marginTop: 4 },
  trailerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E11D48',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  trailerBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  sectionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 14,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  descriptionText: { fontSize: 13, color: '#475569', lineHeight: 20 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 8, marginBottom: 6 },
  filterRow: { flexDirection: 'row', marginBottom: 4 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  filterChipTextActive: { color: '#FFF', fontWeight: '700' },

  emptyBox: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 13, color: '#64748B', marginTop: 8, textAlign: 'center' },

  cinemaGroupBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cinemaGroupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  brandTag: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  brandTagText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  cinemaGroupName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  cinemaGroupAddr: { fontSize: 11, color: '#64748B' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotButton: {
    width: '30%',
    borderWidth: 1,
    borderColor: '#E11D48',
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  slotTimeText: { fontSize: 14, fontWeight: '800', color: '#BE123C' },
  slotFormatText: { fontSize: 10, fontWeight: '600', color: '#475569', marginTop: 2 },
  slotPriceText: { fontSize: 11, fontWeight: '700', color: '#0F172A', marginTop: 2 },
});
