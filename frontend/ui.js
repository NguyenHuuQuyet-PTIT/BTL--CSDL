// Các hàm render giao diện được tách ra khỏi app.js để dễ đọc hơn.
// Các hàm này vẫn dùng chung helper trong app.js như tieuDe, bang, theSo, ...
function renderTongQuan() {
  const bc = trangThai.baoCao || {};
  const soDon = laQuanLy() ? bc.tong_don : trangThai.donHang.length;
  const doanhThu = laQuanLy() ? bc.doanh_thu_hom_nay : trangThai.donHang.filter(d => String(d.thoi_diem).slice(0,10) === ngayVietNam()).reduce((s,d)=>s+Number(d.tong_tien),0);
  const soSP = laQuanLy() ? (bc.tong_sp || trangThai.sanPham.length) : trangThai.sanPham.filter(x=>x.trang_thai==='dang_ban').length;
  const soKhach = laQuanLy() ? (bc.tong_khach || trangThai.khachHang.length) : trangThai.khachHang.length;
  document.getElementById("noiDung").innerHTML = `${tieuDe(`Xin chào, ${thoatHtml(trangThai.nguoiDung.ten_nv)} 👋`, `${dinhDangNgayGiaoDien()} — Chào mừng bạn trở lại!`)}<div class="luoi cot-4 dashboard-cards">${theSoDashboard("Doanh thu hôm nay", tien(doanhThu), `${so(bc.so_don_hom_nay || 0)} đơn hôm nay`, icons.trend, "xanh")}${theSoDashboard("Đơn hàng", so(soDon), `${so(bc.so_don_hom_nay || 0)} hôm nay`, icons.bag, "xanh-nhat")}${theSoDashboard("Sản phẩm", so(soSP), `${so(laQuanLy() ? (bc.tong_sp_con_hang ?? trangThai.sanPham.filter(x=>x.trang_thai==='dang_ban' && x.trang_thai_kho==='con_hang').length) : trangThai.sanPham.filter(x=>x.trang_thai==='dang_ban' && x.trang_thai_kho==='con_hang').length)} còn hàng`, icons.cube, "tim")}${theSoDashboard("Khách hàng", so(soKhach), `${so(laQuanLy() ? (bc.tong_khach_vip || trangThai.khachHang.filter(k=>k.cap_bac==='vip').length) : trangThai.khachHang.filter(k=>k.cap_bac==='vip').length)} thành viên đăng ký`, icons.people, "cam")}</div><div class="the dashboard-panel" style="margin-top:18px"><div class="tieu-de-nho"><h2>Đơn hàng gần đây</h2><span class="dashboard-count">${so(trangThai.donHang.length)} tổng cộng</span></div>${danhSachDonHangDashboard(trangThai.donHang.slice(0,6))}</div>`;
}

function renderBanHang() {
  const loai = ["Tất cả", ...new Set(trangThai.sanPham.map(x => (String(x.loai || '').trim() || 'Khác')) )];
  const khachActive = trangThai.khachHang.filter(k=>k.trang_thai === 'dang_hoat_dong');
  document.getElementById("noiDung").innerHTML = `${tieuDe("Bán hàng", "Tạo hóa đơn, áp dụng hạng khách/VIP, dùng điểm, backend tự trừ kho và cộng điểm.", `<button class="nut phu" onclick="moFormKhach()">+ Thêm nhanh khách</button>`)}<div class="bo-cuc-ban-hang"><section><div class="tab" id="tabLoai">${loai.map((l,i)=>`<button class="${i===0?'dang-chon':''}" onclick="locSanPhamBan('${thoatHtml(l)}', this)">${thoatHtml(l)}</button>`).join("")}</div><div class="luoi-san-pham" id="dsSanPhamBan"></div></section><aside class="the gio-hang"><h2>Giỏ hàng</h2><label>Khách hàng</label><select id="chonKhach" onchange="capNhatThongTinKhachBanHang()"><option value="">Khách lẻ</option>${khachActive.map(k=>`<option value="${k.ma_kh}">${thoatHtml(k.ten_kh)} - ${thoatHtml(k.sdt)} - ${tenCapBac(k.cap_bac)} - ${so(k.diem)} điểm</option>`).join("")}</select><div id="thongTinKhachBanHang" class="khach-pos"></div><label>Sử dụng điểm</label><input id="diemSuDung" type="number" min="0" value="0" oninput="capNhatDiemDoi()" placeholder="1 điểm = 1.000đ, tối đa 50% hóa đơn"><div id="dsGioHang"></div><div class="tong"><span>Tạm tính</span><span id="tamTinhGio">0 ₫</span></div><div class="tong nhe"><span>Giảm hạng/VIP</span><span id="giamCapBacGio">0 ₫</span></div><div class="tong nhe"><span>Giảm bằng điểm</span><span id="giamDiemGio">0 ₫</span></div><div class="tong lon"><span>Khách cần trả</span><span id="tongGio">0 ₫</span></div><button class="nut chinh" style="width:100%" onclick="thanhToan()">Thanh toán</button></aside></div>`;
  locSanPhamBan("Tất cả");
  renderGioHang();
}

