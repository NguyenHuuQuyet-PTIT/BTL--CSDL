const ungDung = document.getElementById("ungdung");

const trangThai = {
  nguoiDung: JSON.parse(sessionStorage.getItem("nguoi_dung_do_uong") || "null"),
  trang: "tongquan",
  sanPham: [], khachHang: [], nguyenLieu: [], nhaCungCap: [], nhanVien: [], donHang: [], phieuNhap: [], baoCao: null,
  gioHang: [], hangNhap: [], boLocKhach: { tuKhoa: "", capBac: "tat_ca", trangThai: "tat_ca" }
};

const tien = (n) => Number(n || 0).toLocaleString("vi-VN") + " ₫";
const so = (n) => Number(n || 0).toLocaleString("vi-VN");
const ngayVietNam = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const thoatHtml = (v) => String(v ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const laQuanLy = () => trangThai.nguoiDung && trangThai.nguoiDung.vai_tro === "quan_ly";
const tenVaiTro = (v) => v === "quan_ly" ? "Quản lý" : "Nhân viên";
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

function cacMucMenu() {
  const chung = [["tongquan", icons.dashboard, "Tổng quan"], ["banhang", icons.cart, "Bán hàng"], ["khachhang", icons.users, "Khách hàng"]];
  const quanLy = [["menu", icons.menu, "Quản lý Menu"], ["kho", icons.package, "Kho hàng"], ["nhaphang", icons.import, "Nhập hàng"], ["nhacungcap", icons.truck, "Nhà cung cấp"], ["nhanvien", icons.employee, "Nhân viên"], ["baocao", icons.report, "Báo cáo"]];
  return laQuanLy() ? [chung[0], chung[1], ...quanLy.slice(0,4), chung[2], ...quanLy.slice(4)] : chung;
}
function dangXuat() { sessionStorage.removeItem("token_quan_ly_do_uong"); sessionStorage.removeItem("nguoi_dung_do_uong"); trangThai.nguoiDung = null; trangThai.gioHang = []; renderDangNhap(); }

function renderDangNhap() {
  ungDung.innerHTML = `
  <div class="dangnhap">
    <section class="dangnhap-trai">
      <div class="login-brand">
        <div class="logo"><span class="logo-dau">${icons.coffee}</span><span>Drink Shop</span></div>
      </div>
      <div class="login-hero">
        <h1>Quản lý cửa<br>hàng đồ uống</h1>
        <p>Hệ thống giúp bạn quản lý bán hàng, kho hàng, khách hàng và báo cáo doanh thu một cách dễ dàng.</p>
        <div class="the-tinh-nang">
          <div><b>Bán hàng nhanh</b><span>Giao diện POS đơn giản</span></div>
          <div><b>Quản lý kho</b><span>Theo dõi tồn kho realtime</span></div>
          <div><b>Khách hàng</b><span>Điểm tích lũy thành viên</span></div>
          <div><b>Báo cáo</b><span>Thống kê doanh thu</span></div>
        </div>
      </div>
      <p class="copyright">© Quyet DEV 2026</p>
    </section>
    <section class="dangnhap-phai">
      <form class="hop-dangnhap" id="formDangNhap">
        <div class="mobile-logo"><div class="logo"><span class="logo-dau">${icons.coffee}</span><span>Drink Shop</span></div></div>
        <div class="login-title">
          <h2>Đăng nhập</h2>
          <p>Nhập tài khoản để vào hệ thống</p>
        </div>
        <div class="nhom-form">
          <label>Tên đăng nhập</label>
          <input id="username" required autocomplete="username" placeholder="Nhập tên đăng nhập...">
        </div>
        <div class="nhom-form">
          <label>Mật khẩu</label>
          <input id="matKhau" type="password" required autocomplete="current-password" placeholder="Nhập mật khẩu...">
        </div>
        <button class="nut chinh login-submit" type="submit">Đăng nhập</button>
        <div class="loi" id="loiDangNhap"></div>
        <div class="demo-box">
          <p>Tài khoản demo:</p>
          <div><span>👑 Quản lý:</span><b>admin / admin</b></div>
          <div><span>👤 Nhân viên:</span><b>staff / staff</b></div>
        </div>
      </form>
    </section>
  </div>`;
  formDangNhap.addEventListener("submit", async (e) => {
    e.preventDefault();
    loiDangNhap.textContent = "";
    const btn = e.submitter;
    const oldText = btn.textContent;
    btn.textContent = "Đang đăng nhập...";
    btn.disabled = true;
    try {
      const data = await api.dangNhap(username.value.trim(), matKhau.value);
      sessionStorage.setItem("token_quan_ly_do_uong", data.token);
      sessionStorage.setItem("nguoi_dung_do_uong", JSON.stringify(data.nguoi_dung));
      trangThai.nguoiDung = data.nguoi_dung;
      trangThai.trang = "tongquan";
      await taiDuLieuTheoTrang();
      renderApp();
      hienThongBao("Đăng nhập thành công! Chào mừng bạn 👋");
    } catch (err) {
      loiDangNhap.textContent = err.message;
    } finally {
      btn.textContent = oldText;
      btn.disabled = false;
    }
  });
}
async function taiDuLieuTheoTrang() {
  if (!trangThai.nguoiDung) return;
  const t = trangThai.trang;
  if (["tongquan", "banhang", "menu"].includes(t)) trangThai.sanPham = await api.laySanPham();
  if (["tongquan", "banhang", "khachhang", "baocao"].includes(t)) trangThai.khachHang = await api.layKhachHang();
  if (["tongquan", "baocao"].includes(t)) trangThai.donHang = await api.layDonHang();
  if (laQuanLy() && ["tongquan", "kho", "menu", "nhaphang", "baocao"].includes(t)) trangThai.nguyenLieu = await api.layNguyenLieu();
  if (laQuanLy() && ["nhaphang", "nhacungcap"].includes(t)) trangThai.nhaCungCap = await api.layNhaCungCap();
  if (laQuanLy() && t === "nhanvien") trangThai.nhanVien = await api.layNhanVien();
  if (laQuanLy() && t === "nhaphang") trangThai.phieuNhap = await api.layPhieuNhap();
  if (laQuanLy() && ["tongquan", "baocao"].includes(t)) trangThai.baoCao = await api.layBaoCao();
}
function renderApp() {
  const menu = cacMucMenu().map(([ma, icon, ten]) => `<button class="${trangThai.trang === ma ? "dang-chon" : ""}" onclick="chuyenTrang('${ma}')">${nut(icon, ten)}${trangThai.trang === ma ? '<i></i>' : ''}</button>`).join("");
  ungDung.innerHTML = `<div class="khung-app">
    <aside class="thanh-ben">
      <div class="sidebar-logo">
        <div class="logo"><span class="logo-dau">${icons.coffee}</span><span><b>Drink Shop</b><small>Quản lý cửa hàng</small></span></div>
        <button class="sidebar-toggle" type="button" aria-label="Thu gọn">‹</button>
      </div>
      <nav class="menu">${menu}</nav>
      <div class="sidebar-footer">
        <div class="nguoi-dung"><b>${thoatHtml(trangThai.nguoiDung.ten_nv)}</b><span>${tenVaiTro(trangThai.nguoiDung.vai_tro)}</span></div>
        <button class="nut dangxuat" onclick="dangXuat()">${nut(icons.logout, 'Đăng xuất')}</button>
      </div>
    </aside>
    <main class="khu-vuc-chinh"><section class="noi-dung" id="noiDung"></section></main>
  </div>`;
  capNhatDongHo();
  window.scrollTo(0, 0);
  document.querySelector(".khu-vuc-chinh")?.scrollTo(0, 0);
  renderTrang();
}
async function chuyenTrang(trang) { trangThai.trang = trang; try { await taiDuLieuTheoTrang(); renderApp(); } catch (err) { baoLoi(err); } }
async function lamMoiTrang() { try { await taiDuLieuTheoTrang(); renderApp(); hienThongBao("Dữ liệu đã được làm mới"); } catch (err) { baoLoi(err); } }
async function lamMoiNhieuTrang() { const congViec = [api.laySanPham().then(d => trangThai.sanPham = d), api.layKhachHang().then(d => trangThai.khachHang = d), api.layDonHang().then(d => trangThai.donHang = d)]; if (laQuanLy()) { congViec.push(api.layNguyenLieu().then(d => trangThai.nguyenLieu = d)); congViec.push(api.layBaoCao().then(d => trangThai.baoCao = d)); } await Promise.all(congViec); }
function renderTrang() { if (!laQuanLy() && !["tongquan", "banhang", "khachhang"].includes(trangThai.trang)) trangThai.trang = "tongquan"; ({ tongquan: renderTongQuan, banhang: renderBanHang, menu: renderMenu, kho: renderKho, nhaphang: renderNhapHang, nhacungcap: renderNhaCungCap, khachhang: renderKhachHang, nhanvien: renderNhanVien, baocao: renderBaoCao }[trangThai.trang] || renderTongQuan)(); }
function tieuDe(tieuDe, moTa, nutThem = "") { return `<div class="tieu-de-trang"><div><h1>${tieuDe}</h1><p>${moTa}</p></div><div>${nutThem}</div></div>`; }
function theSo(label, value, sub) { return `<div class="the"><div class="so-lieu-label">${label}</div><div class="so-lieu">${value}</div><div class="so-lieu-phu">${sub}</div></div>`; }
function bang(headers, rows) { return `<div class="bang-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("") || `<tr><td colspan="${headers.length}" class="trong">Chưa có dữ liệu</td></tr>`}</tbody></table></div>`; }
function theSoDashboard(label, value, sub, icon, tone) { return `<div class="the dashboard-card ${tone || ""}"><div class="dashboard-card-head"><div class="dashboard-card-label">${label}</div><div class="dashboard-card-icon">${icon}</div></div><div class="dashboard-card-value">${value}</div><div class="dashboard-card-sub">${sub}</div></div>`; }
function danhSachDonHangDashboard(ds) { return `<div class="dashboard-table"><div class="dashboard-row dashboard-head"><span>Mã HĐ</span><span>Khách hàng</span><span>Nhân viên</span><span>Tổng tiền</span><span></span></div>${ds.map(d => { const gio = String(d.thoi_diem || "").replace("T", " ").split(" ")[1] || ""; const time = gio.slice(0, 5); return `<button class="dashboard-row" type="button" onclick="xemDonHang('${d.ma_hd}')"><span class="dashboard-code">${thoatHtml(d.ma_hd)}</span><span>${thoatHtml(d.ten_kh)}${d.cap_bac_khach ? ` <span class="nhan capbac ${d.cap_bac_khach}">${tenCapBac(d.cap_bac_khach)}</span>` : ""}</span><span>${thoatHtml(d.ten_nv || "")}</span><span><b>${tien(d.tong_tien)}</b></span><span class="dashboard-time">${time}</span></button>`; }).join("")}</div>`; }

function renderTongQuan() { const bc = trangThai.baoCao || {}; const soDon = laQuanLy() ? bc.tong_don : trangThai.donHang.length; const doanhThu = laQuanLy() ? bc.doanh_thu_hom_nay : trangThai.donHang.filter(d => String(d.thoi_diem).slice(0,10) === ngayVietNam()).reduce((s,d)=>s+Number(d.tong_tien),0); const soSP = laQuanLy() ? (bc.tong_sp || trangThai.sanPham.length) : trangThai.sanPham.filter(x=>x.trang_thai==='dang_ban').length; const soKhach = laQuanLy() ? (bc.tong_khach || trangThai.khachHang.length) : trangThai.khachHang.length; document.getElementById("noiDung").innerHTML = `${tieuDe(`Xin chào, ${thoatHtml(trangThai.nguoiDung.ten_nv)} 👋`, `${dinhDangNgayGiaoDien()} — Chào mừng bạn trở lại!`)}<div class="luoi cot-4 dashboard-cards">${theSoDashboard("Doanh thu hôm nay", tien(doanhThu), `${so(bc.so_don_hom_nay || 0)} đơn hôm nay`, icons.trend, "xanh")}${theSoDashboard("Đơn hàng", so(soDon), `${so(bc.so_don_hom_nay || 0)} hôm nay`, icons.bag, "xanh-nhat")}${theSoDashboard("Sản phẩm", so(soSP), `${so(laQuanLy() ? (bc.tong_sp_con_hang ?? trangThai.sanPham.filter(x=>x.trang_thai==='dang_ban' && x.trang_thai_kho==='con_hang').length) : trangThai.sanPham.filter(x=>x.trang_thai==='dang_ban' && x.trang_thai_kho==='con_hang').length)} còn hàng`, icons.cube, "tim")}${theSoDashboard("Khách hàng", so(soKhach), `${so(laQuanLy() ? (bc.tong_khach_vip || trangThai.khachHang.filter(k=>k.cap_bac==='vip').length) : trangThai.khachHang.filter(k=>k.cap_bac==='vip').length)} thành viên đăng ký`, icons.people, "cam")}</div><div class="the dashboard-panel" style="margin-top:18px"><div class="tieu-de-nho"><h2>Đơn hàng gần đây</h2><span class="dashboard-count">${so(trangThai.donHang.length)} tổng cộng</span></div>${danhSachDonHangDashboard(trangThai.donHang.slice(0,6))}</div>`; }
function bangDonHang(ds) { return bang(["Mã HĐ", "Thời gian", "Khách hàng", "Nhân viên", "Tổng tiền", "Xem"], ds.map(d=>`<tr><td>${d.ma_hd}</td><td>${dinhDangThoiGian(d.thoi_diem)}</td><td>${thoatHtml(d.ten_kh)} ${d.cap_bac_khach ? nhanCapBac(d.cap_bac_khach) : ""}</td><td>${thoatHtml(d.ten_nv || "")}</td><td><b>${tien(d.tong_tien)}</b></td><td><button class="nut phu nho" onclick="xemDonHang('${d.ma_hd}')">Chi tiết</button></td></tr>`)); }

function khachDangChon() { const ma = document.getElementById("chonKhach")?.value || ""; return trangThai.khachHang.find(k => k.ma_kh === ma) || null; }
function giaTheoSize(item) { return Number(item.gia_ban) + (item.size === "L" ? 5000 : item.size === "S" ? -2000 : 0); }
function tinhTamTinhGio() { return trangThai.gioHang.reduce((s,it)=>s+giaTheoSize(it)*it.so_luong,0); }
function tinhGiamCapBacFront(tamTinh, kh) { return kh ? Math.floor(tamTinh * phanTramGiamCapBac(kh.cap_bac) / 100) : 0; }
function tinhDiemDoi() { const kh = khachDangChon(); if (!kh) return { diem:0, tien:0 }; const tamTinh = tinhTamTinhGio(); const giamCap = tinhGiamCapBacFront(tamTinh, kh); const sauCap = Math.max(0, tamTinh - giamCap); const maxDiemTheoTien = Math.floor((sauCap * 0.5) / GIA_TRI_MOT_DIEM); const nhap = Number(document.getElementById("diemSuDung")?.value || 0); const diem = Math.max(0, Math.min(nhap, Number(kh.diem || 0), maxDiemTheoTien)); return { diem, tien: diem * GIA_TRI_MOT_DIEM }; }
function renderBanHang() { const loai = ["Tất cả", ...new Set(trangThai.sanPham.map(x=>x.loai))]; const khachActive = trangThai.khachHang.filter(k=>k.trang_thai === 'dang_hoat_dong'); document.getElementById("noiDung").innerHTML = `${tieuDe("Bán hàng", "Tạo hóa đơn, áp dụng hạng khách/VIP, dùng điểm, backend tự trừ kho và cộng điểm.", `<button class="nut phu" onclick="moFormKhach()">+ Thêm nhanh khách</button>`)}<div class="bo-cuc-ban-hang"><section><div class="tab" id="tabLoai">${loai.map((l,i)=>`<button class="${i===0?'dang-chon':''}" onclick="locSanPhamBan('${thoatHtml(l)}', this)">${thoatHtml(l)}</button>`).join("")}</div><div class="luoi-san-pham" id="dsSanPhamBan"></div></section><aside class="the gio-hang"><h2>Giỏ hàng</h2><label>Khách hàng</label><select id="chonKhach" onchange="capNhatThongTinKhachBanHang()"><option value="">Khách lẻ</option>${khachActive.map(k=>`<option value="${k.ma_kh}">${thoatHtml(k.ten_kh)} - ${thoatHtml(k.sdt)} - ${tenCapBac(k.cap_bac)} - ${so(k.diem)} điểm</option>`).join("")}</select><div id="thongTinKhachBanHang" class="khach-pos"></div><label>Sử dụng điểm</label><input id="diemSuDung" type="number" min="0" value="0" oninput="capNhatDiemDoi()" placeholder="1 điểm = 1.000đ, tối đa 50% hóa đơn"><div id="dsGioHang"></div><div class="tong"><span>Tạm tính</span><span id="tamTinhGio">0 ₫</span></div><div class="tong nhe"><span>Giảm hạng/VIP</span><span id="giamCapBacGio">0 ₫</span></div><div class="tong nhe"><span>Giảm bằng điểm</span><span id="giamDiemGio">0 ₫</span></div><div class="tong lon"><span>Khách cần trả</span><span id="tongGio">0 ₫</span></div><button class="nut chinh" style="width:100%" onclick="thanhToan()">Thanh toán</button></aside></div>`; locSanPhamBan("Tất cả"); renderGioHang(); }
function locSanPhamBan(loai, btn) {
  document.querySelectorAll("#tabLoai button").forEach(b => b.classList.remove("dang-chon"));
  if (btn) btn.classList.add("dang-chon");
  const ds = trangThai.sanPham.filter(sp => sp.trang_thai === "dang_ban" && (loai === "Tất cả" || sp.loai === loai));
  const iconTheoLoai = (loai) => ({ "Cà phê": "☕", "Trà sữa": "🧋", "Sinh tố": "🍓", "Nước ép": "🍊" }[loai] || "🥤");
  document.getElementById("dsSanPhamBan").innerHTML = ds.map(sp => {
    const conBan = sp.co_the_ban && Number(sp.so_ly_co_the_ban || 0) > 0;
    const canhBao = sp.canh_bao_kho || soLyBanDuoc(sp);
    const statusText = conBan ? "Còn hàng" : "Hết hàng";
    const statusClass = conBan ? "xanh" : "do";
    return `<button class="san-pham-card ${conBan ? "" : "het-hang"}" ${conBan ? `onclick="themVaoGio('${sp.ma_sp}')"` : "disabled"} title="${thoatHtml(canhBao)}">
      <div class="product-icon">${iconTheoLoai(sp.loai)}</div>
      <h3>${thoatHtml(sp.ten_sp)}</h3>
      <p class="ma-sp">${thoatHtml(sp.ma_sp)}</p>
      <div class="gia">${tien(sp.gia_ban)}</div>
      <div class="so-lieu-phu product-sub">${thoatHtml(sp.mo_ta || soLyBanDuoc(sp))}</div>
      <div class="card-actions"><span class="nhan ${statusClass}">${statusText}</span></div>
    </button>`;
  }).join("") || `<div class="trong">Không có sản phẩm</div>`;
}
function themVaoGio(ma_sp) {
  const sp = trangThai.sanPham.find(x=>x.ma_sp===ma_sp);
  if (!sp) return;
  if (sp.trang_thai !== "dang_ban") return hienThongBao("Sản phẩm đang ngừng bán", true);
  const gioiHan = Number(sp.so_ly_co_the_ban || 0);
  if (!sp.co_the_ban || gioiHan <= 0) return hienThongBao(sp.canh_bao_kho || "Sản phẩm đã hết hàng", true);
  const soDangCo = trangThai.gioHang.filter(x=>x.ma_sp===ma_sp).reduce((s,x)=>s+Number(x.so_luong||0),0);
  if (soDangCo >= gioiHan) return hienThongBao(`Chỉ còn bán được khoảng ${so(gioiHan)} ly ${sp.ten_sp}`, true);
  const cu = trangThai.gioHang.find(x=>x.ma_sp===ma_sp && x.size==="M");
  if (cu) cu.so_luong += 1;
  else trangThai.gioHang.push({ ma_sp, ten_sp: sp.ten_sp, gia_ban: sp.gia_ban, so_luong: 1, size: "M", ghi_chu: "" });
  renderGioHang();
}
function doiSoLuongGio(i, sl) {
  const item = trangThai.gioHang[i];
  const sp = trangThai.sanPham.find(x=>x.ma_sp===item.ma_sp);
  const gioiHan = Number(sp?.so_ly_co_the_ban || 999999);
  const slMoi = Math.max(1, Number(sl)||1);
  if (slMoi > gioiHan) hienThongBao(`Không đủ kho, món này chỉ còn khoảng ${so(gioiHan)} ly`, true);
  trangThai.gioHang[i].so_luong = Math.min(slMoi, Math.max(1, gioiHan));
  renderGioHang();
}
function doiSizeGio(i, size) { trangThai.gioHang[i].size = size; renderGioHang(); }
function xoaGio(i) { trangThai.gioHang.splice(i,1); renderGioHang(); hienThongBao("Đã xóa món khỏi giỏ hàng"); }
function capNhatThongTinKhachBanHang() { const diem = document.getElementById("diemSuDung"); if (diem) diem.value = 0; renderGioHang(); }
function capNhatDiemDoi() { renderGioHang(); }
function renderGioHang() {
  const div = document.getElementById("dsGioHang");
  if (!div) return;
  const kh = khachDangChon();
  const tamTinh = tinhTamTinhGio();
  const giamCap = tinhGiamCapBacFront(tamTinh, kh);
  const diemDoi = tinhDiemDoi();
  const tong = Math.max(0, tamTinh - giamCap - diemDoi.tien);
  const info = document.getElementById("thongTinKhachBanHang");
  if (info) info.innerHTML = kh
    ? `<b>${thoatHtml(kh.ten_kh)}</b> ${nhanCapBac(kh.cap_bac)}<br><span>${so(kh.diem)} điểm • Đã mua ${so(kh.so_lan_mua)} lần • Tổng chi ${tien(kh.tong_chi_tieu)}</span><br><span>Ưu đãi hạng: ${phanTramGiamCapBac(kh.cap_bac)}%</span>`
    : `<span>Khách lẻ: không tích điểm, không dùng điểm.</span>`;
  if (!trangThai.gioHang.length) {
    div.innerHTML = `<div class="empty-cart"><span>${icons.cart}</span><p>Chưa có món nào</p><small>Chọn món từ danh sách bên trái</small></div>`;
  } else {
    div.innerHTML = trangThai.gioHang.map((it,i)=>{
      const sp = trangThai.sanPham.find(x=>x.ma_sp===it.ma_sp) || {};
      const max = Number(sp.so_ly_co_the_ban || 999999);
      return `<div class="dong-gio">
        <div class="cart-row-top">
          <div><b>${thoatHtml(it.ten_sp)}</b><br><span>${tien(giaTheoSize(it))}/${it.size}</span></div>
          <button class="icon-btn danger" onclick="xoaGio(${i})" title="Xóa món">×</button>
        </div>
        <div class="cart-controls">
          <div class="qty-box"><button onclick="doiSoLuongGio(${i}, ${Math.max(1, it.so_luong-1)})">−</button><strong>${it.so_luong}</strong><button onclick="doiSoLuongGio(${i}, ${Math.min(max, it.so_luong+1)})">+</button></div>
          <div class="size-box">${['S','M','L'].map(sz => `<button class="${it.size===sz?'active':''}" onclick="doiSizeGio(${i}, '${sz}')">${sz}</button>`).join('')}</div>
          <strong class="cart-price">${tien(giaTheoSize(it) * it.so_luong)}</strong>
        </div>
      </div>`;
    }).join("");
  }
  document.getElementById("tamTinhGio").textContent = tien(tamTinh);
  document.getElementById("giamCapBacGio").textContent = "-" + tien(giamCap);
  document.getElementById("giamDiemGio").textContent = "-" + tien(diemDoi.tien);
  document.getElementById("tongGio").textContent = tien(tong);
  const diemInput = document.getElementById("diemSuDung");
  if (diemInput && Number(diemInput.value || 0) !== diemDoi.diem) diemInput.value = diemDoi.diem;
}
async function thanhToan() { if (!trangThai.gioHang.length) return hienThongBao("Giỏ hàng đang trống", true); const kh = khachDangChon(); const tamTinh = tinhTamTinhGio(); const giamCap = tinhGiamCapBacFront(tamTinh, kh); const diemDoi = tinhDiemDoi(); const tong = Math.max(0, tamTinh - giamCap - diemDoi.tien); const dongY = await xacNhan("Xác nhận thanh toán", `Tạm tính ${tien(tamTinh)}. Giảm hạng/VIP ${tien(giamCap)}. Giảm điểm ${tien(diemDoi.tien)}. Khách trả ${tien(tong)}? Kho, điểm và hạng khách sẽ cập nhật ngay.`); if (!dongY) return; try { const ma_kh = document.getElementById("chonKhach")?.value || null; const chi_tiet = trangThai.gioHang.map(x => ({ ma_sp: x.ma_sp, so_luong: x.so_luong, size: x.size, ghi_chu: x.ghi_chu || "" })); const kq = await api.taoDonHang({ ma_kh, diem_su_dung: diemDoi.diem, chi_tiet }); trangThai.gioHang = []; await lamMoiNhieuTrang(); renderBanHang(); hienThongBao(`Đã tạo hóa đơn ${kq.ma_hd}: ${tien(kq.tong_tien)}. Điểm dùng ${kq.diem_su_dung}, điểm cộng ${kq.diem_cong}.`); } catch (err) { baoLoi(err); } }
async function xemDonHang(ma_hd) { try { const hd = await api.layChiTietDon(ma_hd); moModal(`<h2>Chi tiết hóa đơn ${thoatHtml(hd.ma_hd)}</h2><p><b>Thời điểm:</b> ${dinhDangThoiGian(hd.thoi_diem)}</p><p><b>Khách hàng:</b> ${thoatHtml(hd.ten_kh)} ${nhanCapBac(hd.cap_bac_khach)} • <b>Nhân viên:</b> ${thoatHtml(hd.ten_nv)}</p>${bang(["Sản phẩm", "Size", "SL", "Đơn giá", "Ghi chú"], (hd.chi_tiet || []).map(ct => `<tr><td>${thoatHtml(ct.ten_sp)}</td><td>${thoatHtml(ct.size)}</td><td>${so(ct.so_luong)}</td><td>${tien(ct.don_gia)}</td><td>${thoatHtml(ct.ghi_chu || "")}</td></tr>`))}<div class="tong"><span>Tạm tính</span><span>${tien(hd.tong_truoc_giam || hd.tong_tien)}</span></div><div class="tong nhe"><span>Giảm hạng/VIP</span><span>-${tien(hd.giam_gia_cap_bac)}</span></div><div class="tong nhe"><span>Dùng điểm</span><span>${so(hd.diem_su_dung)} điểm = -${tien(hd.giam_gia_diem)}</span></div><div class="tong lon"><span>Tổng tiền</span><span>${tien(hd.tong_tien)}</span></div><p>Điểm cộng: <b>${so(hd.diem_cong)}</b></p><div class="hang-nut"><button class="nut chinh" onclick="dongModal()">Đóng</button></div>`); } catch (err) { baoLoi(err); } }

function congThucChu(sp) { if (!sp.cong_thuc || !sp.cong_thuc.length) return "Chưa có"; return sp.cong_thuc.map(x => `${x.ma_nl}: ${x.dinh_luong} ${x.don_vi}`).join("; "); }
function congThucTextarea(sp) { return (sp?.cong_thuc || []).map(x => `${x.ma_nl}|${x.dinh_luong}`).join("\n"); }
function docCongThuc(text) { return String(text || "").split("\n").map(x=>x.trim()).filter(Boolean).map(line => { const [ma_nl, dinh_luong] = line.split(/[|,;]/).map(x=>x.trim()); return { ma_nl, dinh_luong: Number(dinh_luong) }; }).filter(x => x.ma_nl && x.dinh_luong > 0); }
function moFormSanPham(ma) {
  const sp = trangThai.sanPham.find(x=>x.ma_sp===ma) || { trang_thai_kho_chinh_tay: 'tu_dong' };
  moModal(`<h2>${ma ? "Sửa món" : "Thêm món mới"}</h2>
  <form id="formSanPham">
    <div class="hang-form">
      <div><label>Tên sản phẩm</label><input id="ten_sp" value="${thoatHtml(sp.ten_sp || "")}" required></div>
      <div><label>Loại</label><input id="loai" value="${thoatHtml(sp.loai || "")}" required></div>
      <div><label>Giá bán</label><input id="gia_ban" type="number" min="1" value="${sp.gia_ban || ""}" required></div>
      <div><label>Trạng thái bán</label><select id="trang_thai"><option value="dang_ban" ${sp.trang_thai==='dang_ban'?'selected':''}>Đang bán</option><option value="ngung_ban" ${sp.trang_thai==='ngung_ban'?'selected':''}>Ngừng bán</option></select></div>
      <div><label>Trạng thái kho do quản lý chỉnh</label><select id="trang_thai_kho_chinh_tay">${optionTrangThaiKho(sp.trang_thai_kho_chinh_tay || 'tu_dong')}</select></div>
      <div><label>Ghi chú trạng thái kho</label><input id="ghi_chu_kho" value="${thoatHtml(sp.ghi_chu_kho || "")}" placeholder="Ví dụ: máy pha hỏng, tạm hết topping..."></div>
      <div class="full"><label>Mô tả</label><input id="mo_ta" value="${thoatHtml(sp.mo_ta || "")}"></div>
      <div class="full"><label>Công thức: mỗi dòng ghi mã nguyên liệu | định lượng. Ví dụ NL001|0.03</label><textarea id="cong_thuc" rows="5">${thoatHtml(congThucTextarea(sp))}</textarea><small>Nguyên liệu hiện có: ${trangThai.nguyenLieu.map(n=>`${n.ma_nl}-${n.ten_nl}(${n.don_vi})`).join(", ")}</small></div>
    </div>
    <p class="so-lieu-phu">Nếu chọn "Tự động theo kho", hệ thống tự tính Còn hàng/Sắp hết/Hết hàng theo công thức và tồn kho. Nếu chọn Còn hàng/Sắp hết/Hết hàng, quản lý đang ép trạng thái hiển thị; riêng thanh toán vẫn kiểm tra nguyên liệu thật để không âm kho.</p>
    <div class="hang-nut"><button type="button" class="nut phu" onclick="dongModal()">Hủy</button><button class="nut chinh">Lưu</button></div>
  </form>`);
  formSanPham.addEventListener("submit", async e=>{
    e.preventDefault();
    const data={
      ten_sp:ten_sp.value.trim(),
      loai:loai.value.trim(),
      gia_ban:Number(gia_ban.value),
      trang_thai:trang_thai.value,
      trang_thai_kho_chinh_tay:trang_thai_kho_chinh_tay.value,
      ghi_chu_kho:ghi_chu_kho.value.trim(),
      mo_ta:mo_ta.value.trim(),
      cong_thuc:docCongThuc(cong_thuc.value)
    };
    try{
      ma?await api.suaSanPham(ma,data):await api.themSanPham(data);
      dongModal();
      await Promise.all([api.laySanPham().then(d=>trangThai.sanPham=d), api.layNguyenLieu().then(d=>trangThai.nguyenLieu=d)]);
      renderMenu();
      hienThongBao("Đã lưu sản phẩm và trạng thái kho");
    }catch(err){baoLoi(err);}
  });
}
async function xoaSanPham(ma) { const ok = await xacNhan("Xóa sản phẩm", "Nếu sản phẩm chưa có hóa đơn thì sẽ xóa. Nếu đã bán, backend sẽ chặn để giữ lịch sử. Bạn có thể đổi sang ngừng bán."); if(!ok) return; try{ await api.xoaSanPham(ma); trangThai.sanPham=await api.laySanPham(); renderMenu(); hienThongBao("Đã xóa sản phẩm"); }catch(e){ baoLoi(e); } }
function renderKho() { document.getElementById("noiDung").innerHTML = `${tieuDe("Kho hàng", "Tồn kho tự giảm khi bán hàng và tự tăng khi nhập hàng.", `<button class="nut chinh" onclick="moFormNguyenLieu()">+ Thêm nguyên liệu</button>`)}<div class="the">${bangNguyenLieu(trangThai.nguyenLieu)}</div>`; }
function bangNguyenLieu(ds) { return bang(["Mã", "Nguyên liệu", "Đơn vị", "Tồn", "Cảnh báo", "Giá TB", "Trạng thái", "Thao tác"], ds.map(n=>`<tr><td>${n.ma_nl}</td><td><b>${thoatHtml(n.ten_nl)}</b></td><td>${thoatHtml(n.don_vi)}</td><td>${so(n.so_luong_ton)}</td><td>${so(n.muc_canh_bao)}</td><td>${tien(n.gia_nhap_tb)}</td><td>${nhanNL(n.trang_thai)}</td><td>${laQuanLy()?`<button class="nut phu nho" onclick="moFormNguyenLieu('${n.ma_nl}')">Sửa</button> <button class="nut do nho" onclick="xoaNguyenLieu('${n.ma_nl}')">Xóa</button>`:""}</td></tr>`)); }
function moFormNguyenLieu(ma) { const n = trangThai.nguyenLieu.find(x=>x.ma_nl===ma)||{}; moFormChung({ tieuDe: ma?"Sửa nguyên liệu":"Thêm nguyên liệu", fields: [["ten_nl","Tên nguyên liệu",n.ten_nl||""],["don_vi","Đơn vị",n.don_vi||""],["so_luong_ton","Số lượng tồn",n.so_luong_ton||0,"number"],["muc_canh_bao","Mức cảnh báo",n.muc_canh_bao||0,"number"],["gia_nhap_tb","Giá nhập trung bình",n.gia_nhap_tb||0,"number"]], onSave: async data => { data.so_luong_ton=Number(data.so_luong_ton||0); data.muc_canh_bao=Number(data.muc_canh_bao||0); data.gia_nhap_tb=Number(data.gia_nhap_tb||0); ma?await api.suaNguyenLieu(ma,data):await api.themNguyenLieu(data); trangThai.nguyenLieu=await api.layNguyenLieu(); renderKho(); } }); }
async function xoaNguyenLieu(ma) { const ok=await xacNhan("Xóa nguyên liệu", "Nếu nguyên liệu đang nằm trong công thức sản phẩm thì backend sẽ chặn để tránh hỏng bán hàng."); if(!ok) return; try{ await api.xoaNguyenLieu(ma); trangThai.nguyenLieu=await api.layNguyenLieu(); renderKho(); hienThongBao("Đã xóa nguyên liệu"); }catch(e){baoLoi(e);} }

function renderNhapHang() { document.getElementById("noiDung").innerHTML = `${tieuDe("Nhập hàng", "Chọn nhà cung cấp, chọn nguyên liệu. Khi lưu phiếu nhập, kho tự tăng tồn.")}<div class="luoi cot-2"><div class="the"><h2>Tạo phiếu nhập</h2><label>Nhà cung cấp</label><select id="chonNCC">${trangThai.nhaCungCap.map(n=>`<option value="${n.ma_ncc}">${thoatHtml(n.ten_ncc)}</option>`).join("")}</select><label>Ghi chú</label><input id="ghiChuNhap" placeholder="Ghi chú nếu có"><div class="hang-form"><div><label>Nguyên liệu</label><select id="chonNLNhap">${trangThai.nguyenLieu.map(n=>`<option value="${n.ma_nl}">${n.ma_nl} - ${thoatHtml(n.ten_nl)} (${n.don_vi})</option>`).join("")}</select></div><div><label>Số lượng</label><input id="soLuongNhap" type="number" min="0.01" step="0.01" value="1"></div><div><label>Đơn giá</label><input id="donGiaNhap" type="number" min="1" value="10000"></div></div><button class="nut phu" onclick="themHangNhap()">+ Thêm dòng</button><div id="dsHangNhap"></div><div class="tong"><span>Tổng nhập</span><span id="tongNhap">0 ₫</span></div><button class="nut chinh" style="width:100%" onclick="luuPhieuNhap()">Lưu phiếu nhập</button></div><div class="the"><h2>Phiếu nhập gần đây</h2>${bangPhieuNhap(trangThai.phieuNhap.slice(0,8))}</div></div>`; renderHangNhap(); }
function themHangNhap(){ const nl=trangThai.nguyenLieu.find(x=>x.ma_nl===chonNLNhap.value); if(!nl) return; trangThai.hangNhap.push({ma_nl:nl.ma_nl, ten_nl:nl.ten_nl, so_luong:Number(soLuongNhap.value||0), don_gia:Number(donGiaNhap.value||0)}); renderHangNhap(); }
function xoaHangNhap(i){ trangThai.hangNhap.splice(i,1); renderHangNhap(); hienThongBao("Đã xóa dòng nhập"); }
function renderHangNhap(){ const div=document.getElementById("dsHangNhap"); if(!div)return; div.innerHTML = trangThai.hangNhap.length ? bang(["Nguyên liệu","SL","Đơn giá","Thành tiền",""], trangThai.hangNhap.map((h,i)=>`<tr><td>${thoatHtml(h.ten_nl)}</td><td>${so(h.so_luong)}</td><td>${tien(h.don_gia)}</td><td>${tien(h.so_luong*h.don_gia)}</td><td><button class="nut do nho" onclick="xoaHangNhap(${i})">Xóa</button></td></tr>`)) : `<div class="trong">Chưa có dòng nhập</div>`; if(document.getElementById("tongNhap")) document.getElementById("tongNhap").textContent=tien(trangThai.hangNhap.reduce((s,h)=>s+h.so_luong*h.don_gia,0)); }
async function luuPhieuNhap(){ if(!trangThai.hangNhap.length) return hienThongBao("Phiếu nhập đang trống", true); const ok=await xacNhan("Lưu phiếu nhập", "Sau khi lưu, số lượng tồn kho và giá nhập trung bình sẽ cập nhật ngay."); if(!ok)return; try{ const chi_tiet=trangThai.hangNhap.map(h=>({ma_nl:h.ma_nl, so_luong:h.so_luong, don_gia:h.don_gia})); const kq=await api.taoPhieuNhap({ma_ncc:chonNCC.value, ghi_chu:ghiChuNhap.value, chi_tiet}); trangThai.hangNhap=[]; await Promise.all([api.layNguyenLieu().then(d=>trangThai.nguyenLieu=d), api.layPhieuNhap().then(d=>trangThai.phieuNhap=d), api.layBaoCao().then(d=>trangThai.baoCao=d)]); renderNhapHang(); hienThongBao(`Đã tạo phiếu ${kq.ma_pn}. Kho hàng đã được cập nhật.`); }catch(e){baoLoi(e);} }
function bangPhieuNhap(ds) { return bang(["Mã", "Ngày", "NCC", "Nhân viên", "Tổng"], ds.map(p=>`<tr><td>${p.ma_pn}</td><td>${dinhDangThoiGian(p.ngay_nhap)}</td><td>${thoatHtml(p.ten_ncc)}</td><td>${thoatHtml(p.ten_nv)}</td><td><b>${tien(p.tong_tien)}</b></td></tr>`)); }
function renderNhaCungCap() { document.getElementById("noiDung").innerHTML = `${tieuDe("Nhà cung cấp", "Nhà cung cấp được dùng khi tạo phiếu nhập.", `<button class="nut chinh" onclick="moFormNCC()">+ Thêm nhà cung cấp</button>`)}<div class="the">${bang(["Mã", "Tên", "SĐT", "Địa chỉ", "Ghi chú", "Thao tác"], trangThai.nhaCungCap.map(n=>`<tr><td>${n.ma_ncc}</td><td><b>${thoatHtml(n.ten_ncc)}</b></td><td>${thoatHtml(n.sdt)}</td><td>${thoatHtml(n.dia_chi)}</td><td>${thoatHtml(n.ghi_chu)}</td><td><button class="nut phu nho" onclick="moFormNCC('${n.ma_ncc}')">Sửa</button> <button class="nut do nho" onclick="xoaNCC('${n.ma_ncc}')">Xóa</button></td></tr>`))}</div>`; }
function moFormNCC(ma) { const n = trangThai.nhaCungCap.find(x=>x.ma_ncc===ma)||{}; moFormChung({ tieuDe: ma?"Sửa nhà cung cấp":"Thêm nhà cung cấp", fields: [["ten_ncc","Tên",n.ten_ncc||""],["sdt","SĐT",n.sdt||""],["dia_chi","Địa chỉ",n.dia_chi||""],["ghi_chu","Ghi chú",n.ghi_chu||""]], onSave: async data => { ma ? await api.suaNhaCungCap(ma,data) : await api.themNhaCungCap(data); trangThai.nhaCungCap = await api.layNhaCungCap(); renderNhaCungCap(); } }); }
async function xoaNCC(ma) { const ok = await xacNhan("Xóa nhà cung cấp", "Nhà cung cấp đã có phiếu nhập sẽ không xóa được để giữ lịch sử."); if (!ok) return; try { await api.xoaNhaCungCap(ma); trangThai.nhaCungCap = await api.layNhaCungCap(); renderNhaCungCap(); hienThongBao("Đã xóa nhà cung cấp"); } catch(e){ baoLoi(e); } }

function layDSKhachDaLoc(){ const kw=trangThai.boLocKhach.tuKhoa.toLowerCase(); return trangThai.khachHang.filter(k=>{ const matchKw=!kw || [k.ma_kh,k.ten_kh,k.sdt,k.email,k.dia_chi].some(v=>String(v||"").toLowerCase().includes(kw)); const matchCap=trangThai.boLocKhach.capBac==='tat_ca'||k.cap_bac===trangThai.boLocKhach.capBac; const matchTT=trangThai.boLocKhach.trangThai==='tat_ca'||k.trang_thai===trangThai.boLocKhach.trangThai; return matchKw&&matchCap&&matchTT; }); }
function renderKhachHang() { const active=trangThai.khachHang.filter(k=>k.trang_thai==='dang_hoat_dong'); const vip=active.filter(k=>k.cap_bac==='vip'); const tongDiem=active.reduce((s,k)=>s+Number(k.diem||0),0); document.getElementById("noiDung").innerHTML = `${tieuDe("Khách hàng", "Quản lý hồ sơ khách, điểm tích lũy, hạng Bạc/Vàng/VIP, lịch sử mua và trạng thái hoạt động.", `<button class="nut chinh" onclick="moFormKhach()">+ Thêm khách hàng</button>`)}<div class="luoi cot-4">${theSo("Khách hoạt động", so(active.length), "Được chọn khi bán hàng")}${theSo("Khách VIP", so(vip.length), "Tự cập nhật theo điểm/chi tiêu")}${theSo("Tổng điểm", so(tongDiem), "Dùng để giảm giá")}${theSo("Ngừng hoạt động", so(trangThai.khachHang.length-active.length), "Vẫn giữ lịch sử mua")}</div><div class="the" style="margin-top:18px"><div class="bo-loc"><input id="timKhach" placeholder="Tìm theo tên, SĐT, email, địa chỉ..." value="${thoatHtml(trangThai.boLocKhach.tuKhoa)}" oninput="locKhachHang()"><select id="locCapKhach" onchange="locKhachHang()"><option value="tat_ca">Tất cả hạng</option><option value="thuong">Thường</option><option value="bac">Bạc</option><option value="vang">Vàng</option><option value="vip">VIP</option></select><select id="locTTKhach" onchange="locKhachHang()"><option value="tat_ca">Tất cả trạng thái</option><option value="dang_hoat_dong">Đang hoạt động</option><option value="ngung_hoat_dong">Ngừng hoạt động</option></select></div><div id="bangKhachHang"></div></div>`; locCapKhach.value=trangThai.boLocKhach.capBac; locTTKhach.value=trangThai.boLocKhach.trangThai; renderBangKhachHang(); }
function locKhachHang(){ trangThai.boLocKhach={tuKhoa:timKhach.value, capBac:locCapKhach.value, trangThai:locTTKhach.value}; renderBangKhachHang(); }
function renderBangKhachHang(){ const ds=layDSKhachDaLoc(); document.getElementById("bangKhachHang").innerHTML = bang(["Mã", "Khách hàng", "Liên hệ", "Hạng", "Điểm", "Tổng chi", "Lần mua", "Trạng thái", "Thao tác"], ds.map(k=>`<tr><td>${k.ma_kh}</td><td><b>${thoatHtml(k.ten_kh)}</b><br><span class="so-lieu-phu">Sinh nhật: ${thoatHtml(k.ngay_sinh||"-")} • ${thoatHtml(k.gioi_tinh||"-")}</span></td><td>${thoatHtml(k.sdt)}<br><span class="so-lieu-phu">${thoatHtml(k.email||"")} ${thoatHtml(k.dia_chi||"")}</span></td><td>${nhanCapBac(k.cap_bac)}</td><td>${so(k.diem)}</td><td>${tien(k.tong_chi_tieu)}</td><td>${so(k.so_lan_mua)}<br><span class="so-lieu-phu">${dinhDangNgay(k.lan_mua_cuoi)||"Chưa mua"}</span></td><td>${nhanTTKH(k.trang_thai)}</td><td><button class="nut phu nho" onclick="xemLichSuKhach('${k.ma_kh}')">Lịch sử</button> <button class="nut phu nho" onclick="moFormKhach('${k.ma_kh}')">Sửa</button> <button class="nut do nho" onclick="xoaKhach('${k.ma_kh}')">Xóa</button></td></tr>`)); }
function moFormKhach(ma) { const k = trangThai.khachHang.find(x=>x.ma_kh===ma)||{}; moModal(`<h2>${ma?"Sửa":"Thêm"} khách hàng</h2><form id="formKhach"><div class="hang-form"><div><label>Tên khách hàng</label><input id="ten_kh" value="${thoatHtml(k.ten_kh||"")}" required></div><div><label>Số điện thoại</label><input id="sdt" value="${thoatHtml(k.sdt||"")}" required></div><div><label>Email</label><input id="email" type="email" value="${thoatHtml(k.email||"")}"></div><div><label>Địa chỉ</label><input id="dia_chi" value="${thoatHtml(k.dia_chi||"")}"></div><div><label>Ngày sinh</label><input id="ngay_sinh" type="date" value="${thoatHtml(k.ngay_sinh||"")}"></div><div><label>Giới tính</label><select id="gioi_tinh"><option value="" ${!k.gioi_tinh?'selected':''}>Không ghi</option><option ${k.gioi_tinh==='Nam'?'selected':''}>Nam</option><option ${k.gioi_tinh==='Nữ'?'selected':''}>Nữ</option><option ${k.gioi_tinh==='Khác'?'selected':''}>Khác</option></select></div><div><label>Điểm hiện có</label><input id="diem" type="number" min="0" value="${k.diem||0}"></div><div><label>Trạng thái</label><select id="trang_thai"><option value="dang_hoat_dong" ${k.trang_thai!=='ngung_hoat_dong'?'selected':''}>Đang hoạt động</option><option value="ngung_hoat_dong" ${k.trang_thai==='ngung_hoat_dong'?'selected':''}>Ngừng hoạt động</option></select></div><div class="full"><label>Ghi chú chăm sóc khách hàng</label><input id="ghi_chu" value="${thoatHtml(k.ghi_chu||"")}"></div></div><p class="so-lieu-phu">Hạng khách sẽ tự cập nhật theo điểm và tổng chi tiêu. Bạc từ 100 điểm/1.000.000đ, Vàng từ 300 điểm/3.000.000đ, VIP từ 800 điểm/8.000.000đ.</p><div class="hang-nut"><button type="button" class="nut phu" onclick="dongModal()">Hủy</button><button class="nut chinh">Lưu</button></div></form>`); formKhach.addEventListener("submit", async e=>{ e.preventDefault(); const data={ten_kh:ten_kh.value.trim(), sdt:sdt.value.trim(), email:email.value.trim(), dia_chi:dia_chi.value.trim(), ngay_sinh:ngay_sinh.value, gioi_tinh:gioi_tinh.value, diem:Number(diem.value||0), ghi_chu:ghi_chu.value.trim(), trang_thai:trang_thai.value}; try{ma?await api.suaKhachHang(ma,data):await api.themKhachHang(data); dongModal(); trangThai.khachHang=await api.layKhachHang(); if(trangThai.trang==='khachhang') renderKhachHang(); else renderBanHang(); hienThongBao("Đã lưu khách hàng. Hạng khách/VIP đã được backend cập nhật.");}catch(err){baoLoi(err);}}); }
async function xemLichSuKhach(ma){ try{ const data=await api.layLichSuKhachHang(ma); const k=data.khach_hang; moModal(`<h2>Hồ sơ khách hàng ${thoatHtml(k.ma_kh)}</h2><div class="khach-pos"><b>${thoatHtml(k.ten_kh)}</b> ${nhanCapBac(k.cap_bac)} ${nhanTTKH(k.trang_thai)}<br><span>${thoatHtml(k.sdt)} • ${so(k.diem)} điểm • Tổng chi ${tien(k.tong_chi_tieu)} • ${so(k.so_lan_mua)} lần mua</span><br><span>Ghi chú: ${thoatHtml(k.ghi_chu||"")}</span></div><h3>Lịch sử mua hàng</h3>${bangDonHang(data.don_hang || [])}<div class="hang-nut"><button class="nut chinh" onclick="dongModal()">Đóng</button></div>`); }catch(e){baoLoi(e);} }
async function xoaKhach(ma) { const ok = await xacNhan("Xóa/ngừng hoạt động khách hàng", "Nếu khách đã có đơn hàng, backend sẽ chuyển sang ngừng hoạt động để giữ lịch sử mua. Khách ngừng hoạt động sẽ không hiện trong chọn khách khi bán hàng."); if (!ok) return; try { const kq=await api.xoaKhachHang(ma); await lamMoiNhieuTrang(); renderKhachHang(); hienThongBao(kq.message || "Đã cập nhật khách hàng"); } catch(e){ baoLoi(e); } }

function renderNhanVien() { document.getElementById("noiDung").innerHTML = `${tieuDe("Nhân viên", "Quản lý tài khoản đăng nhập và phân quyền.", `<button class="nut chinh" onclick="moFormNhanVien()">+ Thêm nhân viên</button>`)}<div class="the">${bang(["Mã", "Tên", "Vai trò", "SĐT", "Username", "Trạng thái", "Thao tác"], trangThai.nhanVien.map(n=>`<tr><td>${n.ma_nv}</td><td><b>${thoatHtml(n.ten_nv)}</b></td><td>${tenVaiTro(n.vai_tro)}</td><td>${thoatHtml(n.sdt)}</td><td>${thoatHtml(n.username)}</td><td><span class="nhan ${n.trang_thai==='dang_lam'?'xanh':'do'}">${tenTrangThaiNV(n.trang_thai)}</span></td><td><button class="nut phu nho" onclick="moFormNhanVien('${n.ma_nv}')">Sửa</button> <button class="nut do nho" onclick="xoaNhanVien('${n.ma_nv}')">Xóa</button></td></tr>`))}</div>`; }
function moFormNhanVien(ma) { const n = trangThai.nhanVien.find(x=>x.ma_nv===ma)||{}; moModal(`<h2>${ma?"Sửa":"Thêm"} nhân viên</h2><form id="formNV"><div class="hang-form"><div><label>Tên</label><input id="ten_nv" value="${thoatHtml(n.ten_nv||"")}" required></div><div><label>Vai trò</label><select id="vai_tro"><option value="nhan_vien" ${n.vai_tro==='nhan_vien'?'selected':''}>Nhân viên</option><option value="quan_ly" ${n.vai_tro==='quan_ly'?'selected':''}>Quản lý</option></select></div><div><label>SĐT</label><input id="sdt" value="${thoatHtml(n.sdt||"")}"></div><div><label>Username</label><input id="username" value="${thoatHtml(n.username||"")}" required></div><div><label>Mật khẩu ${ma?"(bỏ trống nếu không đổi)":""}</label><input id="mat_khau" type="password" ${ma?"":"required"}></div><div><label>Trạng thái</label><select id="trang_thai"><option value="dang_lam" ${n.trang_thai==='dang_lam'?'selected':''}>Đang làm</option><option value="nghi_lam" ${n.trang_thai==='nghi_lam'?'selected':''}>Nghỉ làm</option></select></div></div><div class="hang-nut"><button type="button" class="nut phu" onclick="dongModal()">Hủy</button><button class="nut chinh">Lưu</button></div></form>`); formNV.addEventListener("submit", async e=>{ e.preventDefault(); const data={ten_nv:ten_nv.value.trim(), vai_tro:vai_tro.value, sdt:sdt.value.trim(), username:username.value.trim(), mat_khau:mat_khau.value, trang_thai:trang_thai.value}; try{ma?await api.suaNhanVien(ma,data):await api.themNhanVien(data); dongModal(); trangThai.nhanVien=await api.layNhanVien(); renderNhanVien(); hienThongBao("Đã lưu nhân viên");}catch(err){baoLoi(err);}}); }
async function xoaNhanVien(ma) { const ok = await xacNhan("Xóa/chuyển trạng thái nhân viên", "Nếu nhân viên đã có hóa đơn, backend sẽ chuyển sang trạng thái nghỉ làm thay vì xóa cứng để giữ lịch sử."); if (!ok) return; try{ await api.xoaNhanVien(ma); trangThai.nhanVien=await api.layNhanVien(); renderNhanVien(); hienThongBao("Đã cập nhật trạng thái nhân viên"); }catch(e){baoLoi(e);} }
function renderBaoCao() { const bc = trangThai.baoCao || {}; const max = Math.max(...(bc.doanh_thu_7_ngay || []).map(x=>Number(x.doanh_thu)), 1); const cot = (bc.doanh_thu_7_ngay || []).map(x=>`<div style="height:${Math.max(8, Number(x.doanh_thu)/max*120)}px" title="${x.ngay}: ${tien(x.doanh_thu)}"><span>${String(x.ngay).slice(5)}</span></div>`).join(""); document.getElementById("noiDung").innerHTML = `${tieuDe("Báo cáo", "Báo cáo lấy trực tiếp từ đơn hàng, phiếu nhập, khách hàng, sản phẩm và kho.")}<div class="luoi cot-4">${theSo("Doanh thu hôm nay", tien(bc.doanh_thu_hom_nay), `${so(bc.so_don_hom_nay)} đơn`)}${theSo("Doanh thu tháng", tien(bc.doanh_thu_thang), "Tổng đơn đã thanh toán")}${theSo("Giảm giá tháng", tien(bc.giam_gia_thang), "VIP + điểm khách hàng")}${theSo("Lãi tạm tính", tien(bc.loi_nhuan_tam_tinh), "Doanh thu - nhập hàng")}</div><div class="luoi cot-2" style="margin-top:18px"><div class="the"><h2>Doanh thu 7 ngày</h2><div class="cot-bieu-do">${cot || "<div></div>"}</div></div><div class="the"><h2>Sản phẩm bán chạy</h2>${bang(["Mã", "Tên", "Số lượng", "Doanh thu"], (bc.top_san_pham||[]).map(x=>`<tr><td>${x.ma_sp}</td><td>${thoatHtml(x.ten_sp)}</td><td>${so(x.so_luong)}</td><td>${tien(x.doanh_thu)}</td></tr>`))}</div></div><div class="luoi cot-2" style="margin-top:18px"><div class="the"><h2>Top khách hàng</h2>${bang(["Khách", "Hạng", "Điểm", "Tổng chi"], (bc.top_khach_hang||[]).map(k=>`<tr><td><b>${thoatHtml(k.ten_kh)}</b><br><span class="so-lieu-phu">${thoatHtml(k.sdt)}</span></td><td>${nhanCapBac(k.cap_bac)}</td><td>${so(k.diem)}</td><td>${tien(k.tong_chi_tieu)}</td></tr>`))}</div><div class="the"><h2>Thống kê hạng khách</h2>${bang(["Hạng", "Số khách", "Tổng chi"], (bc.thong_ke_cap_bac||[]).map(x=>`<tr><td>${nhanCapBac(x.cap_bac)}</td><td>${so(x.so_luong)}</td><td>${tien(x.tong_chi_tieu)}</td></tr>`))}</div></div><div class="the" style="margin-top:18px"><h2>Nguyên liệu sắp hết / hết hàng</h2>${(bc.nguyen_lieu_sap_het||[]).length?bangNguyenLieu(bc.nguyen_lieu_sap_het):`<div class="trong">Kho ổn định.</div>`}</div>`; }

function xacNhan(tieuDe, noiDung) { return new Promise(resolve => { document.getElementById("modalXacNhan")?.remove(); document.body.insertAdjacentHTML("beforeend", `<div class="modal" id="modalXacNhan"><div class="hop-modal hop-xac-nhan"><h2>${thoatHtml(tieuDe)}</h2><p>${thoatHtml(noiDung)}</p><div class="hang-nut"><button class="nut phu" id="huyXacNhan">Hủy</button><button class="nut chinh" id="dongYXacNhan">Đồng ý</button></div></div></div>`); huyXacNhan.onclick = () => { modalXacNhan.remove(); resolve(false); }; dongYXacNhan.onclick = () => { modalXacNhan.remove(); resolve(true); }; }); }
function moModal(noiDung) { document.body.insertAdjacentHTML("beforeend", `<div class="modal" id="modal"><div class="hop-modal">${noiDung}</div></div>`); }
function dongModal() { document.getElementById("modal")?.remove(); }
function moFormChung({ tieuDe, fields, onSave }) { moModal(`<h2>${tieuDe}</h2><form id="formChung"><div class="hang-form">${fields.map(([id,label,value,type])=>`<div><label>${label}</label><input id="${id}" type="${type||'text'}" value="${thoatHtml(value)}" required></div>`).join("")}</div><div class="hang-nut"><button type="button" class="nut phu" onclick="dongModal()">Hủy</button><button class="nut chinh">Lưu</button></div></form>`); formChung.addEventListener("submit", async e=>{ e.preventDefault(); const data={}; fields.forEach(([id])=> data[id]=document.getElementById(id).value); try{ await onSave(data); dongModal(); hienThongBao("Đã lưu"); } catch(err){ baoLoi(err); } }); }


// ===== Bản nâng cấp thêm từ file zip gốc và tính năng cửa hàng thực tế =====
function nhanTrangThaiDon(t) {
  return `<span class="nhan ${t === 'da_huy' ? 'do' : 'xanh'}">${t === 'da_huy' ? 'Đã hủy' : 'Đã thanh toán'}</span>`;
}
function tenPhuongThuc(v) {
  return ({ tien_mat: 'Tiền mặt', chuyen_khoan: 'Chuyển khoản', the: 'Thẻ', vi_dien_tu: 'Ví điện tử' }[v] || v || 'Tiền mặt');
}
function tinhSoLyCoTheBan(sp) {
  if (!sp || !sp.cong_thuc || !sp.cong_thuc.length) return 'Chưa có CT';
  let min = Infinity;
  for (const ct of sp.cong_thuc) {
    const nl = trangThai.nguyenLieu.find(x => x.ma_nl === ct.ma_nl);
    if (!nl || Number(ct.dinh_luong) <= 0) return 0;
    min = Math.min(min, Math.floor(Number(nl.so_luong_ton || 0) / Number(ct.dinh_luong)));
  }
  return Number.isFinite(min) ? min : 'Chưa có CT';
}
function taiFileTenTiengViet(tenFile, noiDung, mime='text/csv;charset=utf-8') {
  const blob = new Blob([noiDung], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = tenFile;
  a.click();
  URL.revokeObjectURL(a.href);
}
function dongCSV(dong) {
  return dong.map(x => `"${String(x ?? '').replaceAll('"', '""')}"`).join(',');
}
function bangDonHang(ds) {
  return bang(["Mã", "Thời gian", "Khách", "Thanh toán", "Tổng", "Trạng thái", "Xem"], ds.map(d=>`<tr><td>${d.ma_hd}</td><td>${dinhDangThoiGian(d.thoi_diem)}</td><td>${thoatHtml(d.ten_kh)} ${d.cap_bac_khach ? nhanCapBac(d.cap_bac_khach) : ""}</td><td>${tenPhuongThuc(d.phuong_thuc_thanh_toan)}</td><td><b>${tien(d.tong_tien)}</b></td><td>${nhanTrangThaiDon(d.trang_thai)}</td><td><button class="nut phu nho" onclick="xemDonHang('${d.ma_hd}')">Chi tiết</button></td></tr>`));
}

function renderMenu() {
  trangThai.locMenu = trangThai.locMenu || { tuKhoa: '', loai: 'tat_ca', trangThai: 'tat_ca', kho: 'tat_ca' };
  const loai = [...new Set(trangThai.sanPham.map(x => x.loai))];
  const conHang = trangThai.sanPham.filter(x => x.trang_thai === 'dang_ban' && x.trang_thai_kho === 'con_hang').length;
  const sapHet = trangThai.sanPham.filter(x => x.trang_thai === 'dang_ban' && x.trang_thai_kho === 'sap_het').length;
  const hetHang = trangThai.sanPham.filter(x => x.trang_thai === 'dang_ban' && (x.trang_thai_kho === 'het_hang' || x.trang_thai_kho === 'chua_co_cong_thuc' || !x.co_the_ban)).length;
  const chinhTay = trangThai.sanPham.filter(x => (x.trang_thai_kho_chinh_tay || 'tu_dong') !== 'tu_dong').length;
  document.getElementById("noiDung").innerHTML = `${tieuDe("Quản lý Menu", `${so(trangThai.sanPham.length)} sản phẩm trong menu`, `<button class="nut chinh" onclick="moFormSanPham()">+ Thêm món mới</button>`)}
  <div class="luoi cot-4">${theSo('Còn hàng', so(conHang), 'Đang bán được')}${theSo('Sắp hết', so(sapHet), 'Cần theo dõi')}${theSo('Hết hàng', so(hetHang), 'POS không cho bán')}${theSo('Quản lý chỉnh tay', so(chinhTay), 'Không tính tự động')}</div>
  <div class="the" style="margin-top:18px"><div class="bo-loc nam-cot"><input id="timMenu" placeholder="Tìm kiếm tên món..." value="${thoatHtml(trangThai.locMenu.tuKhoa)}" oninput="locMenu()"><select id="locLoaiMenu" onchange="locMenu()"><option value="tat_ca">Tất cả loại</option>${loai.map(l=>`<option value="${thoatHtml(l)}">${thoatHtml(l)}</option>`).join('')}</select><select id="locTTMenu" onchange="locMenu()"><option value="tat_ca">Tất cả trạng thái bán</option><option value="dang_ban">Đang bán</option><option value="ngung_ban">Ngừng bán</option></select><select id="locKhoMenu" onchange="locMenu()"><option value="tat_ca">Tất cả kho</option><option value="con_hang">Còn hàng</option><option value="sap_het">Sắp hết</option><option value="het_hang">Hết hàng</option><option value="chua_co_cong_thuc">Chưa có công thức</option></select><button class="nut phu" onclick="xuatMenuCSV()">Xuất CSV</button></div><div id="dsSanPhamQuanLy" class="luoi-san-pham"></div></div>`;
  document.getElementById('locLoaiMenu').value = trangThai.locMenu.loai;
  document.getElementById('locTTMenu').value = trangThai.locMenu.trangThai;
  document.getElementById('locKhoMenu').value = trangThai.locMenu.kho;
  renderGridMenu();
}

function renderGridMenu(){
  const ds = layMenuDaLoc();
  const iconTheoLoai = (loai) => ({ "Cà phê": "☕", "Trà sữa": "🧋", "Sinh tố": "🍓", "Nước ép": "🍊" }[loai] || "🥤");
  document.getElementById('dsSanPhamQuanLy').innerHTML = ds.map(sp => {
    const conBan = sp.co_the_ban && Number(sp.so_ly_co_the_ban || 0) > 0;
    const statusText = conBan ? "Còn hàng" : "Hết hàng";
    const statusClass = conBan ? "xanh" : "do";
    return `<div class="san-pham-card ${conBan? '': 'het-hang'}">
      <div class="product-icon">${iconTheoLoai(sp.loai)}</div>
      <div class="card-cat">${thoatHtml(sp.loai)}</div>
      <h3>${thoatHtml(sp.ten_sp)}</h3>
      <p class="ma-sp">${thoatHtml(sp.ma_sp)}</p>
      <div class="gia">${tien(sp.gia_ban)}</div>
      <div class="card-footer"><div class="so-lieu-phu">${thoatHtml(sp.mo_ta || '')}</div><div class="card-actions"><span class="nhan ${statusClass}">${statusText}</span><div class="card-buttons"><button class="icon-btn small" title="Sửa" onclick="moFormSanPham('${sp.ma_sp}')">✎</button> <button class="icon-btn small danger" title="Xóa" onclick="xoaSanPham('${sp.ma_sp}')">🗑</button></div></div></div>
    </div>`;
  }).join('') || `<div class="trong">Không có sản phẩm</div>`;
}
function locMenu(){
  trangThai.locMenu = { tuKhoa: document.getElementById('timMenu').value.trim(), loai: document.getElementById('locLoaiMenu').value, trangThai: document.getElementById('locTTMenu').value, kho: document.getElementById('locKhoMenu').value };
  renderGridMenu();
}
function layMenuDaLoc(){
  const f = trangThai.locMenu || { tuKhoa:'', loai:'tat_ca', trangThai:'tat_ca', kho:'tat_ca' };
  const kw = f.tuKhoa.toLowerCase();
  return trangThai.sanPham.filter(sp => {
    const s = `${sp.ma_sp} ${sp.ten_sp} ${sp.loai} ${sp.mo_ta}`.toLowerCase();
    return (!kw || s.includes(kw)) && (f.loai === 'tat_ca' || sp.loai === f.loai) && (f.trangThai === 'tat_ca' || sp.trang_thai === f.trangThai) && (f.kho === 'tat_ca' || sp.trang_thai_kho === f.kho);
  });
}
function renderBangMenu(){
  const ds = layMenuDaLoc();
  document.getElementById('bangMenu').innerHTML = bang(["Mã", "Tên", "Loại", "Giá", "Trạng thái bán", "Kho bán", "Chỉnh kho", "Công thức", "Thao tác"], ds.map(sp => {
    const khoTuDong = `${tenTrangThaiKhoSP(sp.trang_thai_kho_tu_dong || sp.trang_thai_kho)} • ${so(sp.so_ly_co_the_ban_tu_dong ?? sp.so_ly_co_the_ban)} ly`;
    return `<tr><td>${sp.ma_sp}</td><td><b>${thoatHtml(sp.ten_sp)}</b><br><span class="so-lieu-phu">${thoatHtml(sp.mo_ta)}</span></td><td>${thoatHtml(sp.loai)}</td><td>${tien(sp.gia_ban)}</td><td>${nhanBan(sp.trang_thai)}</td><td>${nhanKhoSP(sp)}<br><span class="so-lieu-phu">Tự động: ${thoatHtml(khoTuDong)}</span></td><td><select class="select-nho" onchange="doiTrangThaiKhoNhanh('${sp.ma_sp}', this.value)">${optionTrangThaiKho(sp.trang_thai_kho_chinh_tay || 'tu_dong')}</select>${sp.ghi_chu_kho ? `<br><span class="so-lieu-phu">${thoatHtml(sp.ghi_chu_kho)}</span>` : ''}</td><td>${thoatHtml(congThucChu(sp))}</td><td><button class="nut phu nho" onclick="moFormSanPham('${sp.ma_sp}')">Sửa</button> <button class="nut do nho" onclick="xoaSanPham('${sp.ma_sp}')">Xóa</button></td></tr>`;
  }));
}
async function doiTrangThaiKhoNhanh(ma, giaTri) {
  const sp = trangThai.sanPham.find(x => x.ma_sp === ma);
  if (!sp) return;
  let ghiChu = sp.ghi_chu_kho || '';
  if (giaTri === 'het_hang') {
    ghiChu = prompt('Lý do đặt hết hàng là gì? Có thể bỏ trống.', ghiChu) ?? ghiChu;
  }
  try {
    const kq = await api.doiTrangThaiKhoSanPham(ma, { trang_thai_kho_chinh_tay: giaTri, ghi_chu_kho: ghiChu });
    trangThai.sanPham = await api.laySanPham();
    renderMenu();
    hienThongBao(kq.message || 'Đã đổi trạng thái kho');
  } catch (e) { baoLoi(e); }
}
function xuatMenuCSV(){
  const rows = [["Mã", "Tên", "Loại", "Giá bán", "Trạng thái bán", "Kho hiển thị", "Cách chỉnh kho", "Số ly tự động", "Ghi chú kho"]].concat(layMenuDaLoc().map(sp => [sp.ma_sp, sp.ten_sp, sp.loai, sp.gia_ban, sp.trang_thai, tenTrangThaiKhoSP(sp.trang_thai_kho), tenCachChinhKhoSP(sp.trang_thai_kho_chinh_tay || 'tu_dong'), sp.so_ly_co_the_ban_tu_dong ?? sp.so_ly_co_the_ban, sp.ghi_chu_kho || '']));
  taiFileTenTiengViet('danhsachmenu.csv', rows.map(dongCSV).join('\n'));
  hienThongBao('Đã xuất danh sách menu');
}

function renderKho() {
  trangThai.locKho = trangThai.locKho || { tuKhoa:'', trangThai:'tat_ca' };
  const sapHet = trangThai.nguyenLieu.filter(x => x.trang_thai !== 'con_hang').length;
  const giaTriTon = trangThai.nguyenLieu.reduce((s,n)=>s+Number(n.so_luong_ton||0)*Number(n.gia_nhap_tb||0),0);
  document.getElementById("noiDung").innerHTML = `${tieuDe("Kho hàng", "Kho tự giảm khi bán, tự tăng khi nhập. Có cảnh báo sắp hết và giá trị tồn kho.", `<button class="nut chinh" onclick="moFormNguyenLieu()">+ Thêm nguyên liệu</button>`)}
  <div class="luoi cot-4">${theSo('Nguyên liệu', so(trangThai.nguyenLieu.length), 'Đang quản lý')}${theSo('Sắp hết/hết', so(sapHet), 'Cần nhập thêm')}${theSo('Giá trị tồn', tien(giaTriTon), 'Tồn kho tạm tính')}${theSo('Đủ hàng', so(trangThai.nguyenLieu.length-sapHet), 'Trạng thái còn hàng')}</div>
  <div class="the" style="margin-top:18px"><div class="bo-loc ba-cot"><input id="timKho" placeholder="Tìm mã, tên, đơn vị..." value="${thoatHtml(trangThai.locKho.tuKhoa)}" oninput="locKho()"><select id="locTTKho" onchange="locKho()"><option value="tat_ca">Tất cả trạng thái</option><option value="con_hang">Còn hàng</option><option value="sap_het">Sắp hết</option><option value="het_hang">Hết hàng</option></select><button class="nut phu" onclick="xuatKhoCSV()">Xuất CSV</button></div><div id="bangKho"></div></div>`;
  document.getElementById('locTTKho').value = trangThai.locKho.trangThai;
  renderBangKho();
}
function locKho(){ trangThai.locKho={tuKhoa:timKho.value.trim(),trangThai:locTTKho.value}; renderBangKho(); }
function layKhoDaLoc(){ const f=trangThai.locKho||{tuKhoa:'',trangThai:'tat_ca'}; const kw=f.tuKhoa.toLowerCase(); return trangThai.nguyenLieu.filter(n=>{ const s=`${n.ma_nl} ${n.ten_nl} ${n.don_vi}`.toLowerCase(); return (!kw||s.includes(kw))&&(f.trangThai==='tat_ca'||n.trang_thai===f.trangThai); }); }
function renderBangKho(){ document.getElementById('bangKho').innerHTML = bangNguyenLieu(layKhoDaLoc()); }
function xuatKhoCSV(){ const rows=[["Mã","Tên","Đơn vị","Tồn","Cảnh báo","Giá nhập TB","Trạng thái"]].concat(layKhoDaLoc().map(n=>[n.ma_nl,n.ten_nl,n.don_vi,n.so_luong_ton,n.muc_canh_bao,n.gia_nhap_tb,tenTrangThaiNL(n.trang_thai)])); taiFileTenTiengViet('danhsachkho.csv', rows.map(dongCSV).join('\n')); hienThongBao('Đã xuất danh sách kho'); }

function bangPhieuNhap(ds) { return bang(["Mã", "Ngày", "NCC", "Nhân viên", "Tổng", "Chi tiết"], ds.map(p=>`<tr><td>${p.ma_pn}</td><td>${dinhDangThoiGian(p.ngay_nhap)}</td><td>${thoatHtml(p.ten_ncc)}</td><td>${thoatHtml(p.ten_nv)}</td><td><b>${tien(p.tong_tien)}</b></td><td><button class="nut phu nho" onclick="xemPhieuNhap('${p.ma_pn}')">Xem</button></td></tr>`)); }
async function xemPhieuNhap(ma){
  try{
    const p = await api.layChiTietPhieuNhap(ma);
    moModal(`<h2>Chi tiết phiếu nhập ${thoatHtml(p.ma_pn)}</h2><p><b>Ngày nhập:</b> ${dinhDangThoiGian(p.ngay_nhap)}</p><p><b>Nhà cung cấp:</b> ${thoatHtml(p.ten_ncc)} • <b>Nhân viên:</b> ${thoatHtml(p.ten_nv)}</p><p><b>Ghi chú:</b> ${thoatHtml(p.ghi_chu || '')}</p>${bang(["Nguyên liệu", "Số lượng", "Đơn giá", "Thành tiền"], (p.chi_tiet||[]).map(x=>`<tr><td>${x.ma_nl} - ${thoatHtml(x.ten_nl)}</td><td>${so(x.so_luong)}</td><td>${tien(x.don_gia)}</td><td>${tien(Number(x.so_luong)*Number(x.don_gia))}</td></tr>`))}<div class="tong lon"><span>Tổng nhập</span><span>${tien(p.tong_tien)}</span></div><div class="hang-nut"><button class="nut chinh" onclick="dongModal()">Đóng</button></div>`);
  } catch(e){ baoLoi(e); }
}
function renderNhapHang() {
  document.getElementById("noiDung").innerHTML = `${tieuDe("Nhập hàng", "Tạo phiếu nhập, tăng tồn kho và cập nhật giá nhập trung bình.")}
  <div class="luoi cot-2"><div class="the"><h2>Tạo phiếu nhập</h2><label>Nhà cung cấp</label><select id="chonNCC">${trangThai.nhaCungCap.map(n=>`<option value="${n.ma_ncc}">${thoatHtml(n.ten_ncc)}</option>`).join("")}</select><label>Ghi chú</label><input id="ghiChuNhap" placeholder="Ví dụ: nhập theo hóa đơn số..."><div class="hang-form"><div><label>Nguyên liệu</label><select id="chonNLNhap">${trangThai.nguyenLieu.map(n=>`<option value="${n.ma_nl}">${n.ma_nl} - ${thoatHtml(n.ten_nl)} (${n.don_vi})</option>`).join("")}</select></div><div><label>Số lượng</label><input id="soLuongNhap" type="number" min="0.01" step="0.01" value="1"></div><div><label>Đơn giá</label><input id="donGiaNhap" type="number" min="1" value="10000"></div></div><button class="nut phu" onclick="themHangNhap()">+ Thêm dòng</button><div id="dsHangNhap"></div><div class="tong"><span>Tổng nhập</span><span id="tongNhap">0 ₫</span></div><button class="nut chinh" style="width:100%" onclick="luuPhieuNhap()">Lưu phiếu nhập</button></div><div class="the"><div class="tieu-de-nho"><h2>Phiếu nhập gần đây</h2><button class="nut phu nho" onclick="xuatNhapCSV()">Xuất CSV</button></div>${bangPhieuNhap(trangThai.phieuNhap.slice(0,10))}</div></div>`;
  renderHangNhap();
}
function xuatNhapCSV(){ const rows=[["Mã","Ngày","NCC","Nhân viên","Tổng"]].concat(trangThai.phieuNhap.map(p=>[p.ma_pn,p.ngay_nhap,p.ten_ncc,p.ten_nv,p.tong_tien])); taiFileTenTiengViet('danhsachphieunhap.csv', rows.map(dongCSV).join('\n')); hienThongBao('Đã xuất phiếu nhập'); }

function renderNhaCungCap() {
  trangThai.locNCC = trangThai.locNCC || '';
  document.getElementById("noiDung").innerHTML = `${tieuDe("Nhà cung cấp", "Nhà cung cấp liên kết với phiếu nhập và lịch sử nhập hàng.", `<button class="nut chinh" onclick="moFormNCC()">+ Thêm nhà cung cấp</button>`)}<div class="the"><div class="bo-loc hai-cot"><input id="timNCC" placeholder="Tìm tên, SĐT, địa chỉ..." value="${thoatHtml(trangThai.locNCC)}" oninput="locNCC()"><button class="nut phu" onclick="xuatNCCCSV()">Xuất CSV</button></div><div id="bangNCC"></div></div>`;
  renderBangNCC();
}
function layNCCDaLoc(){ const kw=(trangThai.locNCC||'').toLowerCase(); return trangThai.nhaCungCap.filter(n=>!kw||`${n.ma_ncc} ${n.ten_ncc} ${n.sdt} ${n.dia_chi} ${n.ghi_chu}`.toLowerCase().includes(kw)); }
function locNCC(){ trangThai.locNCC = timNCC.value.trim(); renderBangNCC(); }
function renderBangNCC(){ document.getElementById('bangNCC').innerHTML = bang(["Mã", "Tên", "SĐT", "Địa chỉ", "Ghi chú", "Thao tác"], layNCCDaLoc().map(n=>`<tr><td>${n.ma_ncc}</td><td><b>${thoatHtml(n.ten_ncc)}</b></td><td>${thoatHtml(n.sdt)}</td><td>${thoatHtml(n.dia_chi)}</td><td>${thoatHtml(n.ghi_chu)}</td><td><button class="nut phu nho" onclick="moFormNCC('${n.ma_ncc}')">Sửa</button> <button class="nut do nho" onclick="xoaNCC('${n.ma_ncc}')">Xóa</button></td></tr>`)); }
function xuatNCCCSV(){ const rows=[["Mã","Tên","SĐT","Địa chỉ","Ghi chú"]].concat(layNCCDaLoc().map(n=>[n.ma_ncc,n.ten_ncc,n.sdt,n.dia_chi,n.ghi_chu])); taiFileTenTiengViet('danhsachnhacungcap.csv', rows.map(dongCSV).join('\n')); hienThongBao('Đã xuất nhà cung cấp'); }

function renderNhanVien() {
  trangThai.locNV = trangThai.locNV || { tuKhoa:'', vaiTro:'tat_ca', trangThai:'tat_ca' };
  const ql = trangThai.nhanVien.filter(n=>n.vai_tro==='quan_ly').length;
  const nv = trangThai.nhanVien.filter(n=>n.vai_tro==='nhan_vien').length;
  const dangLam = trangThai.nhanVien.filter(n=>n.trang_thai==='dang_lam').length;
  document.getElementById("noiDung").innerHTML = `${tieuDe("Nhân viên", "Quản lý tài khoản đăng nhập, phân quyền và trạng thái làm việc.", `<button class="nut chinh" onclick="moFormNhanVien()">+ Thêm nhân viên</button>`)}<div class="luoi cot-4">${theSo('Tổng nhân viên', so(trangThai.nhanVien.length), 'Tài khoản trong hệ thống')}${theSo('Quản lý', so(ql), 'Có quyền quản trị')}${theSo('Nhân viên', so(nv), 'Bán hàng/chăm sóc khách')}${theSo('Đang làm', so(dangLam), 'Có thể đăng nhập')}</div><div class="the" style="margin-top:18px"><div class="bo-loc bon-cot"><input id="timNV" placeholder="Tìm tên, SĐT, username..." value="${thoatHtml(trangThai.locNV.tuKhoa)}" oninput="locNhanVien()"><select id="locVaiTroNV" onchange="locNhanVien()"><option value="tat_ca">Tất cả vai trò</option><option value="quan_ly">Quản lý</option><option value="nhan_vien">Nhân viên</option></select><select id="locTTNV" onchange="locNhanVien()"><option value="tat_ca">Tất cả trạng thái</option><option value="dang_lam">Đang làm</option><option value="nghi_lam">Nghỉ làm</option></select><button class="nut phu" onclick="xuatNVCSV()">Xuất CSV</button></div><div id="bangNhanVien"></div></div>`;
  locVaiTroNV.value=trangThai.locNV.vaiTro; locTTNV.value=trangThai.locNV.trangThai; renderBangNhanVien();
}
function locNhanVien(){ trangThai.locNV={tuKhoa:timNV.value.trim(), vaiTro:locVaiTroNV.value, trangThai:locTTNV.value}; renderBangNhanVien(); }
function layNVDaLoc(){ const f=trangThai.locNV||{tuKhoa:'',vaiTro:'tat_ca',trangThai:'tat_ca'}; const kw=f.tuKhoa.toLowerCase(); return trangThai.nhanVien.filter(n=>{ const s=`${n.ma_nv} ${n.ten_nv} ${n.sdt} ${n.username}`.toLowerCase(); return (!kw||s.includes(kw))&&(f.vaiTro==='tat_ca'||n.vai_tro===f.vaiTro)&&(f.trangThai==='tat_ca'||n.trang_thai===f.trangThai); }); }
function renderBangNhanVien(){ document.getElementById('bangNhanVien').innerHTML = bang(["Mã", "Tên", "Vai trò", "SĐT", "Username", "Trạng thái", "Thao tác"], layNVDaLoc().map(n=>`<tr><td>${n.ma_nv}</td><td><b>${thoatHtml(n.ten_nv)}</b></td><td>${tenVaiTro(n.vai_tro)}</td><td>${thoatHtml(n.sdt)}</td><td>${thoatHtml(n.username)}</td><td><span class="nhan ${n.trang_thai==='dang_lam'?'xanh':'do'}">${tenTrangThaiNV(n.trang_thai)}</span></td><td><button class="nut phu nho" onclick="moFormNhanVien('${n.ma_nv}')">Sửa</button> <button class="nut do nho" onclick="xoaNhanVien('${n.ma_nv}')">Xóa</button></td></tr>`)); }
function xuatNVCSV(){ const rows=[["Mã","Tên","Vai trò","SĐT","Username","Trạng thái"]].concat(layNVDaLoc().map(n=>[n.ma_nv,n.ten_nv,tenVaiTro(n.vai_tro),n.sdt,n.username,tenTrangThaiNV(n.trang_thai)])); taiFileTenTiengViet('danhsachnhanvien.csv', rows.map(dongCSV).join('\n')); hienThongBao('Đã xuất nhân viên'); }

function thanhToan() {
  if (!trangThai.gioHang.length) return hienThongBao("Giỏ hàng đang trống", true);
  const kh = khachDangChon();
  const tamTinh = tinhTamTinhGio();
  const giamCap = tinhGiamCapBacFront(tamTinh, kh);
  const diemDoi = tinhDiemDoi();
  const tong = Math.max(0, tamTinh - giamCap - diemDoi.tien);
  moModal(`<h2>Xác nhận thanh toán</h2><div class="khach-pos"><b>${kh ? thoatHtml(kh.ten_kh) : 'Khách lẻ'}</b> ${kh ? nhanCapBac(kh.cap_bac) : ''}<br><span>Tạm tính ${tien(tamTinh)} • Giảm VIP ${tien(giamCap)} • Giảm điểm ${tien(diemDoi.tien)}</span></div><form id="formThanhToan"><label>Phương thức thanh toán</label><select id="phuongThucTT" onchange="capNhatTienThanhToan(${tong})"><option value="tien_mat">Tiền mặt</option><option value="chuyen_khoan">Chuyển khoản</option><option value="the">Thẻ</option><option value="vi_dien_tu">Ví điện tử</option></select><label>Tiền khách đưa</label><input id="tienKhachDua" type="number" min="0" value="${tong}"><label>Ghi chú hóa đơn</label><input id="ghiChuDon" placeholder="Ví dụ: khách lấy ít đá, xuất hóa đơn..."><div class="tong lon"><span>Khách cần trả</span><span>${tien(tong)}</span></div><div class="tong"><span>Tiền thừa</span><span id="tienThuaTT">0 ₫</span></div><div class="hang-nut"><button type="button" class="nut phu" onclick="dongModal()">Hủy</button><button class="nut chinh">Hoàn tất thanh toán</button></div></form>`);
  tienKhachDua.addEventListener('input', () => capNhatTienThanhToan(tong));
  formThanhToan.addEventListener('submit', async e => { e.preventDefault(); await hoanTatThanhToan(tong, diemDoi); });
  capNhatTienThanhToan(tong);
}
function capNhatTienThanhToan(tong){
  if (!document.getElementById('phuongThucTT')) return;
  if (phuongThucTT.value !== 'tien_mat') tienKhachDua.value = tong;
  tienKhachDua.disabled = phuongThucTT.value !== 'tien_mat';
  tienThuaTT.textContent = tien(Math.max(0, Number(tienKhachDua.value || 0) - tong));
}
async function hoanTatThanhToan(tong, diemDoi){
  const ok = await xacNhan('Chốt hóa đơn', 'Sau khi thanh toán, hệ thống sẽ lưu hóa đơn, trừ kho, cộng/trừ điểm khách hàng và cập nhật báo cáo.');
  if (!ok) return;
  try {
    const ma_kh = document.getElementById("chonKhach")?.value || null;
    const chi_tiet = trangThai.gioHang.map(x => ({ ma_sp: x.ma_sp, so_luong: x.so_luong, size: x.size, ghi_chu: x.ghi_chu || "" }));
    const kq = await api.taoDonHang({ ma_kh, diem_su_dung: diemDoi.diem, phuong_thuc_thanh_toan: phuongThucTT.value, tien_khach_dua: Number(tienKhachDua.value || 0), ghi_chu: ghiChuDon.value.trim(), chi_tiet });
    dongModal();
    trangThai.gioHang = [];
    await lamMoiNhieuTrang();
    renderBanHang();
    hienThongBao(`Đã tạo hóa đơn ${kq.ma_hd}: ${tien(kq.tong_tien)}. Tiền thừa ${tien(kq.tien_thua)}.`);
  } catch (err) { baoLoi(err); }
}
async function xemDonHang(ma_hd) {
  try {
    const hd = await api.layChiTietDon(ma_hd);
    const huy = laQuanLy() && hd.trang_thai !== 'da_huy' ? `<button class="nut do" onclick="huyDonHang('${hd.ma_hd}')">Hủy đơn/hoàn kho</button>` : '';
    moModal(`<h2>Chi tiết hóa đơn ${thoatHtml(hd.ma_hd)} ${nhanTrangThaiDon(hd.trang_thai)}</h2><p><b>Thời điểm:</b> ${dinhDangThoiGian(hd.thoi_diem)}</p><p><b>Khách hàng:</b> ${thoatHtml(hd.ten_kh)} ${nhanCapBac(hd.cap_bac_khach)} • <b>Nhân viên:</b> ${thoatHtml(hd.ten_nv)}</p><p><b>Thanh toán:</b> ${tenPhuongThuc(hd.phuong_thuc_thanh_toan)} • <b>Khách đưa:</b> ${tien(hd.tien_khach_dua)} • <b>Tiền thừa:</b> ${tien(hd.tien_thua)}</p><p><b>Ghi chú:</b> ${thoatHtml(hd.ghi_chu || '')}</p>${bang(["Sản phẩm", "Size", "SL", "Đơn giá", "Ghi chú"], (hd.chi_tiet || []).map(ct => `<tr><td>${thoatHtml(ct.ten_sp)}</td><td>${thoatHtml(ct.size)}</td><td>${so(ct.so_luong)}</td><td>${tien(ct.don_gia)}</td><td>${thoatHtml(ct.ghi_chu || "")}</td></tr>`))}<div class="tong"><span>Tạm tính</span><span>${tien(hd.tong_truoc_giam || hd.tong_tien)}</span></div><div class="tong nhe"><span>Giảm hạng/VIP</span><span>-${tien(hd.giam_gia_cap_bac)}</span></div><div class="tong nhe"><span>Dùng điểm</span><span>${so(hd.diem_su_dung)} điểm = -${tien(hd.giam_gia_diem)}</span></div><div class="tong lon"><span>Tổng tiền</span><span>${tien(hd.tong_tien)}</span></div><p>Điểm cộng: <b>${so(hd.diem_cong)}</b></p><div class="hang-nut">${huy}<button class="nut phu" onclick="window.print()">In hóa đơn</button><button class="nut chinh" onclick="dongModal()">Đóng</button></div>`);
  } catch (err) { baoLoi(err); }
}
async function huyDonHang(ma){
  const ok = await xacNhan('Hủy đơn hàng', 'Chỉ quản lý được hủy. Hệ thống sẽ hoàn lại nguyên liệu vào kho và cập nhật lại điểm/tổng chi tiêu của khách.');
  if(!ok) return;
  try{ const kq = await api.huyDonHang(ma); dongModal(); await lamMoiNhieuTrang(); renderTrang(); hienThongBao(kq.message || 'Đã hủy đơn hàng'); }catch(e){ baoLoi(e); }
}

function renderBaoCao() {
  const bc = trangThai.baoCao || {};
  const max = Math.max(...(bc.doanh_thu_7_ngay || []).map(x=>Number(x.doanh_thu)), 1);
  const cot = (bc.doanh_thu_7_ngay || []).map(x=>`<div style="height:${Math.max(8, Number(x.doanh_thu)/max*120)}px" title="${x.ngay}: ${tien(x.doanh_thu)}"><span>${String(x.ngay).slice(5)}</span></div>`).join("");
  document.getElementById("noiDung").innerHTML = `${tieuDe("Báo cáo", "Báo cáo lấy trực tiếp từ đơn hàng, phiếu nhập, khách hàng, sản phẩm và kho.", `<button class="nut phu" onclick="xuatBaoCaoCSV()">Xuất báo cáo CSV</button>`)}<div class="luoi cot-4">${theSo("Doanh thu hôm nay", tien(bc.doanh_thu_hom_nay), `${so(bc.so_don_hom_nay)} đơn`)}${theSo("Doanh thu tháng", tien(bc.doanh_thu_thang), "Chỉ tính đơn đã thanh toán")}${theSo("Giảm giá tháng", tien(bc.giam_gia_thang), "VIP + điểm khách hàng")}${theSo("Đơn đã hủy", so(bc.don_da_huy_thang), "Tháng hiện tại")}</div><div class="luoi cot-2" style="margin-top:18px"><div class="the"><h2>Doanh thu 7 ngày</h2><div class="cot-bieu-do">${cot || "<div></div>"}</div></div><div class="the"><h2>Phương thức thanh toán</h2>${bang(["Phương thức", "Số đơn", "Doanh thu"], (bc.thong_ke_thanh_toan||[]).map(x=>`<tr><td>${tenPhuongThuc(x.phuong_thuc_thanh_toan)}</td><td>${so(x.so_don)}</td><td>${tien(x.doanh_thu)}</td></tr>`))}</div></div><div class="luoi cot-2" style="margin-top:18px"><div class="the"><h2>Sản phẩm bán chạy</h2>${bang(["Mã", "Tên", "Số lượng", "Doanh thu"], (bc.top_san_pham||[]).map(x=>`<tr><td>${x.ma_sp}</td><td>${thoatHtml(x.ten_sp)}</td><td>${so(x.so_luong)}</td><td>${tien(x.doanh_thu)}</td></tr>`))}</div><div class="the"><h2>Top khách hàng</h2>${bang(["Khách", "Hạng", "Điểm", "Tổng chi"], (bc.top_khach_hang||[]).map(k=>`<tr><td><b>${thoatHtml(k.ten_kh)}</b><br><span class="so-lieu-phu">${thoatHtml(k.sdt)}</span></td><td>${nhanCapBac(k.cap_bac)}</td><td>${so(k.diem)}</td><td>${tien(k.tong_chi_tieu)}</td></tr>`))}</div></div><div class="luoi cot-2" style="margin-top:18px"><div class="the"><h2>Thống kê hạng khách</h2>${bang(["Hạng", "Số khách", "Tổng chi"], (bc.thong_ke_cap_bac||[]).map(x=>`<tr><td>${nhanCapBac(x.cap_bac)}</td><td>${so(x.so_luong)}</td><td>${tien(x.tong_chi_tieu)}</td></tr>`))}</div><div class="the"><h2>Nguyên liệu sắp hết / hết hàng</h2>${(bc.nguyen_lieu_sap_het||[]).length?bangNguyenLieu(bc.nguyen_lieu_sap_het):`<div class="trong">Kho ổn định.</div>`}</div></div><div class="the" style="margin-top:18px"><h2>Đơn hàng gần đây</h2>${bangDonHang(trangThai.donHang.slice(0,10))}</div>`;
}
function xuatBaoCaoCSV(){
  const bc = trangThai.baoCao || {};
  const rows = [["Chỉ số", "Giá trị"],["Doanh thu hôm nay", bc.doanh_thu_hom_nay || 0],["Số đơn hôm nay", bc.so_don_hom_nay || 0],["Doanh thu tháng", bc.doanh_thu_thang || 0],["Giảm giá tháng", bc.giam_gia_thang || 0],["Chi phí nhập tháng", bc.chi_phi_nhap_thang || 0],["Lãi tạm tính", bc.loi_nhuan_tam_tinh || 0],["Đơn đã hủy tháng", bc.don_da_huy_thang || 0]];
  taiFileTenTiengViet('baocaocuahang.csv', rows.map(dongCSV).join('\n'));
  hienThongBao('Đã xuất báo cáo');
}


async function batDau() { if (!trangThai.nguoiDung || !layToken()) { renderDangNhap(); return; } try { await api.toi(); await taiDuLieuTheoTrang(); renderApp(); } catch(e) { dangXuat(); } }
setInterval(capNhatDongHo, 1000);
batDau();
