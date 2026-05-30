// Các hành động tương tác: giỏ hàng và thao tác liên quan
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