function renderMenu() {
  trangThai.locMenu = trangThai.locMenu || { tuKhoa: '', loai: 'tat_ca', trangThai: 'tat_ca', kho: 'tat_ca' };
  const loai = [...new Set(trangThai.sanPham.map(x => (String(x.loai || '').trim() || 'Khác')) )];
  const conHang = trangThai.sanPham.filter(x => x.trang_thai === 'dang_ban' && x.trang_thai_kho === 'con_hang').length;
  const sapHet = trangThai.sanPham.filter(x => x.trang_thai === 'dang_ban' && x.trang_thai_kho === 'sap_het').length;
  const hetHang = trangThai.sanPham.filter(x => x.trang_thai === 'dang_ban' && (x.trang_thai_kho === 'het_hang' || x.trang_thai_kho === 'chua_co_cong_thuc' || !x.co_the_ban)).length;
  const chinhTay = trangThai.sanPham.filter(x => (x.trang_thai_kho_chinh_tay || 'tu_dong') !== 'tu_dong').length;
    document.getElementById("noiDung").innerHTML = `${tieuDe("Quản lý Menu", `${so(trangThai.sanPham.length)} sản phẩm trong menu`, `<button class="nut chinh" onclick="moFormSanPham()">+ Thêm món mới</button>`)}\n  <div class="luoi cot-4">${theSo('Còn hàng', so(conHang), 'Đang bán được')}${theSo('Sắp hết', so(sapHet), 'Cần theo dõi')}${theSo('Hết hàng', so(hetHang), 'POS không cho bán')}${theSo('Quản lý chỉnh tay', so(chinhTay), 'Không tính tự động')}</div>\n  <div class="the" style="margin-top:18px"><div class="bo-loc nam-cot"><input id="timMenu" placeholder="Tìm kiếm tên món..." value="${thoatHtml(trangThai.locMenu.tuKhoa)}" oninput="locMenu()"><select id="locLoaiMenu" onchange="locMenu()"><option value="tat_ca">Tất cả loại</option>${loai.map(l=>`<option value="${thoatHtml(l)}">${thoatHtml(l)}</option>`).join('')}</select><select id="locTTMenu" onchange="locMenu()"><option value="tat_ca">Tất cả trạng thái bán</option><option value="dang_ban">Đang bán</option><option value="ngung_ban">Ngừng bán</option></select><select id="locKhoMenu" onchange="locMenu()"><option value="tat_ca">Tất cả kho</option><option value="con_hang">Còn hàng</option><option value="sap_het">Sắp hết</option><option value="het_hang">Hết hàng</option><option value="chua_co_cong_thuc">Chưa có công thức</option></select><button class="nut phu" onclick="xuatMenuCSV()">Xuất CSV</button></div><div id="dsSanPhamQuanLy" class="luoi-san-pham"></div></div>`;
  document.getElementById('locLoaiMenu').value = trangThai.locMenu.loai;
  document.getElementById('locTTMenu').value = trangThai.locMenu.trangThai;
  document.getElementById('locKhoMenu').value = trangThai.locMenu.kho;
  renderGridMenu();
}

