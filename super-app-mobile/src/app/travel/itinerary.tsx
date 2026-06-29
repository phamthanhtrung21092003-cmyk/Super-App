import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform, SafeAreaView,
  StatusBar, ScrollView, Image, FlatList, Animated, Dimensions, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const DAYS = [
  {
    day: 1,
    title: 'Hà Nội → Tú Lệ',
    date: 'Thứ Sáu, 15/11',
    activities: [
      { time: '06:00', icon: '🌅', title: 'Khởi hành từ Hà Nội', desc: 'Xuất phát từ Bến xe Mỹ Đình, di chuyển ~4 tiếng', type: 'transport', done: false },
      { time: '10:30', icon: '⛽', title: 'Nghỉ chân Nghĩa Lộ', desc: 'Ăn sáng, tiếp nhiên liệu xe, thưởng thức đặc sản Yên Bái', type: 'food', done: false },
      { time: '13:00', icon: '📸', title: 'Đèo Khau Phạ', desc: 'Một trong tứ đại đỉnh đèo của miền Bắc, tầm nhìn 360°', type: 'checkin', done: false },
      { time: '15:00', icon: '🏠', title: 'Check-in Homestay Tú Lệ', desc: 'Nhà sàn truyền thống người Thái, view ruộng bậc thang', type: 'hotel', done: false },
      { time: '19:00', icon: '🍽️', title: 'Ăn tối địa phương', desc: 'Xôi nếp Tú Lệ, gà đồi nướng, rượu ngô Mù Cang Chải', type: 'food', done: false },
    ]
  },
  {
    day: 2,
    title: 'Mù Cang Chải - Lúa chín vàng',
    date: 'Thứ Bảy, 16/11',
    activities: [
      { time: '05:30', icon: '🌄', title: 'Bình minh trên ruộng bậc thang', desc: 'Chụp ảnh lúa chín mùa đẹp nhất trong năm', type: 'checkin', done: false },
      { time: '08:00', icon: '🥣', title: 'Bữa sáng với người Mông', desc: 'Thưởng thức bánh chưng đen, thắng cố, rau rừng', type: 'food', done: false },
      { time: '10:00', icon: '🪂', title: 'Dù lượn Đèo Khau Phạ', desc: 'Trải nghiệm dù lượn nhìn toàn cảnh Mù Cang Chải từ trên cao', type: 'activity', done: false },
      { time: '14:00', icon: '🚶', title: 'Trekking La Pán Tẩn', desc: 'Điểm ngắm ruộng bậc thang đẹp nhất, đi bộ ~2km', type: 'activity', done: false },
      { time: '18:00', icon: '🏕️', title: 'Cắm trại đêm trên đồi', desc: 'Trải nghiệm ngủ giữa rừng núi, ngắm sao', type: 'hotel', done: false },
    ]
  },
  {
    day: 3,
    title: 'Về Hà Nội',
    date: 'Chủ Nhật, 17/11',
    activities: [
      { time: '07:00', icon: '♨️', title: 'Suối khoáng nóng Trạm Tấu', desc: 'Ngâm mình thư giãn tại suối khoáng tự nhiên', type: 'activity', done: false },
      { time: '10:00', icon: '🛒', title: 'Mua quà về', desc: 'Gạo nếp Tú Lệ, mật ong rừng, thổ cẩm người Thái', type: 'activity', done: false },
      { time: '11:00', icon: '🚗', title: 'Khởi hành về Hà Nội', desc: 'Di chuyển ~4.5 tiếng qua quốc lộ 32', type: 'transport', done: false },
      { time: '16:00', icon: '🏠', title: 'Về đến Hà Nội', desc: 'Kết thúc chuyến đi đầy trải nghiệm!', type: 'hotel', done: false },
    ]
  }
];

const TYPE_COLORS: Record<string, string> = {
  transport: '#F59E0B',
  food: '#10B981',
  checkin: '#8B5CF6',
  hotel: '#3B82F6',
  activity: '#EC4899',
};

