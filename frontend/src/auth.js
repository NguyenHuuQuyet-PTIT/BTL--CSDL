// Quản lý đăng nhập, phiên và tải dữ liệu khi đăng nhập
function dangXuat() {
  sessionStorage.removeItem("token_quan_ly_do_uong");
  sessionStorage.removeItem("nguoi_dung_do_uong");
  trangThai.nguoiDung = null;
  trangThai.gioHang = [];
  renderDangNhap();
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

// Khi tải trang, nếu có session lưu sẵn thì dùng luôn
try {
  const s = sessionStorage.getItem("nguoi_dung_do_uong");
  if (s) trangThai.nguoiDung = JSON.parse(s);
} catch (e) {}