function renderKho() {
  trangThai.locKho = trangThai.locKho || { tuKhoa:'', trangThai:'tat_ca' };
  const sapHet = trangThai.nguyenLieu.filter(x => x.trang_thai !== 'con_hang').length;
  const giaTriTon = trangThai.nguyenLieu.reduce((s,n)=>s+Number(n.so_luong_ton||0)*Number(n.gia_nhap_tb||0),0);
   document.getElementById("noiDung").innerHTML = `${tieuDe("Kho hàng", "Kho tự giảm khi bán, tự tăng khi nhập. Có cảnh báo sắp hết và giá trị tồn kho.", `<button class="nut chinh" onclick="moFormNguyenLieu()">+ Thêm nguyên liệu</button>`)}\n  <div class="luoi cot-4">${theSo('Nguyên liệu', so(trangThai.nguyenLieu.length), 'Đang quản lý')}${theSo('Sắp hết/hết', so(sapHet), 'Cần nhập thêm')}${theSo('Giá trị tồn', tien(giaTriTon), 'Tồn kho tạm tính')}${theSo('Đủ hàng', so(trangThai.nguyenLieu.length-sapHet), 'Trạng thái còn hàng')}</div>\n  <div class="the" style="margin-top:18px"><div class="bo-loc ba-cot"><input id="timKho" placeholder="Tìm mã, tên, đơn vị..." value="${thoatHtml(trangThai.locKho.tuKhoa)}" oninput="locKho()"><select id="locTTKho" onchange="locKho()"><option value="tat_ca">Tất cả trạng thái</option><option value="con_hang">Còn hàng</option><option value="sap_het">Sắp hết</option><option value="het_hang">Hết hàng</option></select><button class="nut phu" onclick="xuatKhoCSV()">Xuất CSV</button></div><div id="bangKho"></div></div>`;
  document.getElementById('locTTKho').value = trangThai.locKho.trangThai;
  renderBangKho();
}

function renderNhapHang() {
  document.getElementById("noiDung").innerHTML = `${tieuDe("Nhập hàng", "Tạo phiếu nhập, tăng tồn kho và cập nhật giá nhập trung bình.")}\n  <div class="luoi cot-2"><div class="the"><h2>Tạo phiếu nhập</h2><label>Nhà cung cấp</label><select id="chonNCC">${trangThai.nhaCungCap.map(n=>`<option value="${n.ma_ncc}">${thoatHtml(n.ten_ncc)}</option>`).join("")}</select><label>Ghi chú</label><input id="ghiChuNhap" placeholder="Ví dụ: nhập theo hóa đơn số..."><div class="hang-form"><div><label>Nguyên liệu</label><select id="chonNLNhap">${trangThai.nguyenLieu.map(n=>`<option value="${n.ma_nl}">${n.ma_nl} - ${thoatHtml(n.ten_nl)} (${n.don_vi})</option>`).join("")}</select></div><div><label>Số lượng</label><input id="soLuongNhap" type="number" min="0.01" step="0.01" value="1"></div><div><label>Đơn giá</label><input id="donGiaNhap" type="number" min="1" value="10000"></div></div><button class="nut phu" onclick="themHangNhap()">+ Thêm dòng</button><div id="dsHangNhap"></div><div class="tong"><span>Tổng nhập</span><span id="tongNhap">0 ₫</span></div><button class="nut chinh" style="width:100%" onclick="luuPhieuNhap()">Lưu phiếu nhập</button></div><div class="the"><div class="tieu-de-nho"><h2>Phiếu nhập gần đây</h2><button class="nut phu nho" onclick="xuatNhapCSV()">Xuất CSV</button></div>${bangPhieuNhap(trangThai.phieuNhap.slice(0,10))}</div></div>`;
    document.getElementById("noiDung").innerHTML = `${tieuDe("Nhập hàng", "Tạo phiếu nhập, tăng tồn kho và cập nhật giá nhập trung bình.")}\n  <div class="luoi cot-2"><div class="the"><h2>Tạo phiếu nhập</h2><label>Nhà cung cấp</label><select id="chonNCC">${trangThai.nhaCungCap.map(n=>`<option value="${n.ma_ncc}">${thoatHtml(n.ten_ncc)}</option>`).join("")}</select><label>Ghi chú</label><input id="ghiChuNhap" placeholder="Ví dụ: nhập theo hóa đơn số..."><div class="hang-form"><div><label>Nguyên liệu</label><select id="chonNLNhap">${trangThai.nguyenLieu.map(n=>`<option value="${n.ma_nl}">${n.ma_nl} - ${thoatHtml(n.ten_nl)} (${n.don_vi})</option>`).join("")}</select></div><div><label>Số lượng</label><input id="soLuongNhap" type="number" min="0.01" step="0.01" value="1"></div><div><label>Đơn giá</label><input id="donGiaNhap" type="number" min="1" value="10000"></div></div><button class="nut phu" onclick="themHangNhap()">+ Thêm dòng</button><div id="dsHangNhap"></div><div class="tong"><span>Tổng nhập</span><span id="tongNhap">0 ₫</span></div><button class="nut chinh" style="width:100%" onclick="luuPhieuNhap()">Lưu phiếu nhập</button></div><div class="the"><div class="tieu-de-nho"><h2>Phiếu nhập gần đây</h2><button class="nut phu nho" onclick="xuatNhapCSV()">Xuất CSV</button></div>${bangPhieuNhap(trangThai.phieuNhap.slice(0,10))}</div></div>`;
  renderHangNhap();
}

