import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, Image, ScrollView, useWindowDimensions,
  Alert, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { useShopping } from '../../context/ShoppingContext';
import { MOCK_PRODUCTS } from './index';

const T = {
  black: '#222222',
  white: '#FFFFFF',
  bg: '#F5F5F5',
  sub: '#888888',
  border: '#E8E8E8',
  orange: '#0066F5',   // Premium Sapphire Blue
  red: '#FF2A54',      // Rose Red
};

const formatMoney = (val: number) => val.toLocaleString('vi-VN') + 'đ';

export default function PremiumProduct() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { cart, addToCart } = useShopping();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  
  const product = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
  
  const [showSheet, setShowSheet] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || 'Default');
  const [quantity, setQuantity] = useState(1);

  // Marketplace additions
  const [comboChecked, setComboChecked] = useState(true);
  const [showReviews, setShowReviews] = useState(false);
  const [showQA, setShowQA] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

  // Q&A Interactive States
  const [userQuestion, setUserQuestion] = useState('');
  const [qaList, setQaList] = useState([
    { q: 'Sản phẩm này bảo hành bao lâu vậy shop?', a: 'Sản phẩm được bảo hành chính hãng 12 tháng kể từ ngày nhận hàng bạn nhé!' },
    { q: 'Có freeship không shop ơi?', a: 'Dạ shop có hỗ trợ mã miễn phí vận chuyển Freeship Sàn tại trang chủ bạn lưu mã để áp dụng nha.' },
  ]);

  const handleAskQuestion = () => {
    if (!userQuestion.trim()) return;
    const newQ = userQuestion.trim();
    setQaList(prev => [...prev, { q: newQ, a: 'Trợ lý AI đang soạn câu trả lời...' }]);
    setUserQuestion('');

    setTimeout(() => {
      setQaList(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        let aiAnswer = 'Cảm ơn bạn đã quan tâm. Shop/AI sẽ phản hồi chi tiết tới bạn sớm nhất!';
        if (newQ.toLowerCase().includes('bảo hành') || newQ.toLowerCase().includes('hỏng')) {
          aiAnswer = 'Dạ, sản phẩm này được bảo hành chính hãng 12 tháng tại các đại lý uỷ quyền toàn quốc nha bạn!';
        } else if (newQ.toLowerCase().includes('ship') || newQ.toLowerCase().includes('vận chuyển') || newQ.toLowerCase().includes('gửi')) {
          aiAnswer = 'Chào bạn, shop hỗ trợ ship Hoả Tốc 2h tại nội thành HN/TP.HCM và ship nhanh 1-3 ngày trên toàn quốc!';
        } else if (newQ.toLowerCase().includes('giảm giá') || newQ.toLowerCase().includes('khuyến mãi') || newQ.toLowerCase().includes('voucher')) {
          aiAnswer = 'Chào bạn, bạn có thể lưu mã giảm giá tại mục Voucher trên đầu trang sản phẩm hoặc trang chủ shop nhé!';
        }
        updated[lastIdx] = { q: newQ, a: aiAnswer };
        return updated;
      });
    }, 1200);
  };

  const getVariantImage = (variantName: string) => {
    if (variantName === 'Titan Đen') {
      return 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80';
    }
    if (variantName === 'Pure White') {
      return 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80';
    }
    if (variantName === 'Grey') {
      return 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80';
    }
    return product.image; // Fallback
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      shopId: product.shopId,
      shopName: product.shopName,
      isMall: product.isMall,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      variant: selectedVariant,
      image: product.image,
      quantity,
    });
    setShowSheet(false);
  };

  const renderVariantSheet = () => {
    if (!showSheet) return null;
    return (
      <View style={S.sheetOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowSheet(false)} />
        <Animated.View entering={SlideInDown.springify().damping(25).stiffness(200)} style={S.sheet}>
          <View style={S.sheetHeader}>
            <Text style={S.sheetTitle}>TUỲ CHỌN</Text>
            <TouchableOpacity onPress={() => setShowSheet(false)}><Ionicons name="close" size={24} color={T.black} /></TouchableOpacity>
          </View>
          
          <ScrollView style={{ maxHeight: 400 }}>
            <View style={S.productPreview}>
              <Image source={{ uri: product.image }} style={S.previewImg} />
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={S.previewName} numberOfLines={2}>{product.name}</Text>
                <Text style={S.previewPrice}>{formatMoney(product.price)}</Text>
              </View>
            </View>

            {product.variants && (
              <View style={S.section}>
                <Text style={S.sectionLabel}>Phân loại</Text>
                <View style={S.variantGrid}>
                  {product.variants.map(v => (
                    <TouchableOpacity key={v} style={[S.variantBtn, selectedVariant === v && S.variantBtnActive]} onPress={() => setSelectedVariant(v)}>
                      <Text style={[S.variantTxt, selectedVariant === v && S.variantTxtActive]}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={S.section}>
              <Text style={S.sectionLabel}>Số lượng</Text>
              <View style={S.qtyControls}>
                <TouchableOpacity style={S.qtyBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}><Ionicons name="remove" size={20} /></TouchableOpacity>
                <Text style={S.qtyVal}>{quantity}</Text>
                <TouchableOpacity style={S.qtyBtn} onPress={() => setQuantity(q => q + 1)}><Ionicons name="add" size={20} /></TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={S.addToBagBtn} onPress={handleAddToCart} activeOpacity={0.8}>
            <Text style={S.addToBagTxt}>THÊM VÀO TÚI</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/shopping');
    }
  };

  return (
    <View style={S.root}>
      <SafeAreaView style={[S.safe, isDesktop && S.desktop]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Transparent Header */}
        <View style={S.headerActions} pointerEvents="box-none">
          <TouchableOpacity style={S.roundBtn} onPress={handleBack}><Ionicons name="arrow-back" size={22} color={T.black} /></TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={S.roundBtn} onPress={() => router.push('/shopping/cart')}>
              <Ionicons name="bag-outline" size={22} color={T.black} />
              {cartItemCount > 0 && <View style={S.cartBadge}><Text style={S.cartBadgeTxt}>{cartItemCount}</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity style={S.roundBtn}><Ionicons name="share-outline" size={22} color={T.black} /></TouchableOpacity>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: getVariantImage(selectedVariant) }} style={S.mainImg} />
          
          <View style={S.infoContainer}>
            <Text style={S.brandName}>{product.shopName.toUpperCase()}</Text>
            <Text style={S.productName}>{product.name}</Text>
            <Text style={S.price}>{formatMoney(product.price)}</Text>
            
            {/* 🎨 DYNAMIC VARIANT SELECTOR (Giai đoạn 4) */}
            {product.variants && (
              <View style={{ marginTop: 20 }}>
                <Text style={S.variantSelectLabel}>Chọn phân loại: <Text style={{ fontWeight: '700' }}>{selectedVariant}</Text></Text>
                <View style={S.variantSelectorRow}>
                  {product.variants.map(v => (
                    <TouchableOpacity key={v} style={[S.quickVarBtn, selectedVariant === v && S.quickVarBtnActive]} onPress={() => setSelectedVariant(v)}>
                      <Text style={[S.quickVarTxt, selectedVariant === v && S.quickVarTxtActive]}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={S.divider} />

            {/* 🏢 SELLER PROFILE BLOCK */}
            <View style={S.sellerProfileCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }} style={S.sellerAvatar} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={S.sellerName}>{product.shopName}</Text>
                    {product.isMall && (
                      <View style={S.sellerMallBadge}><Text style={S.sellerMallTxt}>Mall</Text></View>
                    )}
                  </View>
                  <Text style={S.sellerActiveTime}>Online 5 phút trước</Text>
                  
                  {/* Stats row */}
                  <View style={S.sellerStatsRow}>
                    <Text style={S.sellerStatItem}><Text style={S.sellerStatBold}>4.8 ★</Text></Text>
                    <Text style={S.sellerStatItem}><Text style={S.sellerStatBold}>98%</Text></Text>
                    <Text style={S.sellerStatItem}><Text style={S.sellerStatBold}>15k follower</Text></Text>
                  </View>
                </View>
              </View>
              
              <View style={S.sellerActions}>
                <TouchableOpacity style={S.sellerBtnOutline} onPress={() => Alert.alert('Chat', `Mở chat với ${product.shopName}`)}>
                  <Text style={S.sellerBtnOutlineTxt}>Chat ngay</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[S.sellerBtnOutline, { backgroundColor: T.orange, borderColor: T.orange }]} onPress={() => router.push(`/shopping/shop?id=${product.shopId || 's1'}`)}>
                  <Text style={[S.sellerBtnOutlineTxt, { color: '#FFF' }]}>Xem Shop</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={S.divider} />
            
            <Text style={S.descTitle}>CHI TIẾT SẢN PHẨM</Text>
            <Text style={S.descText}>
              Mang phong cách tối giản, sản phẩm được thiết kế để hoàn thiện vẻ ngoài thanh lịch của bạn. 
              Chất liệu cao cấp, đường may tỉ mỉ, mang lại cảm giác thoải mái tuyệt đối trong mọi hoàn cảnh.
            </Text>

            <View style={S.divider} />

            {/* 🛍️ COMBO DEAL (Giai đoạn 4) */}
            <View style={S.comboContainer}>
              <Text style={S.comboTitle}>ƯU ĐÃI COMBO (Mua kèm deal sốc)</Text>
              <View style={S.comboRow}>
                <Image source={{ uri: getVariantImage(selectedVariant) }} style={S.comboThumbnail} />
                <Text style={{ fontSize: 18, color: T.sub }}>+</Text>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=150' }} style={S.comboThumbnail} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={S.comboProdName} numberOfLines={1}>Ốp lưng cao cấp + Tai nghe</Text>
                  <Text style={S.comboPrice}>Khuyến mãi: +150.000đ <Text style={{ textDecorationLine: 'line-through', color: T.sub, fontSize: 11 }}>350.000đ</Text></Text>
                </View>
                <TouchableOpacity onPress={() => setComboChecked(!comboChecked)}>
                  <Ionicons name={comboChecked ? "checkmark-circle" : "ellipse-outline"} size={22} color={comboChecked ? T.black : T.border} />
                </TouchableOpacity>
              </View>
              <View style={S.comboTotalRow}>
                <Text style={S.comboTotalText}>Tổng tiền Combo: <Text style={{ color: '#EF4444', fontWeight: '800' }}>{formatMoney(product.price + (comboChecked ? 150000 : 0))}</Text></Text>
              </View>
            </View>

            <View style={S.divider} />
            
            {/* 📋 SPECIFICATIONS SECTION (Bản cập nhật mới) */}
            <TouchableOpacity style={S.accordion} onPress={() => setShowSpecs(!showSpecs)}>
              <Text style={S.accordionTxt}>Thông số kỹ thuật chi tiết</Text>
              <Ionicons name={showSpecs ? "remove" : "add"} size={20} color={T.black} />
            </TouchableOpacity>
            {showSpecs && (
              <View style={S.accordionContent}>
                <View style={S.specRow}>
                  <Text style={S.specLabel}>Thương hiệu</Text>
                  <Text style={S.specVal}>{product.brand || 'Chính hãng'}</Text>
                </View>
                <View style={S.specRow}>
                  <Text style={S.specLabel}>Mẫu mã (Model)</Text>
                  <Text style={S.specVal}>{product.name}</Text>
                </View>
                <View style={S.specRow}>
                  <Text style={S.specLabel}>Xuất xứ thương hiệu</Text>
                  <Text style={S.specVal}>Việt Nam / Nhập khẩu</Text>
                </View>
                <View style={S.specRow}>
                  <Text style={S.specLabel}>Chế độ bảo hành</Text>
                  <Text style={S.specVal}>12 tháng chính hãng</Text>
                </View>
                <View style={S.specRow}>
                  <Text style={S.specLabel}>Chính sách đổi trả</Text>
                  <Text style={S.specVal}>Lỗi 1 đổi 1 trong 30 ngày</Text>
                </View>
              </View>
            )}

            {/* ⭐ REVIEWS SECTION (Giai đoạn 4 & Bản cập nhật mới) */}
            <TouchableOpacity style={S.accordion} onPress={() => setShowReviews(!showReviews)}>
              <Text style={S.accordionTxt}>Đánh giá ({product.rating} ★)</Text>
              <Ionicons name={showReviews ? "remove" : "add"} size={20} color={T.black} />
            </TouchableOpacity>
            {showReviews && (
              <View style={S.accordionContent}>
                {/* AI Review Summary Card */}
                <View style={S.aiSummaryCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="sparkles" size={14} color={T.orange} style={{ marginRight: 6 }} />
                    <Text style={S.aiSummaryTitle}>TÓM TẮT ĐÁNH GIÁ BỞI AI</Text>
                  </View>
                  <Text style={S.aiSummaryText}>
                    "Sản phẩm được đánh giá cực cao về độ hoàn thiện chi tiết tỉ mỉ, thiết kế sang trọng và sử dụng thoải mái. 
                    Nổi bật với lượt giao hàng nhanh chóng từ nhà bán hàng và chính sách hậu mãi uy tín."
                  </Text>
                </View>

                {[
                  { user: 'Nguyễn Văn B', rating: 5, date: '25/06/2026', comment: 'Sản phẩm tuyệt vời, giao hàng cực nhanh. Gói cẩn thận.' },
                  { user: 'Trần Thị C', rating: 4, date: '20/06/2026', comment: 'Chất lượng đúng mô tả, rất hài lòng với màu sắc mới.' },
                ].map((rev, i) => (
                  <View key={i} style={S.reviewItem}>
                    <View style={S.reviewHeader}>
                      <Text style={S.reviewUser}>{rev.user}</Text>
                      <Text style={S.reviewDate}>{rev.date}</Text>
                    </View>
                    <Text style={{ color: '#EF4444', fontSize: 11, marginVertical: 4 }}>{'★'.repeat(rev.rating)}</Text>
                    <Text style={S.reviewComment}>{rev.comment}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ❓ Q&A SECTION (Giai đoạn 4 & Bản cập nhật mới) */}
            <TouchableOpacity style={S.accordion} onPress={() => setShowQA(!showQA)}>
              <Text style={S.accordionTxt}>Hỏi đáp sản phẩm (Hỗ trợ AI)</Text>
              <Ionicons name={showQA ? "remove" : "add"} size={20} color={T.black} />
            </TouchableOpacity>
            {showQA && (
              <View style={S.accordionContent}>
                {/* Interactive Q&A Input */}
                <View style={S.qaInputRow}>
                  <TextInput
                    style={S.qaTextInput}
                    placeholder="Hỏi shop về bảo hành, ship, voucher..."
                    placeholderTextColor={T.sub}
                    value={userQuestion}
                    onChangeText={setUserQuestion}
                  />
                  <TouchableOpacity style={S.qaSendBtn} onPress={handleAskQuestion}>
                    <Text style={S.qaSendBtnTxt}>Gửi</Text>
                  </TouchableOpacity>
                </View>

                {qaList.map((qa, i) => (
                  <View key={i} style={S.qaItem}>
                    <View style={S.qaQRow}>
                      <Ionicons name="help-circle" size={16} color={T.orange} style={{ marginRight: 6 }} />
                      <Text style={S.qaQuestion}>{qa.q}</Text>
                    </View>
                    <View style={S.qaARow}>
                      <Ionicons name="checkmark-circle" size={16} color="#00BFA5" style={{ marginRight: 6 }} />
                      <Text style={S.qaAnswer}>{qa.a}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
          
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Floating Bottom Bar */}
        <View style={S.bottomBar}>
          <TouchableOpacity style={S.bottomBtn} onPress={() => setShowSheet(true)} activeOpacity={0.8}>
            <Text style={S.bottomBtnTxt}>THÊM VÀO TÚI</Text>
          </TouchableOpacity>
        </View>

        {renderVariantSheet()}
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.white },
  safe: { flex: 1 },
  desktop: { maxWidth: 414, alignSelf: 'center', borderRadius: 20, overflow: 'hidden' },
  
  headerActions: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 0, right: 0, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  roundBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
  cartBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: T.black, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  cartBadgeTxt: { color: T.white, fontSize: 10, fontWeight: '700' },
  
  mainImg: { width: '100%', height: 500, resizeMode: 'cover' },
  
  infoContainer: { padding: 25 },
  brandName: { fontSize: 12, letterSpacing: 2, color: T.sub, marginBottom: 10 },
  productName: { fontSize: 24, fontWeight: '400', color: T.black, lineHeight: 32, marginBottom: 15 },
  price: { fontSize: 22, fontWeight: '800', color: T.orange },
  
  divider: { height: 1, backgroundColor: T.border, marginVertical: 25 },
  
  descTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: T.black, marginBottom: 15 },
  descText: { fontSize: 14, color: T.sub, lineHeight: 24 },
  
  accordion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: T.border },
  accordionTxt: { fontSize: 14, color: T.black, fontWeight: '500' },

  // Quick Variant Selector
  variantSelectLabel: { fontSize: 13, color: T.black, marginBottom: 10 },
  variantSelectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickVarBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.border, backgroundColor: T.white },
  quickVarBtnActive: { backgroundColor: T.orange, borderColor: T.orange },
  quickVarTxt: { fontSize: 12, color: T.black },
  quickVarTxtActive: { color: T.white, fontWeight: '700' },

  // Combo Deal
  comboContainer: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: T.border },
  comboTitle: { fontSize: 12, fontWeight: '800', color: T.black, marginBottom: 12, letterSpacing: 1 },
  comboRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  comboThumbnail: { width: 45, height: 60, borderRadius: 4, backgroundColor: T.border },
  comboProdName: { fontSize: 13, color: T.black, fontWeight: '600' },
  comboPrice: { fontSize: 11, color: '#EF4444', marginTop: 2, fontWeight: '600' },
  comboTotalRow: { borderTopWidth: 1, borderTopColor: T.border, marginTop: 12, paddingTop: 10, alignItems: 'flex-end' },
  comboTotalText: { fontSize: 13, color: T.black, fontWeight: '600' },

  // Accordion Content
  accordionContent: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: T.border, gap: 12 },
  reviewItem: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10, marginBottom: 5 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewUser: { fontSize: 12, fontWeight: '700', color: T.black },
  reviewDate: { fontSize: 10, color: T.sub },
  reviewComment: { fontSize: 12, color: T.sub, lineHeight: 18 },
  qaItem: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10, marginBottom: 5 },
  qaQuestion: { fontSize: 13, fontWeight: '700', color: T.black },
  qaAnswer: { fontSize: 12, color: T.sub, marginTop: 4, lineHeight: 18 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === 'ios' ? 35 : 20, backgroundColor: 'rgba(255,255,255,0.95)' },
  bottomBtn: { backgroundColor: T.orange, paddingVertical: 18, borderRadius: 8, alignItems: 'center' },
  bottomBtnTxt: { color: T.white, fontSize: 14, fontWeight: '700', letterSpacing: 1 },

  sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 100 },
  sheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: T.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: T.border },
  sheetTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  
  productPreview: { flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderBottomColor: T.border },
  previewImg: { width: 60, height: 80, borderRadius: 4 },
  previewName: { fontSize: 14, color: T.black, marginBottom: 8 },
  previewPrice: { fontSize: 16, fontWeight: '600', color: T.black },
  
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: T.border },
  sectionLabel: { fontSize: 12, letterSpacing: 1, color: T.sub, marginBottom: 15 },
  
  variantGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  variantBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, borderWidth: 1, borderColor: T.border },
  variantBtnActive: { backgroundColor: T.orange, borderColor: T.orange },
  variantTxt: { fontSize: 13, color: T.black },
  variantTxtActive: { color: T.white, fontWeight: '600' },
  
  qtyControls: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderColor: T.border, borderRadius: 30 },
  qtyBtn: { padding: 12 },
  qtyVal: { paddingHorizontal: 20, fontSize: 16, fontWeight: '500' },
  
  addToBagBtn: { backgroundColor: T.orange, marginHorizontal: 20, marginTop: 20, paddingVertical: 18, borderRadius: 8, alignItems: 'center' },
  addToBagTxt: { color: T.white, fontSize: 14, fontWeight: '700', letterSpacing: 1 },

  // Seller Profile Styles
  sellerProfileCard: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginTop: 10 },
  sellerAvatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: T.border },
  sellerName: { fontSize: 14, fontWeight: '700', color: T.black },
  sellerActiveTime: { fontSize: 10, color: T.sub, marginTop: 2 },
  sellerMallBadge: { backgroundColor: '#FF2A54', borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1, marginLeft: 6 },
  sellerMallTxt: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  sellerStatsRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  sellerStatItem: { fontSize: 10, color: T.sub },
  sellerStatBold: { color: T.black, fontWeight: '700' },
  sellerActions: { flexDirection: 'row', gap: 10, marginTop: 15, borderTopWidth: 1, borderTopColor: T.border, paddingTop: 12 },
  sellerBtnOutline: { flex: 1, borderWidth: 1, borderColor: T.border, borderRadius: 6, paddingVertical: 8, alignItems: 'center', backgroundColor: '#FFF' },
  sellerBtnOutlineTxt: { fontSize: 12, fontWeight: '700', color: T.black },

  // Specifications
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: T.border },
  specLabel: { fontSize: 12, color: T.sub },
  specVal: { fontSize: 12, color: T.black, fontWeight: '600' },

  // AI Review Summary
  aiSummaryCard: { backgroundColor: '#EBF3FF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D0E2FF', marginBottom: 15 },
  aiSummaryTitle: { fontSize: 10, fontWeight: '900', color: T.orange, letterSpacing: 0.5 },
  aiSummaryText: { fontSize: 11, color: T.black, lineHeight: 16, marginTop: 4 },

  // Interactive QA
  qaInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  qaTextInput: { flex: 1, height: 40, borderWidth: 1, borderColor: T.border, borderRadius: 6, paddingHorizontal: 12, fontSize: 12, color: T.black, backgroundColor: '#F8FAFC', marginRight: 8 },
  qaSendBtn: { backgroundColor: T.orange, borderRadius: 6, paddingHorizontal: 16, height: 40, justifyContent: 'center', alignItems: 'center' },
  qaSendBtnTxt: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  qaQRow: { flexDirection: 'row', alignItems: 'center' },
  qaARow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, paddingLeft: 10 },
});
