const DIA_CHI_API = (() => {
  const laHttp = window.location.protocol.startsWith("http");
  const port = window.location.port;

  if (!laHttp) return "http://127.0.0.1:8000/api";

  if (["3000", "5173", "5500", "5501"].includes(port)) {
    return "http://127.0.0.1:8000/api";
  }

  return window.location.origin + "/api";
})();

function layToken() {
  return sessionStorage.getItem("token_quan_ly_do_uong") || "";
}

async function goiApi(duongDan, tuyChon = {}) {
  const headers = tuyChon.headers || {};
  headers["Content-Type"] = "application/json";
  const token = layToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  // Nếu body là JSON dạng snake_case thì đổi khóa sang PascalCase trước khi gửi lên backend
  function snakeToPascalKey(k) {
    // Ánh xạ rõ ràng cho các tên trường frontend hay dùng sang tên PascalCase của backend
    const explicit = {
      'sdt': 'SoDienThoai',
      'so_dien_thoai': 'SoDienThoai',
      'vai_tro': 'ChucVu',
      'ten_nv': 'TenNV',
      'ten_sp': 'TenSP',
      'ma_sp': 'MaSP',
      'ma_nv': 'MaNV',
      'ma_nl': 'MaNL',
      'ma_ncc': 'MaNCC',
      'ma_kh': 'MaKH',
      'ma_hd': 'MaHD',
      'ma_pn': 'MaPN',
      'mat_khau': 'MatKhau',
      'username': 'Username',
      'trang_thai': 'TrangThai',
      'so_luong': 'SoLuong',
      'don_gia': 'DonGia',
      'tong_tien': 'TongTien',
      'ghi_chu': 'GhiChu',
      'diem_su_dung': 'DiemSuDung',
      'phuong_thuc_thanh_toan': 'PhuongThucThanhToan',
    };
    if (explicit[k]) return explicit[k];
    // Giữ nguyên các viết tắt quen thuộc mà backend đang dùng (MaNV, MaSP, MaNL, MaNCC, MaHD, MaPN, MaKH, ...)
    const abbr = new Set(['nv','sp','nl','ncc','hd','pn','kh']);
    return k.split('_').map(p => {
      if (abbr.has(p)) return p.toUpperCase();
      return p.charAt(0).toUpperCase() + p.slice(1);
    }).join('');
  }
  function convertOut(obj) {
    if (Array.isArray(obj)) return obj.map(convertOut);
    if (obj && typeof obj === 'object') {
      const out = {};
      for (const k of Object.keys(obj)) {
        out[snakeToPascalKey(k)] = convertOut(obj[k]);
      }
      return out;
    }
    return obj;
  }
  const options = { ...tuyChon, headers };
  if (options.body && headers['Content-Type'].startsWith('application/json')) {
    try {
      const obj = JSON.parse(options.body);
      options.body = JSON.stringify(convertOut(obj));
    } catch (e) {
      // Giữ nguyên body nếu không parse được JSON
    }
  }

  const phanHoi = await fetch(DIA_CHI_API + duongDan, options);
  const duLieu = await phanHoi.json().catch(() => ({}));
  if (!phanHoi.ok) {
    // Chuẩn hóa lỗi về chuỗi dễ đọc hơn vì Pydantic đôi khi trả về mảng lỗi
    let errMsg = "Có lỗi khi gọi API";
    if (duLieu && duLieu.detail) {
      if (Array.isArray(duLieu.detail)) errMsg = duLieu.detail.map(d => d.msg || d.message || JSON.stringify(d)).join('; ');
      else if (typeof duLieu.detail === 'object') errMsg = JSON.stringify(duLieu.detail);
      else errMsg = String(duLieu.detail);
    }
    throw new Error(errMsg);
  }
  // Đổi khóa PascalCase từ server về snake_case để frontend dùng thống nhất
  function pascalToSnakeKey(k) {
    let newk = "";
    for (let i = 0; i < k.length; i++) {
      const ch = k[i];
      if (ch >= 'A' && ch <= 'Z' && i !== 0 && (k[i-1] >= 'a' && k[i-1] <= 'z' || (i+1<k.length && k[i+1] >= 'a' && k[i+1] <= 'z'))) {
        newk += '_';
      }
      newk += ch;
    }
    return newk.toLowerCase();
  }
  function convert(obj) {
    if (Array.isArray(obj)) return obj.map(convert);
    if (obj && typeof obj === 'object') {
      const out = {};
      for (const k of Object.keys(obj)) {
        out[pascalToSnakeKey(k)] = convert(obj[k]);
      }
      return out;
    }
    return obj;
  }
  return convert(duLieu);
}