function renderNhaCungCap() {
  trangThai.locNCC = trangThai.locNCC || '';
  document.getElementById("noiDung").innerHTML = `${tieuDe("Nhà cung cấp", "Nhà cung cấp liên kết với phiếu nhập và lịch sử nhập hàng.", `<button class="nut chinh" onclick="moFormNCC()">+ Thêm nhà cung cấp</button>`)}<div class="the"><div class="bo-loc hai-cot"><input id="timNCC" placeholder="Tìm tên, SĐT, địa chỉ..." value="${thoatHtml(trangThai.locNCC)}" oninput="locNCC()"><button class="nut phu" onclick="xuatNCCCSV()">Xuất CSV</button></div><div id="bangNCC"></div></div>`;
  renderBangNCC();
}

function renderKhachHang() {
  const active=trangThai.khachHang.filter(k=>k.trang_thai==='dang_hoat_dong');
  const vip=active.filter(k=>k.cap_bac==='vip');
  const tongDiem=active.reduce((s,k)=>s+Number(k.diem||0),0);
  document.getElementById("noiDung").innerHTML = `${tieuDe("Khách hàng", "Quản lý hồ sơ khách, điểm tích lũy, hạng Bạc/Vàng/VIP, lịch sử mua và trạng thái hoạt động.", `<button class="nut chinh" onclick="moFormKhach()">+ Thêm khách hàng</button>`)}<div class="luoi cot-4">${theSo("Khách hoạt động", so(active.length), "Được chọn khi bán hàng")}${theSo("Khách VIP", so(vip.length), "Tự cập nhật theo điểm/chi tiêu")}${theSo("Tổng điểm", so(tongDiem), "Dùng để giảm giá")}${theSo("Ngừng hoạt động", so(trangThai.khachHang.length-active.length), "Vẫn giữ lịch sử mua")}</div><div class="the" style="margin-top:18px"><div class="bo-loc"><input id="timKhach" placeholder="Tìm theo tên, SĐT, email, địa chỉ..." value="${thoatHtml(trangThai.boLocKhach.tuKhoa)}" oninput="locKhachHang()"><select id="locCapKhach" onchange="locKhachHang()"><option value="tat_ca">Tất cả hạng</option><option value="thuong">Thường</option><option value="bac">Bạc</option><option value="vang">Vàng</option><option value="vip">VIP</option></select><select id="locTTKhach" onchange="locKhachHang()"><option value="tat_ca">Tất cả trạng thái</option><option value="dang_hoat_dong">Đang hoạt động</option><option value="ngung_hoat_dong">Ngừng hoạt động</option></select></div><div id="bangKhachHang"></div></div>`;
  locCapKhach.value=trangThai.boLocKhach.capBac; locTTKhach.value=trangThai.boLocKhach.trangThai; renderBangKhachHang();
}

function renderNhanVien() {
  trangThai.locNV = trangThai.locNV || { tuKhoa:'', vaiTro:'tat_ca', trangThai:'tat_ca' };
  const ql = trangThai.nhanVien.filter(n=>n.vai_tro==='quan_ly').length;
  const nv = trangThai.nhanVien.filter(n=>n.vai_tro==='nhan_vien').length;
  const dangLam = trangThai.nhanVien.filter(n=>n.trang_thai==='dang_lam').length;
  document.getElementById("noiDung").innerHTML = `${tieuDe("Nhân viên", "Quản lý tài khoản đăng nhập, phân quyền và trạng thái làm việc.", `<button class="nut chinh" onclick="moFormNhanVien()">+ Thêm nhân viên</button>`)}<div class="luoi cot-4">${theSo('Tổng nhân viên', so(trangThai.nhanVien.length), 'Tài khoản trong hệ thống')}${theSo('Quản lý', so(ql), 'Có quyền quản trị')}${theSo('Nhân viên', so(nv), 'Bán hàng/chăm sóc khách')}${theSo('Đang làm', so(dangLam), 'Có thể đăng nhập')}</div><div class="the" style="margin-top:18px"><div class="bo-loc bon-cot"><input id="timNV" placeholder="Tìm tên, SĐT, username..." value="${thoatHtml(trangThai.locNV.tuKhoa)}" oninput="locNhanVien()"><select id="locVaiTroNV" onchange="locNhanVien()"><option value="tat_ca">Tất cả vai trò</option><option value="quan_ly">Quản lý</option><option value="nhan_vien">Nhân viên</option></select><select id="locTTNV" onchange="locNhanVien()"><option value="tat_ca">Tất cả trạng thái</option><option value="dang_lam">Đang làm</option><option value="nghi_lam">Nghỉ làm</option></select><button class="nut phu" onclick="xuatNVCSV()">Xuất CSV</button></div><div id="bangNhanVien"></div></div>`;
  locVaiTroNV.value=trangThai.locNV.vaiTro; locTTNV.value=trangThai.locNV.trangThai; renderBangNhanVien();
}

