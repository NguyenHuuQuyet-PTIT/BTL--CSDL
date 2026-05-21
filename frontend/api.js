// File này chỉ gọi API. Không chứa câu SQL, dữ liệu mẫu, mật khẩu hay xử lý backend.
// Nếu mở web qua backend ở cổng 8000: gọi API cùng domain.
// Nếu mở frontend riêng bằng Live Server / python http.server: gọi backend ở 127.0.0.1:8000.
const DIA_CHI_API = (() => {
  const laHttp = window.location.protocol.startsWith("http");
  const port = window.location.port;

  if (!laHttp) return "http://127.0.0.1:8000/api";

  // Các cổng thường dùng khi chạy frontend riêng.
  if (["3000", "5173", "5500", "5501"].includes(port)) {
    return "http://127.0.0.1:8000/api";
  }

  // Khi chạy bằng python chaybackend.py, frontend và backend cùng cổng 8000.
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

  const phanHoi = await fetch(DIA_CHI_API + duongDan, { ...tuyChon, headers });
  const duLieu = await phanHoi.json().catch(() => ({}));
  if (!phanHoi.ok) {
    throw new Error(duLieu.detail || "Có lỗi khi gọi API");
  }
  return duLieu;
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

  layPhieuNhap: () => goiApi("/nhaphang"),
  layChiTietPhieuNhap: (ma) => goiApi(`/nhaphang/${ma}`),
  taoPhieuNhap: (data) => goiApi("/nhaphang", { method: "POST", body: JSON.stringify(data) }),

  layBaoCao: () => goiApi("/baocao/tongquan")
};