const api = {
  dangNhap: (username, mat_khau) => goiApi("/dangnhap", { method: "POST", body: JSON.stringify({ username, mat_khau }) }),
  toi: () => goiApi("/toi"),

  laySanPham: () => goiApi("/sanpham"),
  themSanPham: (data) => goiApi("/sanpham", { method: "POST", body: JSON.stringify(data) }),
  suaSanPham: (ma, data) => goiApi(`/sanpham/${ma}`, { method: "PUT", body: JSON.stringify(data) }),
  doiTrangThaiKhoSanPham: (ma, data) => goiApi(`/sanpham/${ma}/trangthaikho`, { method: "PATCH", body: JSON.stringify(data) }),
  xoaSanPham: (ma) => goiApi(`/sanpham/${ma}`, { method: "DELETE" }),

  layNguyenLieu: () => goiApi("/nguyenlieu"),
  themNguyenLieu: (data) => goiApi("/nguyenlieu", { method: "POST", body: JSON.stringify(data) }),
  suaNguyenLieu: (ma, data) => goiApi(`/nguyenlieu/${ma}`, { method: "PUT", body: JSON.stringify(data) }),
  xoaNguyenLieu: (ma) => goiApi(`/nguyenlieu/${ma}`, { method: "DELETE" }),

  layKhachHang: () => goiApi("/khachhang"),
  layThongKeKhachHang: () => goiApi("/khachhang/thongke/tongquan"),
  layLichSuKhachHang: (ma) => goiApi(`/khachhang/${ma}/lichsu`),
  themKhachHang: (data) => goiApi("/khachhang", { method: "POST", body: JSON.stringify(data) }),
  suaKhachHang: (ma, data) => goiApi(`/khachhang/${ma}`, { method: "PUT", body: JSON.stringify(data) }),
  xoaKhachHang: (ma) => goiApi(`/khachhang/${ma}`, { method: "DELETE" }),

  layNhaCungCap: () => goiApi("/nhacungcap"),
  themNhaCungCap: (data) => goiApi("/nhacungcap", { method: "POST", body: JSON.stringify(data) }),
  suaNhaCungCap: (ma, data) => goiApi(`/nhacungcap/${ma}`, { method: "PUT", body: JSON.stringify(data) }),
  xoaNhaCungCap: (ma) => goiApi(`/nhacungcap/${ma}`, { method: "DELETE" }),

  layNhanVien: () => goiApi("/nhanvien"),
  themNhanVien: (data) => goiApi("/nhanvien", { method: "POST", body: JSON.stringify(data) }),
  suaNhanVien: (ma, data) => goiApi(`/nhanvien/${ma}`, { method: "PUT", body: JSON.stringify(data) }),
  xoaNhanVien: (ma) => goiApi(`/nhanvien/${ma}`, { method: "DELETE" }),

  layDonHang: () => goiApi("/donhang"),
  layChiTietDon: (ma) => goiApi(`/donhang/${ma}`),
  taoDonHang: (data) => goiApi("/donhang", { method: "POST", body: JSON.stringify(data) }),
  huyDonHang: (ma) => goiApi(`/donhang/${ma}/huy`, { method: "POST", body: JSON.stringify({}) }),
thanhToan: (ma, data) => goiApi(`/donhang/${ma}/thanhtoan`, { method: "POST", body: JSON.stringify(data) }),

  layPhieuNhap: () => goiApi("/nhaphang"),
  layChiTietPhieuNhap: (ma) => goiApi(`/nhaphang/${ma}`),
  taoPhieuNhap: (data) => goiApi("/nhaphang", { method: "POST", body: JSON.stringify(data) }),

  layBaoCao: () => goiApi("/baocao/tongquan")
};