function renderBaoCao() {
  const bc = trangThai.baoCao || {};
  const max = Math.max(...(bc.doanh_thu_7_ngay || []).map(x=>Number(x.doanh_thu)), 1);
  const cot = (bc.doanh_thu_7_ngay || []).map(x=>`<div style="height:${Math.max(8, Number(x.doanh_thu)/max*120)}px" title="${x.ngay}: ${tien(x.doanh_thu)}"><span>${String(x.ngay).slice(5)}</span></div>`).join("");
  document.getElementById("noiDung").innerHTML = `${tieuDe("Báo cáo", "Báo cáo lấy trực tiếp từ đơn hàng, phiếu nhập, khách hàng, sản phẩm và kho.", `<button class="nut phu" onclick="xuatBaoCaoCSV()">Xuất báo cáo CSV</button>`)}<div class="luoi cot-4">${theSo("Doanh thu hôm nay", tien(bc.doanh_thu_hom_nay), `${so(bc.so_don_hom_nay)} đơn`)}${theSo("Doanh thu tháng", tien(bc.doanh_thu_thang), "Chỉ tính đơn đã thanh toán")}${theSo("Giảm giá tháng", tien(bc.giam_gia_thang), "VIP + điểm khách hàng")}${theSo("Đơn đã hủy", so(bc.don_da_huy_thang), "Tháng hiện tại")}</div><div class="luoi cot-2" style="margin-top:18px"><div class="the"><h2>Doanh thu 7 ngày</h2><div class="cot-bieu-do">${cot || "<div></div>"}</div></div><div class="the"><h2>Phương thức thanh toán</h2>${bang(["Phương thức", "Số đơn", "Doanh thu"], (bc.thong_ke_thanh_toan||[]).map(x=>`<tr><td>${tenPhuongThuc(x.phuong_thuc_thanh_toan)}</td><td>${so(x.so_don)}</td><td>${tien(x.doanh_thu)}</td></tr>`))}</div></div><div class="luoi cot-2" style="margin-top:18px"><div class="the"><h2>Sản phẩm bán chạy</h2>${bang(["Mã", "Tên", "Số lượng", "Doanh thu"], (bc.top_san_pham||[]).map(x=>`<tr><td>${x.ma_sp}</td><td>${thoatHtml(x.ten_sp)}</td><td>${so(x.so_luong)}</td><td>${tien(x.doanh_thu)}</td></tr>`))}</div><div class="the"><h2>Top khách hàng</h2>${bang(["Khách", "Hạng", "Điểm", "Tổng chi"], (bc.top_khach_hang||[]).map(k=>`<tr><td><b>${thoatHtml(k.ten_kh)}</b><br><span class="so-lieu-phu">${thoatHtml(k.sdt)}</span></td><td>${nhanCapBac(k.cap_bac)}</td><td>${so(k.diem)}</td><td>${tien(k.tong_chi_tieu)}</td></tr>`))}</div></div><div class="luoi cot-2" style="margin-top:18px"><div class="the"><h2>Thống kê hạng khách</h2>${bang(["Hạng", "Số khách", "Tổng chi"], (bc.thong_ke_cap_bac||[]).map(x=>`<tr><td>${nhanCapBac(x.cap_bac)}</td><td>${so(x.so_luong)}</td><td>${tien(x.tong_chi_tieu)}</td></tr>`))}</div><div class="the"><h2>Nguyên liệu sắp hết / hết hàng</h2>${(bc.nguyen_lieu_sap_het||[]).length?bangNguyenLieu(bc.nguyen_lie || []):'<div class="trong">Không có nguyên liệu cảnh báo</div>'}</div></div>`;
}

