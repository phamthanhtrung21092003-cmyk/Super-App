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
  TextInput,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCinema, MovieItem, ShowtimeSlotItem } from '../context/CinemaContext';
import {
  movieService,
  BackendMovie,
  BackendCinema,
  BackendShowtime,
} from '../services/movieService';

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

const CINEMA_BRANDS = [
  { id: 'all', name: 'Tất cả', color: '#E11D48' },
  { id: 'CGV', name: 'CGV', color: '#DC2626' },
  { id: 'LOTTE', name: 'Lotte', color: '#E11D48' },
  { id: 'GALAXY', name: 'Galaxy', color: '#EA580C' },
  { id: 'BETA', name: 'Beta', color: '#2563EB' },
  { id: 'BHD', name: 'BHD Star', color: '#16A34A' },
  { id: 'CINESTAR', name: 'Cinestar', color: '#7C3AED' },
];

function formatDuration(minutes?: number): string {
  if (!minutes || minutes <= 0) return '120 phút';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h${mins.toString().padStart(2, '0')}' (${minutes}p)` : `${minutes} phút`;
}

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

function formatDateLabel(dateKey: string): { dateStr: string; dayStr: string; fullLabel: string } {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3) {
    return { dateStr: dateKey, dayStr: 'Hôm nay', fullLabel: dateKey };
  }
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dateStr = `${parts[2].toString().padStart(2, '0')}/${parts[1].toString().padStart(2, '0')}`;
  const dayStr = dayNames[d.getDay()] || 'Hôm nay';
  return {
    dateStr,
    dayStr,
    fullLabel: `${dayStr} • ${dateStr}/${parts[0]}`,
  };
}

