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
  TextInput,
  Image,
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const JOB_CATEGORIES = [
  { id: '1', name: 'IT - Phần mềm', icon: '💻', jobsCount: '1.2K' },
  { id: '2', name: 'Marketing', icon: '📈', jobsCount: '850' },
  { id: '3', name: 'Kinh doanh', icon: '🤝', jobsCount: '2.5K' },
  { id: '4', name: 'Thiết kế', icon: '🎨', jobsCount: '420' },
];

const RECOMMENDED_JOBS = [
  {
    id: 'j1',
    title: 'Senior React Native Developer',
    company: 'TechFlow Jsc',
    logo: 'https://ui-avatars.com/api/?name=Tech+Flow&background=00c6ff&color=fff',
    salary: '25.000.000 - 45.000.000 VNĐ',
    location: 'Quận 1, TP.HCM',
    tags: ['Hybrid', 'Full-time', 'Bảo hiểm cao cấp']
  },
  {
    id: 'j2',
    title: 'Trưởng phòng Marketing',
    company: 'Global Retail',
    logo: 'https://ui-avatars.com/api/?name=Global+Retail&background=FF4D4F&color=fff',
    salary: 'Thỏa thuận',
    location: 'Cầu Giấy, Hà Nội',
    tags: ['On-site', 'Full-time', 'Thưởng KPI']
  },
  {
    id: 'j3',
    title: 'UI/UX Designer',
    company: 'Creative Studio',
    logo: 'https://ui-avatars.com/api/?name=Creative+Studio&background=7928CA&color=fff',
    salary: '15.000.000 - 25.000.000 VNĐ',
    location: 'Remote',
    tags: ['Remote', 'Part-time', 'Giờ linh hoạt']
  }
];

export default function JobsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: theme.fontFamily }]}>Việc làm</Text>
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Banner */}
          <LinearGradient
            colors={['#00c6ff', '#0072ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <Text style={[styles.bannerTitle, { fontFamily: theme.fontFamily }]}>Tìm công việc mơ ước!</Text>
            <Text style={[styles.bannerSub, { fontFamily: theme.fontFamily }]}>Hàng ngàn cơ hội đang chờ bạn</Text>
            
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
              <TextInput 
                placeholder="Nhập tên vị trí, công ty..."
                placeholderTextColor="#888"
                style={[styles.searchInput, { fontFamily: theme.fontFamily }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </LinearGradient>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily }]}>Ngành nghề nổi bật</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
              {JOB_CATEGORIES.map(cat => (
                <TouchableOpacity key={cat.id} style={styles.categoryCard}>
                  <View style={styles.catIconWrap}>
                    <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                  </View>
                  <Text style={[styles.catTitle, { fontFamily: theme.fontFamily }]}>{cat.name}</Text>
                  <Text style={[styles.catCount, { fontFamily: theme.fontFamily }]}>{cat.jobsCount} việc làm</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Job Listings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily }]}>Việc làm phù hợp với bạn</Text>
            {RECOMMENDED_JOBS.map(job => (
              <TouchableOpacity key={job.id} style={styles.jobCard} onPress={() => window.alert('Đang mở chi tiết công việc...')}>
                <View style={styles.jobHeader}>
                  <Image source={{ uri: job.logo }} style={styles.jobLogo} />
                  <View style={styles.jobInfo}>
                    <Text style={[styles.jobTitle, { fontFamily: theme.fontFamily }]}>{job.title}</Text>
                    <Text style={[styles.jobCompany, { fontFamily: theme.fontFamily }]}>{job.company}</Text>
                  </View>
                  <TouchableOpacity>
                    <Ionicons name="heart-outline" size={24} color="#888" />
                  </TouchableOpacity>
                </View>
                <View style={styles.jobDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={16} color="#10B981" />
                    <Text style={[styles.jobSalary, { fontFamily: theme.fontFamily }]}>{job.salary}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color="#94A3B8" />
                    <Text style={[styles.jobLocation, { fontFamily: theme.fontFamily }]}>{job.location}</Text>
                  </View>
                </View>
                <View style={styles.tagsRow}>
                  {job.tags.map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={[styles.tagText, { fontFamily: theme.fontFamily }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={[styles.applyBtn, { backgroundColor: theme.accentHex }]}>
                  <Text style={[styles.applyBtnText, { fontFamily: theme.fontFamily }]}>Ứng tuyển ngay</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { paddingVertical: 20 }),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
  },
  desktopFrame: {
    maxWidth: 390,       
    maxHeight: 844,
    aspectRatio: 390 / 844, 
    borderWidth: 12,     
    borderColor: '#000000',
    borderRadius: 44,    
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  banner: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#00c6ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' }),
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  categoryList: {
    flexDirection: 'row',
  },
  categoryCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
    width: 120,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  catIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  catTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  catCount: {
    color: '#94A3B8',
    fontSize: 12,
  },
  jobCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  jobHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  jobLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  jobTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  jobCompany: {
    color: '#94A3B8',
    fontSize: 14,
  },
  jobDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobSalary: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  jobLocation: {
    color: '#94A3B8',
    fontSize: 14,
    marginLeft: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  applyBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  }
});