// Xuất các hàm render qua namespace window.UI
window.UI = {
  renderTongQuan, renderBanHang, renderMenu, renderKho, renderNhapHang, renderNhaCungCap, renderKhachHang, renderNhanVien, renderBaoCao
};
// Các hàm render UI chính (tách từ app.js)
function cacMucMenu() {
  const chung = [["tongquan", icons.dashboard, "Tổng quan"], ["banhang", icons.cart, "Bán hàng"], ["khachhang", icons.users, "Khách hàng"]];
  const quanLy = [["menu", icons.menu, "Quản lý Menu"], ["kho", icons.package, "Kho hàng"], ["nhaphang", icons.import, "Nhập hàng"], ["nhacungcap", icons.truck, "Nhà cung cấp"], ["nhanvien", icons.employee, "Nhân viên"], ["baocao", icons.report, "Báo cáo"]];
  return laQuanLy() ? [chung[0], chung[1], ...quanLy.slice(0,4), chung[2], ...quanLy.slice(4)] : chung;
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
        <div class="nguoi-dung"><b>${thoatHtml(trangThai.nguoiDung.ten_nv)}</b><span>${thoatHtml(tenVaiTroHienThi(trangThai.nguoiDung))}</span></div>
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

function renderTrang() { if (!laQuanLy() && !["tongquan", "banhang", "khachhang"].includes(trangThai.trang)) trangThai.trang = "tongquan"; ({ tongquan: renderTongQuan, banhang: renderBanHang, menu: renderMenu, kho: renderKho, nhaphang: renderNhapHang, nhacungcap: renderNhaCungCap, khachhang: renderKhachHang, nhanvien: renderNhanVien, baocao: renderBaoCao }[trangThai.trang] || renderTongQuan)(); }

function tieuDe(tieuDe, moTa, nutThem = "") { return `<div class="tieu-de-trang"><div><h1>${tieuDe}</h1><p>${moTa}</p></div><div>${nutThem}</div></div>`; }
function theSo(label, value, sub) { return `<div class="the"><div class="so-lieu-label">${label}</div><div class="so-lieu">${value}</div><div class="so-lieu-phu">${sub}</div></div>`; }
function bang(headers, rows) { return `<div class="bang-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("") || `<tr><td colspan="${headers.length}" class="trong">Chưa có dữ liệu</td></tr>`}</tbody></table></div>`; }
function theSoDashboard(label, value, sub, icon, tone) { return `<div class="the dashboard-card ${tone || ""}"><div class="dashboard-card-head"><div class="dashboard-card-label">${label}</div><div class="dashboard-card-icon">${icon}</div></div><div class="dashboard-card-value">${value}</div><div class="dashboard-card-sub">${sub}</div></div>`; }
function danhSachDonHangDashboard(ds) { return `<div class="dashboard-table"><div class="dashboard-row dashboard-head"><span>Mã HĐ</span><span>Khách hàng</span><span>Nhân viên</span><span>Tổng tiền</span><span></span></div>${ds.map(d => { const gio = String(d.thoi_diem || "").replace("T", " ").split(" ")[1] || ""; const time = gio.slice(0, 5); return `<button class="dashboard-row" type="button" onclick="xemDonHang('${d.ma_hd}')"><span class="dashboard-code">${thoatHtml(d.ma_hd)}</span><span>${thoatHtml(d.ten_kh)}${d.cap_bac_khach ? ` <span class="nhan capbac ${d.cap_bac_khach}">${tenCapBac(d.cap_bac_khach)}</span>` : ""}</span><span>${thoatHtml(d.ten_nv || "")}</span><span><b>${tien(d.tong_tien)}</b></span><span class="dashboard-time">${time}</span></button>`; }).join("")}</div>`; }
function bangDonHang(ds) { return bang(["Mã HĐ", "Thời gian", "Khách hàng", "Nhân viên", "Tổng tiền", "Xem"], ds.map(d=>`<tr><td>${d.ma_hd}</td><td>${dinhDangThoiGian(d.thoi_diem)}</td><td>${thoatHtml(d.ten_kh)} ${d.cap_bac_khach ? nhanCapBac(d.cap_bac_khach) : ""}</td><td>${thoatHtml(d.ten_nv || "")}</td><td><b>${tien(d.tong_tien)}</b></td><td><button class="nut phu nho" onclick="xemDonHang('${d.ma_hd}')">Chi tiết</button></td></tr>`)); }

// Lưu ý: các hàm render chi tiết (renderTongQuan, renderBanHang, ...) vẫn nằm trong app.js để giữ nguyên logic hiện tại.