export default function CinemaShowtimesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const { selectShowtime } = useCinema();

  const [movies, setMovies] = useState<BackendMovie[]>([]);
  const [cinemas, setCinemas] = useState<BackendCinema[]>([]);
  const [showtimes, setShowtimes] = useState<BackendShowtime[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>('all');
  const [selectedDateKey, setSelectedDateKey] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCinemaModal, setShowCinemaModal] = useState<boolean>(false);

  const fetchMovieHomeData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [moviesData, cinemasData, showtimesData] = await Promise.all([
        movieService.getMovies(),
        movieService.getCinemas(),
        movieService.getShowtimes(),
      ]);
      setMovies(Array.isArray(moviesData) ? moviesData : []);
      setCinemas(Array.isArray(cinemasData) ? cinemasData : []);
      setShowtimes(Array.isArray(showtimesData) ? showtimesData : []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể tải dữ liệu phim và lịch chiếu từ máy chủ.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovieHomeData();
  }, [fetchMovieHomeData]);

  // Available date tabs built from real showtimes (plus "Tất cả ngày")
  const dateTabs = useMemo(() => {
    const uniqueKeys = Array.from(
      new Set(showtimes.map(st => formatDateKey(st.startTime)).filter(Boolean))
    ).sort();
    return [
      { key: 'all', dateStr: 'Tất cả', dayStr: 'Lịch chiếu', fullLabel: 'Tất cả ngày chiếu' },
      ...uniqueKeys.map(k => ({ key: k, ...formatDateLabel(k) })),
    ];
  }, [showtimes]);

  // Filtered cinemas for modal & header
  const filteredCinemas = useMemo(() => {
    return cinemas.filter(c => {
      if (selectedBrandId !== 'all' && c.brand !== selectedBrandId) return false;
      if (searchQuery.trim()) {
        const q = removeVietnameseTones(searchQuery);
        const target = removeVietnameseTones(`${c.name} ${c.city} ${c.address} ${c.brand}`);
        if (!target.includes(q)) return false;
      }
      return true;
    });
  }, [cinemas, selectedBrandId, searchQuery]);

  const activeCinema = useMemo(() => {
    if (selectedCinemaId === 'all') return null;
    return cinemas.find(c => c.id === selectedCinemaId) || null;
  }, [cinemas, selectedCinemaId]);

  // Combine movies with their matching showtimes from Backend
  const movieItems: MovieItem[] = useMemo(() => {
    return movies
      .filter(m => {
        if (!searchQuery.trim()) return true;
        const q = removeVietnameseTones(searchQuery);
        const target = removeVietnameseTones(
          `${m.title} ${m.originalTitle || ''} ${(m.genres || []).join(' ')}`
        );
        return target.includes(q);
      })
      .map(m => {
        const matchingShowtimes = showtimes.filter(st => {
          if (st.movieId !== m.id) return false;
          if (selectedCinemaId !== 'all' && st.cinemaId !== selectedCinemaId) return false;
          if (selectedBrandId !== 'all') {
            const cinemaObj = st.cinema || cinemas.find(c => c.id === st.cinemaId);
            if (cinemaObj && cinemaObj.brand !== selectedBrandId) return false;
          }
          if (selectedDateKey !== 'all' && formatDateKey(st.startTime) !== selectedDateKey) {
            return false;
          }
          return true;
        });

        // Group showtimes by format + cinemaName
        const formatMap = new Map<string, ShowtimeSlotItem[]>();
        for (const st of matchingShowtimes) {
          const cinemaObj = st.cinema || cinemas.find(c => c.id === st.cinemaId);
          const audName = st.auditorium?.name || 'Phòng chiếu 01';
          const groupTitle = `${st.screeningFormat || '2D'} • ${cinemaObj?.name || 'Rạp V-Life'} (${audName})`;
          const priceNum = Number(st.basePrice) || 75000;
          const slot: ShowtimeSlotItem = {
            showtimeId: st.id,
            cinemaId: st.cinemaId,
            cinemaName: cinemaObj?.name || 'Rạp V-Life',
            cinemaBrand: cinemaObj?.brand || 'BETA',
            auditoriumName: audName,
            time: formatTimeHHMM(st.startTime),
            startTimeIso: st.startTime,
            price: priceNum,
            priceText: `${Math.round(priceNum / 1000)}K`,
            available: st.isActive !== false,
          };
          const existing = formatMap.get(groupTitle) || [];
          existing.push(slot);
          formatMap.set(groupTitle, existing);
        }

        return {
          id: m.id,
          slug: m.slug,
          title: m.title,
          originalTitle: m.originalTitle || undefined,
          description: m.description || undefined,
          poster: m.posterUrl,
          bannerUrl: m.bannerUrl || undefined,
          trailerUrl: m.trailerUrl || undefined,
          ageRating: m.ageRating || 'T13',
          duration: formatDuration(m.durationMin),
          durationMin: m.durationMin,
          language: m.language || 'Tiếng Việt',
          subtitle: m.subtitle || undefined,
          releaseDate: m.releaseDate || undefined,
          isShowing: m.isShowing,
          hasTrailer: Boolean(m.trailerUrl),
          genres: Array.isArray(m.genres) ? m.genres.join(', ') : '',
          showtimes: Array.from(formatMap.entries()).map(([format, times]) => ({
            format,
            times,
          })),
        };
      });
  }, [movies, showtimes, cinemas, selectedCinemaId, selectedBrandId, selectedDateKey, searchQuery]);

  const handleOpenMovieDetail = (movieId: string) => {
    router.push(`/cinema/${movieId}` as any);
  };

  const handleSelectShowtime = (movie: MovieItem, formatGroup: string, slot: ShowtimeSlotItem) => {
    const dateKey = formatDateKey(slot.startTimeIso);
    const dateInfo = formatDateLabel(dateKey);
    selectShowtime(
      movie,
      formatGroup.split(' • ')[0] || '2D',
      slot.time,
      slot.price,
      dateInfo.fullLabel,
      slot.cinemaName,
      slot.auditoriumName,
      {
        showtimeId: slot.showtimeId,
        cinemaId: slot.cinemaId,
        cinemaBrand: slot.cinemaBrand,
        startTimeIso: slot.startTimeIso,
        selectedDate: dateInfo.dateStr,
      }
    );
    router.push('/cinema/seat-selection');
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { fontFamily: theme.fontFamily }]}>Đặt vé xem phim</Text>
            <TouchableOpacity
              style={styles.cinemaLocationBadge}
              onPress={() => setShowCinemaModal(true)}
            >
              <Ionicons name="location-sharp" size={13} color="#DC2626" />
              <Text style={styles.cinemaLocationText} numberOfLines={1}>
                {activeCinema ? `${activeCinema.city} • ${activeCinema.name}` : 'Tất cả cụm rạp liên kết'}
              </Text>
              <Ionicons name="chevron-down" size={13} color="#64748B" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.myTicketsBtn}
            onPress={() => router.push('/cinema/tickets' as any)}
          >
            <Ionicons name="ticket-outline" size={18} color="#E11D48" />
            <Text style={styles.myTicketsText}>Vé của tôi</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchAreaBar}>
          <View style={styles.searchAreaInputBox}>
            <Ionicons name="search-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm tên phim, thể loại hoặc cụm rạp..."
              placeholderTextColor="#94A3B8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Cinema Brands Filter Bar */}
        <View style={styles.brandsBarContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandsList}>
            {CINEMA_BRANDS.map(brand => {
              const isSelected = brand.id === selectedBrandId;
              return (
                <TouchableOpacity
                  key={brand.id}
                  style={[
                    styles.brandChip,
                    isSelected && { backgroundColor: brand.color, borderColor: brand.color },
                  ]}
                  onPress={() => {
                    setSelectedBrandId(brand.id);
                    setSelectedCinemaId('all');
                  }}
                >
                  <Text style={[styles.brandChipText, isSelected && styles.brandChipTextActive]}>
                    {brand.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Date Selector */}
        <View style={styles.dateSelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
            {dateTabs.map(tab => {
              const isSelected = tab.key === selectedDateKey;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.dateTab, isSelected && styles.dateTabActive]}
                  onPress={() => setSelectedDateKey(tab.key)}
                >
                  <Text style={[styles.dateText, isSelected && styles.dateTextActive]}>
                    {tab.dateStr}
                  </Text>
                  <Text style={[styles.dayText, isSelected && styles.dayTextActive]} numberOfLines={1}>
                    {tab.dayStr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Skeleton Loading State */}
          {loading && (
            <View style={styles.skeletonList}>
              {[1, 2, 3].map(idx => (
                <View key={idx} style={styles.skeletonCard}>
                  <View style={styles.skeletonRow}>
                    <View style={styles.skeletonPoster} />
                    <View style={styles.skeletonMetaCol}>
                      <View style={styles.skeletonLineWide} />
                      <View style={styles.skeletonLineMedium} />
                      <View style={styles.skeletonLineShort} />
                      <View style={styles.skeletonLineMedium} />
                    </View>
                  </View>
                  <View style={styles.skeletonSlotsRow}>
                    <View style={styles.skeletonSlot} />
                    <View style={styles.skeletonSlot} />
                    <View style={styles.skeletonSlot} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Error State with Retry */}
          {!loading && errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="cloud-offline-outline" size={48} color="#DC2626" />
              <Text style={styles.errorTitle}>Không thể tải dữ liệu rạp phim</Text>
              <Text style={styles.errorSubText}>{errorMessage}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchMovieHomeData}>
                <Ionicons name="refresh" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.retryBtnText}>Thử lại (Retry)</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!loading && !errorMessage && movieItems.length === 0 && (
            <View style={styles.emptyResultsBox}>
              <Ionicons name="film-outline" size={52} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Không có dữ liệu</Text>
              <Text style={styles.emptyResultsText}>
                Hiện chưa có bộ phim hoặc suất chiếu nào khớp với bộ lọc bạn chọn.
              </Text>
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => {
                  setSelectedBrandId('all');
                  setSelectedCinemaId('all');
                  setSelectedDateKey('all');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.resetFilterBtnText}>Xóa bộ lọc</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Real Movie & Showtime Cards */}
          {!loading &&
            !errorMessage &&
            movieItems.map(movie => (
              <View key={movie.id} style={styles.movieCard}>
                <TouchableOpacity
                  style={styles.movieHeaderRow}
                  activeOpacity={0.85}
                  onPress={() => handleOpenMovieDetail(movie.id)}
                >
                  <Image source={{ uri: movie.poster }} style={styles.moviePoster} />
                  <View style={styles.movieInfoColumn}>
                    <View style={styles.badgeRow}>
                      <View style={styles.ageBadge}>
                        <Text style={styles.ageBadgeText}>{movie.ageRating}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          movie.isShowing === false && styles.statusBadgeComingSoon,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            movie.isShowing === false && styles.statusBadgeTextComingSoon,
                          ]}
                        >
                          {movie.isShowing === false ? 'Sắp chiếu' : 'Đang chiếu'}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.movieTitle, { fontFamily: theme.fontFamily }]}>
                      {movie.title}
                    </Text>

                    {movie.originalTitle ? (
                      <Text style={styles.originalTitleText} numberOfLines={1}>
                        {movie.originalTitle}
                      </Text>
                    ) : null}

                    <Text style={styles.genresText} numberOfLines={1}>
                      Thể loại: {movie.genres || 'Điện ảnh'}
                    </Text>

                    <View style={styles.movieMetaRow}>
                      <Text style={styles.movieSubTitle}>⏱ {movie.duration}</Text>
                      <Text style={styles.movieSubTitle}> • 🗣 {movie.language}</Text>
                    </View>

                    {movie.releaseDate ? (
                      <Text style={styles.releaseDateText}>
                        Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                      </Text>
                    ) : null}

                    <View style={styles.detailActionRow}>
                      <Text style={styles.detailLinkText}>Xem chi tiết phim & lịch chiếu →</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Showtimes grouped by format/cinema */}
                {movie.showtimes.length === 0 ? (
                  <View style={styles.noShowtimeBanner}>
                    <Text style={styles.noShowtimeText}>
                      Chưa có suất chiếu cho bộ lọc hiện tại. Bấm vào phim để xem tất cả rạp.
                    </Text>
                  </View>
                ) : (
                  movie.showtimes.map((fmtGroup, idx) => (
                    <View key={idx} style={styles.formatSection}>
                      <Text style={styles.formatTitle}>{fmtGroup.format}</Text>
                      <View style={styles.showtimesGrid}>
                        {fmtGroup.times.map(slot => (
                          <TouchableOpacity
                            key={slot.showtimeId}
                            disabled={!slot.available}
                            style={
                              slot.available
                                ? styles.showtimeActiveBox
                                : styles.showtimeDisabledBox
                            }
                            onPress={() =>
                              handleSelectShowtime(movie, fmtGroup.format, slot)
                            }
                          >
                            <Text
                              style={
                                slot.available
                                  ? styles.showtimeActiveTime
                                  : styles.showtimeDisabledText
                              }
                            >
                              {slot.time}
                            </Text>
                            <Text style={styles.showtimePriceText}>{slot.priceText}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))
                )}
              </View>
            ))}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Cinema Selector Modal */}
        <Modal visible={showCinemaModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Chọn Cụm Rạp Liên Kết V-Life</Text>
                <TouchableOpacity
                  onPress={() => setShowCinemaModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={24} color="#0F172A" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.branchListContainer}>
                <TouchableOpacity
                  style={[
                    styles.richBranchCard,
                    selectedCinemaId === 'all' && styles.richBranchCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedCinemaId('all');
                    setShowCinemaModal(false);
                  }}
                >
                  <Text style={styles.branchNameText}>Tất cả cụm rạp trên hệ thống</Text>
                  <Text style={styles.branchAddressText}>
                    Hiển thị toàn bộ lịch chiếu từ các đối tác CGV, Lotte, Galaxy, Beta, BHD, Cinestar
                  </Text>
                </TouchableOpacity>

                {filteredCinemas.map(c => {
                  const isSelected = c.id === selectedCinemaId;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.richBranchCard,
                        isSelected && styles.richBranchCardSelected,
                      ]}
                      onPress={() => {
                        setSelectedCinemaId(c.id);
                        setShowCinemaModal(false);
                      }}
                    >
                      <View style={styles.branchHeaderRow}>
                        <View style={styles.brandBadge}>
                          <Text style={styles.brandBadgeText}>{c.brand}</Text>
                        </View>
                        <Text style={styles.branchNameText}>{c.name}</Text>
                      </View>
                      <Text style={styles.branchAddressText}>
                        {c.address} ({c.city})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    borderColor: '#000000',
    borderRadius: 44,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 4 },
  headerCenter: { alignItems: 'center', flex: 1, marginHorizontal: 6 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  cinemaLocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 2,
    maxWidth: 220,
  },
  cinemaLocationText: { fontSize: 11, fontWeight: '700', color: '#DC2626', marginLeft: 4 },
  myTicketsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  myTicketsText: { fontSize: 11, fontWeight: '700', color: '#E11D48', marginLeft: 4 },
  searchAreaBar: {
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchAreaInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A' },
  brandsBarContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandsList: { paddingHorizontal: 12, flexDirection: 'row' },
  brandChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    marginRight: 8,
  },
  brandChipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  brandChipTextActive: { color: '#FFF' },
  dateSelectorContainer: { backgroundColor: '#E2E8F0', paddingVertical: 6 },
  dateList: { paddingHorizontal: 8, flexDirection: 'row' },
  dateTab: {
    minWidth: 68,
    paddingHorizontal: 8,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTabActive: { backgroundColor: '#E11D48' },
  dateText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  dateTextActive: { color: '#FFF' },
  dayText: { fontSize: 11, fontWeight: '500', color: '#64748B', marginTop: 2 },
  dayTextActive: { color: '#FFE4E6' },
  container: { flex: 1, paddingHorizontal: 14, paddingTop: 12 },

  /* Skeleton Styles */
  skeletonList: { gap: 14 },
  skeletonCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skeletonRow: { flexDirection: 'row', marginBottom: 12 },
  skeletonPoster: { width: 84, height: 120, borderRadius: 10, backgroundColor: '#E2E8F0' },
  skeletonMetaCol: { flex: 1, marginLeft: 12, gap: 8, justifyContent: 'center' },
  skeletonLineWide: { width: '85%', height: 16, borderRadius: 6, backgroundColor: '#E2E8F0' },
  skeletonLineMedium: { width: '65%', height: 12, borderRadius: 6, backgroundColor: '#F1F5F9' },
  skeletonLineShort: { width: '45%', height: 12, borderRadius: 6, backgroundColor: '#F1F5F9' },
  skeletonSlotsRow: { flexDirection: 'row', gap: 8 },
  skeletonSlot: { width: 72, height: 38, borderRadius: 8, backgroundColor: '#F1F5F9' },

  /* Error & Empty */
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 24,
  },
  errorTitle: { fontSize: 16, fontWeight: '800', color: '#991B1B', marginTop: 10 },
  errorSubText: {
    fontSize: 13,
    color: '#B91C1C',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 14,
  },
  retryBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  emptyResultsBox: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#334155', marginTop: 12 },
  emptyResultsText: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6 },
  resetFilterBtn: {
    marginTop: 14,
    backgroundColor: '#E11D48',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
  },
  resetFilterBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  /* Movie Card */
  movieCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  movieHeaderRow: { flexDirection: 'row', marginBottom: 12 },
  moviePoster: { width: 88, height: 128, borderRadius: 10, backgroundColor: '#E2E8F0' },
  movieInfoColumn: { flex: 1, marginLeft: 12 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  ageBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  ageBadgeText: { fontSize: 11, fontWeight: '800', color: '#DC2626' },
  statusBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusBadgeComingSoon: { backgroundColor: '#FEF3C7' },
  statusBadgeText: { fontSize: 10, fontWeight: '700', color: '#15803D' },
  statusBadgeTextComingSoon: { color: '#B45309' },
  movieTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', lineHeight: 20 },
  originalTitleText: { fontSize: 12, color: '#64748B', fontStyle: 'italic', marginTop: 2 },
  genresText: { fontSize: 12, color: '#475569', marginTop: 4 },
  movieMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 4 },
  movieSubTitle: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  releaseDateText: { fontSize: 11, color: '#64748B', marginTop: 3 },
  detailActionRow: { marginTop: 6 },
  detailLinkText: { fontSize: 12, fontWeight: '700', color: '#E11D48' },
  noShowtimeBanner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noShowtimeText: { fontSize: 12, color: '#64748B' },
  formatSection: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  formatTitle: { fontSize: 12, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  showtimesGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  showtimeDisabledBox: {
    width: '23%',
    margin: '1%',
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showtimeDisabledText: { fontSize: 13, fontWeight: '500', color: '#94A3B8' },
  showtimeActiveBox: {
    width: '23%',
    margin: '1%',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E11D48',
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showtimeActiveTime: { fontSize: 14, fontWeight: '800', color: '#BE123C' },
  showtimePriceText: { fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 1 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    maxHeight: '80%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  modalCloseBtn: { padding: 4 },
  branchListContainer: { marginTop: 4 },
  richBranchCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  richBranchCardSelected: { borderColor: '#E11D48', backgroundColor: '#FFF1F2', borderWidth: 1.5 },
  branchHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  brandBadge: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  brandBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  branchNameText: { fontSize: 14, fontWeight: '700', color: '#0F172A', flex: 1 },
  branchAddressText: { fontSize: 12, color: '#64748B', marginTop: 2 },
});