export default function ItineraryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const width = Dimensions.get('window').width;
  const isDesktop = Platform.OS === 'web' && width > 768;

  const [activeDay, setActiveDay] = useState(0);
  const [doneItems, setDoneItems] = useState<Set<string>>(new Set());
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const currentDay = DAYS[activeDay];

  const toggleDone = (key: string) => {
    setDoneItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const totalActivities = DAYS.reduce((s, d) => s + d.activities.length, 0);
  const doneCount = doneItems.size;

  return (
    <View style={S.root}>
      <SafeAreaView style={[S.safe, isDesktop && S.desktop]}>
        <StatusBar barStyle="light-content" />

        {/* HEADER */}
        <LinearGradient colors={['#0F172A', '#0C4A6E']} style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.headerBack}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={S.headerTitle}>Lịch trình AI</Text>
            <Text style={S.headerSub}>Mù Cang Chải • 3 ngày 2 đêm</Text>
          </View>
          <TouchableOpacity style={S.shareBtn} onPress={() => Alert.alert('Chia sẻ', 'Đã sao chép link lịch trình!')}>
            <Ionicons name="share-outline" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={S.shareBtn}>
            <Ionicons name="ellipsis-vertical" size={22} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* PROGRESS BAR */}
        <View style={S.progressBar}>
          <LinearGradient colors={['#0C4A6E', '#0F172A']} style={S.progressBg}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 }}>
              <View>
                <Text style={{ color: '#94A3B8', fontSize: 11 }}>Tiến độ chuyến đi</Text>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>{doneCount}/{totalActivities} hoạt động</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#14B8A6', fontSize: 20, fontWeight: '800' }}>{Math.round(doneCount / totalActivities * 100)}%</Text>
                <Text style={{ color: '#64748B', fontSize: 10 }}>Hoàn thành</Text>
              </View>
            </View>
            <View style={S.progressTrack}>
              <View style={[S.progressFill, { width: `${(doneCount / totalActivities * 100)}%` as any }]} />
            </View>
          </LinearGradient>
        </View>

        {/* DAY TABS */}
        <View style={S.dayTabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
            {DAYS.map((d, i) => (
              <TouchableOpacity key={i} onPress={() => setActiveDay(i)} style={[S.dayTab, activeDay === i && S.dayTabActive]}>
                <Text style={[S.dayTabNum, activeDay === i && S.dayTabNumActive]}>Ngày {d.day}</Text>
                <Text style={[S.dayTabDate, activeDay === i && { color: '#0EA5E9' }]}>{d.date.split(',')[0]}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={S.addDayBtn} onPress={() => Alert.alert('Thêm ngày', 'Tính năng sắp ra mắt!')}>
              <Ionicons name="add" size={20} color="#0EA5E9" />
              <Text style={{ color: '#0EA5E9', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>Thêm ngày</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* AI SUGGESTION BANNER */}
        <View style={S.aiBanner}>
          <LinearGradient colors={['#0E7490', '#0F766E']} style={S.aiBannerGrad}>
            <Text style={{ fontSize: 18 }}>🤖</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={S.aiBannerTitle}>Gợi ý AI cho {currentDay.title}</Text>
              <Text style={S.aiBannerSub}>Thời tiết đẹp, nên mang áo ấm và ủng đi rừng</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </View>

        {/* TIMELINE */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={S.dayHeader}>
            <Text style={S.dayTitle}>📅 Ngày {currentDay.day}: {currentDay.title}</Text>
            <Text style={S.dayDate}>{currentDay.date}</Text>
          </View>

          <View style={S.timeline}>
            {currentDay.activities.map((act, idx) => {
              const key = `${activeDay}-${idx}`;
              const isDone = doneItems.has(key);
              const typeColor = TYPE_COLORS[act.type] || '#0EA5E9';
              return (
                <View key={key} style={S.timelineRow}>
                  {/* Left: Time + line */}
                  <View style={S.timelineLeft}>
                    <Text style={S.timeText}>{act.time}</Text>
                    <View style={[S.timelineLine, idx === currentDay.activities.length - 1 && { backgroundColor: 'transparent' }]} />
                  </View>

                  {/* Dot */}
                  <View style={[S.dot, { borderColor: typeColor, backgroundColor: isDone ? typeColor : '#0F172A' }]}>
                    {isDone && <Ionicons name="checkmark" size={10} color="#FFF" />}
                  </View>

                  {/* Card */}
                  <View style={[S.actCard, isDone && S.actCardDone]}>
                    <View style={S.actCardHeader}>
                      <View style={[S.actTypeBadge, { backgroundColor: typeColor + '22' }]}>
                        <Text style={{ fontSize: 16 }}>{act.icon}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[S.actTitle, isDone && { textDecorationLine: 'line-through', color: '#64748B' }]}>{act.title}</Text>
                        <Text style={S.actDesc} numberOfLines={2}>{act.desc}</Text>
                      </View>
                      <TouchableOpacity onPress={() => toggleDone(key)} style={[S.doneBtn, { borderColor: typeColor }]}>
                        <Ionicons name={isDone ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={isDone ? typeColor : '#475569'} />
                      </TouchableOpacity>
                    </View>

                    {/* Action chips */}
                    <View style={S.actChips}>
                      {act.type === 'hotel' && (
                        <TouchableOpacity style={S.actChip} onPress={() => router.push('/travel/booking')}>
                          <Ionicons name="bed-outline" size={12} color="#0EA5E9" />
                          <Text style={S.actChipTxt}>Đặt phòng</Text>
                        </TouchableOpacity>
                      )}
                      {act.type === 'food' && (
                        <TouchableOpacity style={S.actChip}>
                          <Ionicons name="map-outline" size={12} color="#10B981" />
                          <Text style={[S.actChipTxt, { color: '#10B981' }]}>Xem bản đồ</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={S.actChip}>
                        <Ionicons name="pencil-outline" size={12} color="#94A3B8" />
                        <Text style={[S.actChipTxt, { color: '#94A3B8' }]}>Chỉnh sửa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ADD ACTIVITY */}
          <TouchableOpacity style={S.addActBtn} onPress={() => Alert.alert('Thêm hoạt động', 'Tính năng sắp ra mắt!')}>
            <Ionicons name="add-circle-outline" size={22} color="#0EA5E9" />
            <Text style={S.addActTxt}>Thêm hoạt động vào Ngày {currentDay.day}</Text>
          </TouchableOpacity>

          {/* COST ESTIMATE */}
          <View style={S.costCard}>
            <Text style={S.costTitle}>💰 Chi phí ước tính</Text>
            <View style={S.costRow}>
              <Text style={S.costLabel}>Ăn uống</Text>
              <Text style={S.costValue}>300.000đ</Text>
            </View>
            <View style={S.costRow}>
              <Text style={S.costLabel}>Lưu trú</Text>
              <Text style={S.costValue}>500.000đ</Text>
            </View>
            <View style={S.costRow}>
              <Text style={S.costLabel}>Di chuyển</Text>
              <Text style={S.costValue}>200.000đ</Text>
            </View>
            <View style={S.costRow}>
              <Text style={S.costLabel}>Vui chơi</Text>
              <Text style={S.costValue}>350.000đ</Text>
            </View>
            <View style={[S.costRow, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 10, marginTop: 6 }]}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Tổng ngày {currentDay.day}</Text>
              <Text style={{ color: '#0EA5E9', fontWeight: '800', fontSize: 16 }}>1.350.000đ</Text>
            </View>
          </View>
        </ScrollView>

        {/* BOTTOM ACTION BAR */}
        <View style={S.bottomBar}>
          <View>
            <Text style={{ color: '#94A3B8', fontSize: 11 }}>Tổng chi phí dự kiến</Text>
            <Text style={{ color: '#0EA5E9', fontWeight: '800', fontSize: 18 }}>4.050.000đ</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={S.outlineBtn} onPress={() => Alert.alert('Xuất', 'Đang xuất PDF lịch trình...')}>
              <Ionicons name="download-outline" size={18} color="#0EA5E9" />
              <Text style={{ color: '#0EA5E9', fontWeight: '600', marginLeft: 4 }}>Xuất</Text>
            </TouchableOpacity>
            <TouchableOpacity style={S.bookBtn} onPress={() => router.push('/travel/booking')}>
              <LinearGradient colors={['#0EA5E9', '#0C4A6E']} style={S.bookBtnGrad}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Đặt dịch vụ</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 20 }) },
  safe: { flex: 1, backgroundColor: '#0F172A', width: '100%' },
  desktop: { maxWidth: 390, maxHeight: 844, aspectRatio: 390 / 844, borderWidth: 12, borderColor: '#000', borderRadius: 44, overflow: 'hidden' },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 12, paddingBottom: 14 },
  headerBack: { padding: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  headerSub: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  shareBtn: { padding: 8, marginLeft: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },

  progressBar: { backgroundColor: '#0F172A' },
  progressBg: {},
  progressTrack: { height: 4, backgroundColor: '#1E293B', marginHorizontal: 16, marginBottom: 10, borderRadius: 4 },
  progressFill: { height: 4, backgroundColor: '#0EA5E9', borderRadius: 4 },

  dayTabs: { backgroundColor: '#0F172A', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  dayTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  dayTabActive: { backgroundColor: '#0C4A6E', borderColor: '#0EA5E9' },
  dayTabNum: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  dayTabNumActive: { color: '#0EA5E9' },
  dayTabDate: { color: '#64748B', fontSize: 10, marginTop: 2 },
  addDayBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#0EA5E9', borderStyle: 'dashed' },

  aiBanner: { padding: 12 },
  aiBannerGrad: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 },
  aiBannerTitle: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  aiBannerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },

  dayHeader: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  dayTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  dayDate: { color: '#64748B', fontSize: 12, marginTop: 4 },

  timeline: { paddingLeft: 16 },
  timelineRow: { flexDirection: 'row', marginBottom: 4 },
  timelineLeft: { width: 50, alignItems: 'center', paddingTop: 14 },
  timeText: { color: '#64748B', fontSize: 10, fontWeight: '600' },
  timelineLine: { flex: 1, width: 1.5, backgroundColor: '#1E293B', marginTop: 4 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, alignSelf: 'flex-start', marginTop: 14, marginHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  actCard: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 12, marginBottom: 10, marginRight: 12, borderWidth: 1, borderColor: '#334155' },
  actCardDone: { opacity: 0.6 },
  actCardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  actTypeBadge: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actTitle: { color: '#E2E8F0', fontSize: 14, fontWeight: '700', lineHeight: 20 },
  actDesc: { color: '#64748B', fontSize: 12, marginTop: 3, lineHeight: 16 },
  doneBtn: { padding: 4, borderRadius: 12 },
  actChips: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  actChipTxt: { color: '#0EA5E9', fontSize: 11, fontWeight: '600', marginLeft: 4 },

  addActBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#0EA5E9', borderStyle: 'dashed', marginTop: 4, marginBottom: 16 },
  addActTxt: { color: '#0EA5E9', fontWeight: '600', marginLeft: 8 },

  costCard: { marginHorizontal: 16, marginBottom: 20, backgroundColor: '#1E293B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155' },
  costTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', marginBottom: 12 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  costLabel: { color: '#94A3B8', fontSize: 13 },
  costValue: { color: '#E2E8F0', fontSize: 13, fontWeight: '600' },

  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#1E293B', borderTopWidth: 1, borderTopColor: '#334155' },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, borderWidth: 1.5, borderColor: '#0EA5E9' },
  bookBtn: { borderRadius: 25, overflow: 'hidden' },
  bookBtnGrad: { paddingHorizontal: 20, paddingVertical: 10 },
});

