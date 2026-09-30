/**
 * Utility to download CSV files with UTF-8 BOM for Microsoft Excel compatibility
 */
export function downloadCSV(filename, headers, rows) {
  // \uFEFF is UTF-8 Byte Order Mark (BOM) ensuring Excel displays Vietnamese accents properly
  let csvContent = '\uFEFF';

  // Add header row
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  csvContent += headers.map(escapeCell).join(',') + '\r\n';

  // Add data rows
  rows.forEach((row) => {
    const rowContent = row.map(escapeCell).join(',');
    csvContent += rowContent + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Pre-configured CSV Exporter for Orders
 */
export function exportOrdersCSV(orders) {
  const headers = [
    'Mã Đơn Hàng',
    'Ngày Đặt',
    'Khách Hàng',
    'Số Điện Thoại',
    'Địa Chỉ Giao Hàng',
    'Trạng Thái',
    'Tổng Tiền (VNĐ)',
    'Phương Thức Thanh Toán',
    'Trạng Thái Thanh Toán',
    'Đơn Vị Vận Chuyển',
    'Mã Vận Đơn',
    'Sản Phẩm'
  ];

  const rows = orders.map((o) => {
    const custName = o.customer?.name || (typeof o.customer === 'string' ? o.customer : 'Khách vãng lai');
    const custPhone = o.customer?.phone || '';
    const custAddress = o.customer?.address || '';
    const itemsStr = (o.items || [])
      .map((it) => `${it.name} (x${it.quantity})`)
      .join('; ');

    return [
      o.code || o.id,
      o.date || '',
      custName,
      custPhone,
      custAddress,
      o.status || '',
      o.summary?.total || o.total || 0,
      o.summary?.paymentMethod || o.paymentMethod || 'COD',
      o.summary?.paymentStatus || o.paymentStatus || 'Chưa thanh toán',
      o.shipping?.providerName || o.shipping?.provider || 'Tiêu chuẩn',
      o.shipping?.trackingNo || '',
      itemsStr
    ];
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadCSV(`Danh_sach_don_hang_${timestamp}.csv`, headers, rows);
}

/**
 * Pre-configured CSV Exporter for Inventory
 */
export function exportInventoryCSV(inventoryList) {
  const headers = [
    'Mã SKU',
    'Tên Sản Phẩm',
    'Phân Loại',
    'Danh Mục',
    'Giá Bán (VNĐ)',
    'Tồn Kho Thực Tế',
    'Đang Giao',
    'Đã Bán',
    'Kho Lưu Trữ',
    'Trạng Thái Tồn Kho'
  ];

  const rows = inventoryList.map((item) => [
    item.sku || item.id,
    item.name,
    item.variant || 'Mặc định',
    item.category || '',
    item.price || 0,
    item.stock || 0,
    item.reserved || 0,
    item.sold || 0,
    item.warehouse || 'Kho Tổng',
    (item.stock <= 5 ? 'Sắp hết hàng' : item.stock === 0 ? 'Hết hàng' : 'Còn hàng')
  ]);

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadCSV(`Bao_cao_ton_kho_${timestamp}.csv`, headers, rows);
}

/**
 * Pre-configured CSV Exporter for Finance Transactions
 */
export function exportFinanceCSV(transactions, balance) {
  const headers = [
    'Mã Giao Dịch',
    'Thời Gian',
    'Loại Giao Dịch',
    'Mô Tả / Nội Dung',
    'Số Tiền (VNĐ)',
    'Trạng Thái',
    'Số Dư Sau GD (VNĐ)'
  ];

  const rows = transactions.map((t) => [
    t.id || t.code,
    t.date || t.time || '',
    t.type || (t.amount > 0 ? 'Cộng tiền' : 'Rút tiền'),
    t.description || t.title || '',
    t.amount || 0,
    t.status || 'Thành công',
    t.balanceAfter || balance || ''
  ]);

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadCSV(`Sao_ke_tai_chinh_${timestamp}.csv`, headers, rows);
}
