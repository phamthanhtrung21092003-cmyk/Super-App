import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, 
  Platform, SafeAreaView, StatusBar, TouchableOpacity,
  Switch, ActivityIndicator, Modal, TextInput, Alert, RefreshControl, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { foodMerchantService } from '../../services/foodMerchantService';

export default function MerchantMenu() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);

  // State Modal Thêm/Sửa Món
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemBasePrice, setItemBasePrice] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemIsAvailable, setItemIsAvailable] = useState(true);
  const [submittingItem, setSubmittingItem] = useState(false);

  // State Modal Quản lý Category
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [submittingCat, setSubmittingCat] = useState(false);

  // State Modal Quản lý Topping / Option Groups
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [currentManagingItem, setCurrentManagingItem] = useState<any | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupRequired, setNewGroupRequired] = useState(false);
  const [newGroupMaxSelect, setNewGroupMaxSelect] = useState('1');
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState('');
  const [addingToGroupId, setAddingToGroupId] = useState<string | null>(null);
  const [submittingOption, setSubmittingOption] = useState(false);

  const primaryColor = '#0066FF';

  const fetchMenu = async () => {
    try {
      const data = await foodMerchantService.getMenu();
      setCategories(data.categories || []);
      setItems(data.items || []);
    } catch (err: any) {
      console.warn('Lỗi tải menu:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMenu();
  };

  // Bật/tắt còn hàng/hết hàng tức thì
  const handleToggleStock = async (item: any) => {
    setTogglingItemId(item.id);
    try {
      const updated = await foodMerchantService.toggleStock(item.id);
      setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, isAvailable: updated.isAvailable } : it));
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái kho của món');
    } finally {
      setTogglingItemId(null);
    }
  };

  // Mở modal thêm món
  const openCreateModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemDesc('');
    setItemBasePrice('');
    setItemCategory(categories[0]?.id || '');
    setItemImageUrl('');
    setItemIsAvailable(true);
    setItemModalVisible(true);
  };

  // Mở modal sửa món
  const openEditModal = (item: any) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDesc(item.description || '');
    setItemBasePrice(String(item.basePrice || item.price || ''));
    setItemCategory(item.categoryId || categories[0]?.id || '');
    setItemImageUrl(item.imageUrl || item.image || '');
    setItemIsAvailable(item.isAvailable ?? true);
    setItemModalVisible(true);
  };

  // Lưu món ăn (Thêm mới / Cập nhật)
  const handleSaveItem = async () => {
    if (!itemName.trim() || !itemBasePrice.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên món và giá niêm yết');
      return;
    }

    const priceNum = parseFloat(itemBasePrice);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Lỗi', 'Giá món ăn không hợp lệ');
      return;
    }

    setSubmittingItem(true);
    try {
      if (editingItem) {
        // Cập nhật
        await foodMerchantService.updateItem(editingItem.id, {
          name: itemName.trim(),
          description: itemDesc.trim(),
          basePrice: priceNum,
          price: priceNum,
          imageUrl: itemImageUrl.trim() || undefined,
          categoryId: itemCategory || undefined,
          isAvailable: itemIsAvailable,
        });
        Alert.alert('Thành công', 'Đã cập nhật món ăn');
      } else {
        // Thêm mới
        await foodMerchantService.createItem({
          name: itemName.trim(),
          description: itemDesc.trim(),
          basePrice: priceNum,
          price: priceNum,
          imageUrl: itemImageUrl.trim() || undefined,
          categoryId: itemCategory || undefined,
          isAvailable: itemIsAvailable,
        });
        Alert.alert('Thành công', 'Đã thêm món mới vào thực đơn');
      }

      setItemModalVisible(false);
      await fetchMenu();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi lưu món ăn';
      Alert.alert('Lỗi', msg);
    } finally {
      setSubmittingItem(false);
    }
  };

  // Quản lý Danh mục: Thêm / Sửa / Xóa
  const handleSaveCategory = async () => {
    if (!newCatName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên danh mục');
      return;
    }
    setSubmittingCat(true);
    try {
      if (editingCat) {
        await foodMerchantService.updateCategory(editingCat.id, { name: newCatName.trim() });
        Alert.alert('Thành công', 'Đã đổi tên danh mục');
      } else {
        await foodMerchantService.createCategory({ name: newCatName.trim() });
        Alert.alert('Thành công', 'Đã tạo danh mục mới');
      }
      setCatModalVisible(false);
      setNewCatName('');
      setEditingCat(null);
      await fetchMenu();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi lưu danh mục';
      Alert.alert('Lỗi', msg);
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleDeleteCategory = (cat: any) => {
    Alert.alert(
      'Xóa danh mục',
      `Bạn có chắc chắn muốn xóa danh mục "${cat.name}"? Các món trong danh mục này sẽ chuyển về chưa phân loại.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await foodMerchantService.deleteCategory(cat.id);
              if (selectedCatId === cat.id) setSelectedCatId('ALL');
              await fetchMenu();
            } catch (err: any) {
              Alert.alert('Lỗi', 'Không thể xóa danh mục');
            }
          },
        },
      ]
    );
  };

  // Quản lý Option Group & Topping
  const openOptionsModal = (item: any) => {
    setCurrentManagingItem(item);
    setNewGroupName('');
    setNewGroupRequired(false);
    setNewGroupMaxSelect('1');
    setNewOptionName('');
    setNewOptionPrice('');
    setAddingToGroupId(null);
    setOptionsModalVisible(true);
  };

  // Thêm nhóm tùy chọn mới
  const handleAddOptionGroup = async () => {
    if (!currentManagingItem || !newGroupName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên nhóm tùy chọn (vd: Kích cỡ Size, Topping)');
      return;
    }
    setSubmittingOption(true);
    try {
      await foodMerchantService.createOptionGroup(currentManagingItem.id, {
        name: newGroupName.trim(),
        required: newGroupRequired,
        maxSelect: parseInt(newGroupMaxSelect, 10) || 1,
      });
      setNewGroupName('');
      await fetchMenu();
      // Reload current item
      const updatedMenu = await foodMerchantService.getMenu();
      const updatedItem = updatedMenu.items.find((i: any) => i.id === currentManagingItem.id);
      if (updatedItem) setCurrentManagingItem(updatedItem);
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể tạo nhóm tùy chọn');
    } finally {
      setSubmittingOption(false);
    }
  };

  // Xóa nhóm tùy chọn
  const handleDeleteOptionGroup = async (groupId: string) => {
    try {
      await foodMerchantService.deleteOptionGroup(groupId);
      await fetchMenu();
      const updatedMenu = await foodMerchantService.getMenu();
      const updatedItem = updatedMenu.items.find((i: any) => i.id === currentManagingItem?.id);
      if (updatedItem) setCurrentManagingItem(updatedItem);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể xóa nhóm tùy chọn');
    }
  };

  // Thêm tùy chọn con vào nhóm
  const handleAddOption = async (groupId: string) => {
    if (!newOptionName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên tùy chọn (vd: Size L, Trân châu)');
      return;
    }
    const priceNum = parseFloat(newOptionPrice) || 0;
    setSubmittingOption(true);
    try {
      await foodMerchantService.createOption(groupId, {
        name: newOptionName.trim(),
        price: priceNum,
      });
      setNewOptionName('');
      setNewOptionPrice('');
      setAddingToGroupId(null);
      await fetchMenu();
      const updatedMenu = await foodMerchantService.getMenu();
      const updatedItem = updatedMenu.items.find((i: any) => i.id === currentManagingItem?.id);
      if (updatedItem) setCurrentManagingItem(updatedItem);
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể thêm tùy chọn');
    } finally {
      setSubmittingOption(false);
    }
  };

  // Xóa tùy chọn con
  const handleDeleteOption = async (optionId: string) => {
    try {
      await foodMerchantService.deleteOption(optionId);
      await fetchMenu();
      const updatedMenu = await foodMerchantService.getMenu();
      const updatedItem = updatedMenu.items.find((i: any) => i.id === currentManagingItem?.id);
      if (updatedItem) setCurrentManagingItem(updatedItem);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể xóa tùy chọn');
    }
  };

  const filteredItems = selectedCatId === 'ALL'
    ? items
    : items.filter((it) => it.categoryId === selectedCatId);

  const formatPrice = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + 'đ';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Quản Lý Thực Đơn</Text>
          <Text style={styles.headerSub}>Tổng cộng {items.length} món ăn trong {categories.length} danh mục</Text>
        </View>

        <TouchableOpacity style={styles.btnAddItem} onPress={openCreateModal}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.btnAddItemText}>Thêm món</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Bar */}
      <View style={styles.categoryBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            style={[styles.catChip, selectedCatId === 'ALL' && styles.catChipActive]}
            onPress={() => setSelectedCatId('ALL')}
          >
            <Text style={[styles.catChipText, selectedCatId === 'ALL' && styles.catChipTextActive]}>
              Tất cả ({items.length})
            </Text>
          </TouchableOpacity>

          {categories.map((c) => {
            const count = items.filter((i) => i.categoryId === c.id).length;
            const isSelected = selectedCatId === c.id;

            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.catChip, isSelected && styles.catChipActive]}
                onPress={() => setSelectedCatId(c.id)}
              >
                <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                  {c.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Nút thêm / quản lý danh mục */}
          <TouchableOpacity
            style={styles.catChipManage}
            onPress={() => {
              setEditingCat(null);
              setNewCatName('');
              setCatModalVisible(true);
            }}
          >
            <Ionicons name="add-circle" size={16} color="#0066FF" />
            <Text style={styles.catChipManageText}>Danh mục</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Danh sách món ăn */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={styles.loadingText}>Đang tải thực đơn quán...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="fast-food-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Chưa có món ăn nào</Text>
            <Text style={styles.emptySub}>Bấm "+ Thêm món" ở góc trên để bắt đầu tạo thực đơn</Text>
          </View>
        ) : (
          filteredItems.map((item) => {
            const isOutOfStock = !item.isAvailable;

            return (
              <Animated.View key={item.id} entering={FadeInUp.duration(200)} style={styles.itemCard}>
                {/* Ảnh món */}
                <View style={styles.itemImageContainer}>
                  {item.imageUrl || item.image ? (
                    <Image source={{ uri: item.imageUrl || item.image }} style={styles.itemImage} />
                  ) : (
                    <View style={styles.itemImagePlaceholder}>
                      <Ionicons name="restaurant" size={24} color="#94A3B8" />
                    </View>
                  )}
                  {isOutOfStock && (
                    <View style={styles.outOfStockOverlay}>
                      <Text style={styles.outOfStockText}>HẾT MÓN</Text>
                    </View>
                  )}
                </View>

                {/* Thông tin món */}
                <View style={styles.itemInfo}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.stockSwitchWrap}>
                      {togglingItemId === item.id ? (
                        <ActivityIndicator size="small" color={primaryColor} />
                      ) : (
                        <Switch
                          value={Boolean(item.isAvailable)}
                          onValueChange={() => handleToggleStock(item)}
                          trackColor={{ false: '#FECACA', true: '#93C5FD' }}
                          thumbColor={item.isAvailable ? '#0066FF' : '#DC2626'}
                        />
                      )}
                    </View>
                  </View>

                  {item.description ? (
                    <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                  ) : null}

                  {/* Giá niêm yết & Giá khách trả */}
                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.priceBase}>
                        Giá gốc: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{formatPrice(item.basePrice || item.price)}</Text>
                      </Text>
                      <Text style={styles.priceCustomer}>
                        Khách trả (110%): {formatPrice(Math.round((item.basePrice || item.price) * 1.1))}
                      </Text>
                    </View>

                    <View style={[styles.stockPill, { backgroundColor: item.isAvailable ? '#ECFDF5' : '#FEF2F2' }]}>
                      <Text style={[styles.stockPillText, { color: item.isAvailable ? '#059669' : '#DC2626' }]}>
                        {item.isAvailable ? 'Đang bán' : 'Hết món'}
                      </Text>
                    </View>
                  </View>

                  {/* Thanh thao tác: Sửa món / Quản lý Topping */}
                  <View style={styles.itemActionsBar}>
                    <TouchableOpacity 
                      style={styles.itemActionBtn}
                      onPress={() => openEditModal(item)}
                    >
                      <Ionicons name="create-outline" size={15} color="#0066FF" />
                      <Text style={styles.itemActionBtnText}>Sửa món</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.itemActionBtn, { backgroundColor: '#F5F3FF' }]}
                      onPress={() => openOptionsModal(item)}
                    >
                      <Ionicons name="options-outline" size={15} color="#7C3AED" />
                      <Text style={[styles.itemActionBtnText, { color: '#7C3AED' }]}>
                        Topping / Size ({item.optionGroups?.length || 0})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL THÊM / SỬA MÓN ĂN */}
      {/* ======================================================== */}
      <Modal visible={itemModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

          <View style={styles.formHeader}>
            <TouchableOpacity onPress={() => setItemModalVisible(false)} style={styles.formCloseBtn}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.formTitle}>
              {editingItem ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Mới'}
            </Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView style={styles.formScroll}>
            {/* Tên món */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên món ăn <Text style={styles.reqMark}>*</Text></Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ví dụ: Cơm sườn nướng mật ong, Pizza hải sản..."
                placeholderTextColor="#94A3B8"
                value={itemName}
                onChangeText={setItemName}
              />
            </View>

            {/* Giá gốc niêm yết */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Giá gốc niêm yết tại quán (VNĐ) <Text style={styles.reqMark}>*</Text></Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ví dụ: 65000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={itemBasePrice}
                onChangeText={setItemBasePrice}
              />
              <Text style={styles.formHint}>
                * Theo mô hình V-Life: Quán nhận 90% ({formatPrice(Math.round(parseFloat(itemBasePrice || '0') * 0.9))}), khách thanh toán 110% ({formatPrice(Math.round(parseFloat(itemBasePrice || '0') * 1.1))}).
              </Text>
            </View>

            {/* Danh mục */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Danh mục món ăn</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.catPickChip, itemCategory === c.id && styles.catPickChipActive]}
                    onPress={() => setItemCategory(c.id)}
                  >
                    <Text style={[styles.catPickText, itemCategory === c.id && styles.catPickTextActive]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Link ảnh */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Đường dẫn ảnh món (URL)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="https://images.unsplash.com/photo-..."
                placeholderTextColor="#94A3B8"
                value={itemImageUrl}
                onChangeText={setItemImageUrl}
              />
              {itemImageUrl ? (
                <Image source={{ uri: itemImageUrl }} style={styles.previewImage} />
              ) : null}
            </View>

            {/* Mô tả */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mô tả món ăn</Text>
              <TextInput
                style={[styles.formInput, { minHeight: 70, textAlignVertical: 'top' }]}
                placeholder="Nguyên liệu chính, hương vị, dinh dưỡng..."
                placeholderTextColor="#94A3B8"
                value={itemDesc}
                onChangeText={setItemDesc}
                multiline
              />
            </View>

            {/* Trạng thái còn hàng */}
            <View style={styles.formSwitchRow}>
              <View>
                <Text style={styles.formLabel}>Trạng thái còn hàng</Text>
                <Text style={styles.formSubLabel}>Bật để khách có thể đặt món ngay lập tức</Text>
              </View>
              <Switch
                value={itemIsAvailable}
                onValueChange={setItemIsAvailable}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={itemIsAvailable ? '#0066FF' : '#94A3B8'}
              />
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.formBottomBar}>
            <TouchableOpacity
              style={styles.formCancelBtn}
              onPress={() => setItemModalVisible(false)}
            >
              <Text style={styles.formCancelText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.formSaveBtn}
              onPress={handleSaveItem}
              disabled={submittingItem}
            >
              {submittingItem ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.formSaveText}>Lưu Món Ăn</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL QUẢN LÝ DANH MỤC */}
      {/* ======================================================== */}
      <Modal visible={catModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quản Lý Danh Mục</Text>
              <TouchableOpacity onPress={() => setCatModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Danh sách danh mục hiện có */}
            <Text style={[styles.subTitle, { marginTop: 12 }]}>Danh mục hiện có ({categories.length})</Text>
            <ScrollView style={{ maxHeight: 180 }}>
              {categories.map((c) => (
                <View key={c.id} style={styles.catManageRow}>
                  <Text style={styles.catManageName}>{c.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => { setEditingCat(c); setNewCatName(c.name); }}>
                      <Ionicons name="pencil" size={16} color="#0066FF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteCategory(c)}>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Form thêm/sửa danh mục */}
            <Text style={[styles.subTitle, { marginTop: 14 }]}>
              {editingCat ? `Sửa tên: "${editingCat.name}"` : 'Thêm danh mục mới'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              <TextInput
                style={[styles.formInput, { flex: 1 }]}
                placeholder="Tên danh mục (vd: Món nướng, Đồ uống...)"
                placeholderTextColor="#94A3B8"
                value={newCatName}
                onChangeText={setNewCatName}
              />
              <TouchableOpacity
                style={styles.btnAddCatConfirm}
                onPress={handleSaveCategory}
                disabled={submittingCat}
              >
                {submittingCat ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnAddCatConfirmText}>{editingCat ? 'Lưu' : 'Thêm'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL QUẢN LÝ TOPPING / OPTION GROUPS */}
      {/* ======================================================== */}
      <Modal visible={optionsModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

          <View style={styles.formHeader}>
            <TouchableOpacity onPress={() => setOptionsModalVisible(false)} style={styles.formCloseBtn}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.formTitle}>Topping & Tùy Chọn</Text>
              <Text style={styles.formSubTitle} numberOfLines={1}>{currentManagingItem?.name}</Text>
            </View>
          </View>

          <ScrollView style={styles.formScroll}>
            {/* Danh sách các nhóm tùy chọn hiện có */}
            {currentManagingItem?.optionGroups?.map((group: any) => (
              <View key={group.id} style={styles.optionGroupCard}>
                <View style={styles.optionGroupHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionGroupName}>{group.name}</Text>
                    <Text style={styles.optionGroupSub}>
                      {group.required ? 'Bắt buộc chọn' : 'Tùy chọn'} • Tối đa {group.maxSelect || 1} lựa chọn
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDeleteOptionGroup(group.id)}
                    style={styles.deleteGroupBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>

                {/* Danh sách tùy chọn con */}
                <View style={styles.optionsList}>
                  {group.options?.map((opt: any) => (
                    <View key={opt.id} style={styles.optionRow}>
                      <Text style={styles.optionName}>• {opt.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text style={styles.optionPrice}>+{formatPrice(opt.price || 0)}</Text>
                        <TouchableOpacity onPress={() => handleDeleteOption(opt.id)}>
                          <Ionicons name="close-circle-outline" size={16} color="#94A3B8" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Form thêm nhanh tùy chọn con vào nhóm này */}
                {addingToGroupId === group.id ? (
                  <View style={styles.addOptionInlineBox}>
                    <TextInput
                      style={[styles.formInput, { flex: 1.5 }]}
                      placeholder="Tên tùy chọn (vd: Trân châu)"
                      placeholderTextColor="#94A3B8"
                      value={newOptionName}
                      onChangeText={setNewOptionName}
                    />
                    <TextInput
                      style={[styles.formInput, { flex: 1 }]}
                      placeholder="Giá (+VNĐ)"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={newOptionPrice}
                      onChangeText={setNewOptionPrice}
                    />
                    <TouchableOpacity
                      style={styles.btnSaveInlineOption}
                      onPress={() => handleAddOption(group.id)}
                      disabled={submittingOption}
                    >
                      <Text style={styles.btnSaveInlineOptionText}>Lưu</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.btnAddOptionToGroup}
                    onPress={() => {
                      setAddingToGroupId(group.id);
                      setNewOptionName('');
                      setNewOptionPrice('');
                    }}
                  >
                    <Ionicons name="add" size={15} color="#0066FF" />
                    <Text style={styles.btnAddOptionToGroupText}>Thêm lựa chọn con vào nhóm</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Form tạo nhóm tùy chọn mới */}
            <View style={styles.createGroupCard}>
              <Text style={styles.createGroupTitle}>+ Tạo Nhóm Tùy Chọn Mới</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Tên nhóm (ví dụ: Kích cỡ Size, Topping thêm, Mức đá...)"
                placeholderTextColor="#94A3B8"
                value={newGroupName}
                onChangeText={setNewGroupName}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 }}>
                <Text style={styles.formLabel}>Bắt buộc khách phải chọn:</Text>
                <Switch
                  value={newGroupRequired}
                  onValueChange={setNewGroupRequired}
                  trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                  thumbColor={newGroupRequired ? '#0066FF' : '#94A3B8'}
                />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={styles.formLabel}>Số lựa chọn tối đa:</Text>
                <TextInput
                  style={[styles.formInput, { width: 60, textAlign: 'center' }]}
                  keyboardType="numeric"
                  value={newGroupMaxSelect}
                  onChangeText={setNewGroupMaxSelect}
                />
              </View>

              <TouchableOpacity
                style={styles.btnCreateGroup}
                onPress={handleAddOptionGroup}
                disabled={submittingOption}
              >
                {submittingOption ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnCreateGroupText}>Tạo Nhóm Tùy Chọn</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  btnAddItem: {
    backgroundColor: '#0066FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnAddItemText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  catChipActive: {
    backgroundColor: '#0066FF',
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  catChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  catChipManage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  catChipManageText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0066FF',
  },
  scrollContent: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 12,
  },
  itemImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    paddingRight: 6,
  },
  stockSwitchWrap: {
    transform: [{ scale: 0.8 }],
  },
  itemDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  priceBase: {
    fontSize: 12,
    color: '#475569',
  },
  priceCustomer: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  stockPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  itemActionsBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  itemActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
  },
  itemActionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0066FF',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  formCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  formSubTitle: {
    fontSize: 12,
    color: '#64748B',
  },
  formScroll: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  formSubLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  reqMark: {
    color: '#DC2626',
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  formHint: {
    fontSize: 11,
    color: '#0066FF',
    marginTop: 4,
    lineHeight: 15,
  },
  catPickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catPickChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0066FF',
  },
  catPickText: {
    fontSize: 12,
    color: '#475569',
  },
  catPickTextActive: {
    color: '#0066FF',
    fontWeight: '700',
  },
  previewImage: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: '#F1F5F9',
  },
  formSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  formBottomBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  formCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  formCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  formSaveBtn: {
    flex: 2,
    backgroundColor: '#0066FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  formSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  catManageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  catManageName: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  btnAddCatConfirm: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAddCatConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  optionGroupCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  optionGroupName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  optionGroupSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  deleteGroupBtn: {
    padding: 6,
  },
  optionsList: {
    paddingVertical: 8,
    gap: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionName: {
    fontSize: 13,
    color: '#334155',
  },
  optionPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  btnAddOptionToGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginTop: 6,
  },
  btnAddOptionToGroupText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066FF',
  },
  addOptionInlineBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  btnSaveInlineOption: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSaveInlineOptionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  createGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  createGroupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0066FF',
    marginBottom: 10,
  },
  btnCreateGroup: {
    backgroundColor: '#0066FF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnCreateGroupText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
