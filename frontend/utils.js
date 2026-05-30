// Các hàm tiện ích dùng chung cho frontend (được tách từ app.js)
const tien = (n) => Number(n || 0).toLocaleString("vi-VN") + " ₫";
const so = (n) => Number(n || 0).toLocaleString("vi-VN");
const ngayVietNam = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const thoatHtml = (v) => String(v ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
function boDauTiengViet(v) {
  return String(v ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
const laQuanLy = () => boDauTiengViet(trangThai.nguoiDung && trangThai.nguoiDung.vai_tro) === "quan_ly";
const tenVaiTro = (v) => {
  const chuanHoa = boDauTiengViet(v).replace(/\s+/g, "_");
  return chuanHoa === "quan_ly" ? "Quản lý" : "Nhân viên";
};
const tenVaiTroHienThi = (nguoiDung) => nguoiDung ? (nguoiDung.chuc_vu || tenVaiTro(nguoiDung.vai_tro)) : "";
const tenTrangThaiNL = (v) => ({ con_hang: "Còn hàng", sap_het: "Sắp hết", het_hang: "Hết hàng" }[v] || v);
const tenTrangThaiKhoSP = (v) => ({ con_hang: "Còn hàng", sap_het: "Sắp hết", het_hang: "Hết hàng", chua_co_cong_thuc: "Chưa có công thức" }[v] || v);
const tenCachChinhKhoSP = (v) => ({ tu_dong: "Tự động theo kho", con_hang: "Quản lý đặt: Còn hàng", sap_het: "Quản lý đặt: Sắp hết", het_hang: "Quản lý đặt: Hết hàng" }[v] || "Tự động theo kho");
const optionTrangThaiKho = (v) => [`tu_dong`, `con_hang`, `sap_het`, `het_hang`].map(x => `<option value="${x}" ${v===x?'selected':''}>${tenCachChinhKhoSP(x)}</option>`).join("");
const tenTrangThaiNV = (v) => v === "dang_lam" ? "Đang làm" : "Nghỉ làm";
const tenTrangThaiKH = (v) => v === "dang_hoat_dong" ? "Đang hoạt động" : "Ngừng hoạt động";
const tenCapBac = (v) => ({ thuong: "Thường", bac: "Bạc", vang: "Vàng", vip: "VIP" }[v] || "Thường");
const phanTramGiamCapBac = (v) => ({ thuong: 0, bac: 3, vang: 5, vip: 10 }[v] || 0);
const GIA_TRI_MOT_DIEM = 1000;

function dinhDangThoiGian(gt) { if (!gt) return ""; const raw = String(gt).replace(" ", "T"); const d = new Date(raw); return Number.isNaN(d.getTime()) ? String(gt) : d.toLocaleString("vi-VN", { hour12: false }); }
function dinhDangNgay(gt) { if (!gt) return ""; const d = new Date(String(gt).replace(" ", "T")); return Number.isNaN(d.getTime()) ? String(gt) : d.toLocaleDateString("vi-VN"); }
function capNhatDongHo() { const el = document.getElementById("dongHoThoiGian"); if (el) el.textContent = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false }); }
function baoLoi(err) { hienThongBao(err.message || "Có lỗi xảy ra", true); }
function hienThongBao(noiDung, laLoi = false) { document.querySelector(".toast")?.remove(); const div = document.createElement("div"); div.className = "toast" + (laLoi ? " loi" : ""); div.textContent = noiDung; document.body.appendChild(div); setTimeout(() => div.remove(), 3200); }
function dinhDangNgayGiaoDien() { const now = new Date(); const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Asia/Ho_Chi_Minh" }).format(now); const date = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(now); return `${weekday}, ${date}`; }

const icons = {
  coffee: `<svg viewBox="0 0 24 24"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8h1a4 4 0 0 1 0 8h-1"/><path d="M6 8h10v7a5 5 0 0 1-5 5h0a5 5 0 0 1-5-5Z"/><path d="M6 8h10"/></svg>`,
  dashboard: `<svg viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
  cart: `<svg viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h8.68a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  menu: `<svg viewBox="0 0 24 24"><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M4 2v7a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1V2"/><path d="M8 2v7a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1V2"/><path d="M12 2v7a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1V2"/><path d="M16 3l5 5c.6.6.6 1.6 0 2.2L16 19"/></g></svg>`,
  package: `<svg viewBox="0 0 24 24"><path d="m21 16-9 5-9-5V8l9-5 9 5Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  import: `<svg viewBox="0 0 24 24"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 2v4h6V2"/><path d="M8 13h8"/><path d="M8 17h5"/><path d="M8 9h1"/></svg>`,
  truck: `<svg viewBox="0 0 24 24"><path d="M14 18V6a2 2 0 0 0-2-2H3v14Z"/><path d="M14 9h4l3 3v6h-7Z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>`,
  users: `<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  employee: `<svg viewBox="0 0 24 24"><circle cx="10" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h4"/><circle cx="18" cy="18" r="3"/><path d="M18 14v1"/><path d="M18 21v1"/><path d="M14 18h1"/><path d="M21 18h1"/></svg>`,
  report: `<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16V9"/><path d="M12 16V5"/><path d="M17 16v-3"/></svg>`,
  logout: `<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>`,
  trend: `<svg viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>`,
  bag: `<svg viewBox="0 0 24 24"><path d="M6 7h12l1 14H5L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>`,
  cube: `<svg viewBox="0 0 24 24"><path d="m21 16-9 5-9-5V8l9-5 9 5Z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/></svg>`,
  people: `<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="8" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M17 4.13a4 4 0 0 1 0 7.75"/></svg>`
};

function nut(icon, text) { return `<span class="menu-icon">${icon}</span><span>${text}</span>`; }
function nhanBan(t) { return `<span class="nhan ${t === "dang_ban" ? "xanh" : "do"}">${t === "dang_ban" ? "Đang bán" : "Ngừng bán"}</span>`; }
function nhanNL(t) { const cls = t === "con_hang" ? "xanh" : t === "sap_het" ? "vang" : "do"; return `<span class="nhan ${cls}">${tenTrangThaiNL(t)}</span>`; }
function nhanKhoSP(sp) { const t = sp.trang_thai_kho || "het_hang"; const cls = t === "con_hang" ? "xanh" : t === "sap_het" ? "vang" : "do"; const tay = sp.trang_thai_kho_duoc_chinh_tay ? " • chỉnh tay" : ""; return `<span class="nhan ${cls}" title="${thoatHtml(tenCachChinhKhoSP(sp.trang_thai_kho_chinh_tay || 'tu_dong'))}">${tenTrangThaiKhoSP(t)}${tay}</span>`; }
function soLyBanDuoc(sp) { const soLy = Number(sp.so_ly_co_the_ban || 0); const tuDong = sp.trang_thai_kho_duoc_chinh_tay ? ` • tự động: ${tenTrangThaiKhoSP(sp.trang_thai_kho_tu_dong)}` : ""; if ((sp.trang_thai_kho || "") === "chua_co_cong_thuc") return "Chưa có công thức kho"; return (soLy > 0 ? `Còn bán được khoảng ${so(soLy)} ly` : "Không đủ nguyên liệu để bán") + tuDong; }
function nhanCapBac(t) { return `<span class="nhan capbac ${t || 'thuong'}">${tenCapBac(t)}</span>`; }
function nhanTTKH(t) { return `<span class="nhan ${t === 'dang_hoat_dong' ? 'xanh' : 'do'}">${tenTrangThaiKH(t)}</span>`; }

// Xuất ra global vì dự án này không dùng module; `app.js` sẽ gọi trực tiếp
