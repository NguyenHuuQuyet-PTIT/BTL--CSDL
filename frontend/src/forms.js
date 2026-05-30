function xacNhan(tieuDe, noiDung) {
  return new Promise(resolve => {
    document.getElementById("modalXacNhan")?.remove();
    document.body.insertAdjacentHTML("beforeend", `<div class="modal" id="modalXacNhan"><div class="hop-modal hop-xac-nhan"><h2>${thoatHtml(tieuDe)}</h2><p>${thoatHtml(noiDung)}</p><div class="hang-nut"><button class="nut phu" id="huyXacNhan">Hủy</button><button class="nut chinh" id="dongYXacNhan">Đồng ý</button></div></div></div>`);
    huyXacNhan.onclick = () => { modalXacNhan.remove(); resolve(false); };
    dongYXacNhan.onclick = () => { modalXacNhan.remove(); resolve(true); };
  });
}

function moModal(noiDung) {
  document.body.insertAdjacentHTML("beforeend", `<div class="modal" id="modal"><div class="hop-modal">${noiDung}</div></div>`);
}

function dongModal() {
  document.getElementById("modal")?.remove();
}

function moFormChung({ tieuDe, fields, onSave }) {
  moModal(`<h2>${tieuDe}</h2><form id="formChung"><div class="hang-form">${fields.map(([id,label,value,type])=>`<div><label>${label}</label><input id="${id}" type="${type||'text'}" value="${thoatHtml(value)}" required></div>`).join("")}</div><div class="hang-nut"><button type="button" class="nut phu" onclick="dongModal()">Hủy</button><button class="nut chinh">Lưu</button></div></form>`);
  formChung.addEventListener("submit", async e=>{
    e.preventDefault();
    const data={};
    fields.forEach(([id])=> data[id]=document.getElementById(id).value);
    try{ await onSave(data); dongModal(); hienThongBao("Đã lưu"); } catch(err){ baoLoi(err); }
  });
}

// Xuất các hàm form để các module khác gọi qua window.Forms
window.Forms = { xacNhan, moModal, dongModal, moFormChung, moFormSanPham, moFormNguyenLieu, moFormNCC, moFormKhach, moFormNhanVien };

function moFormSanPham(ma) {
  const sp = trangThai.sanPham.find(x=>x.ma_sp===ma) || { trang_thai_kho_chinh_tay: 'tu_dong' };
  moModal(`<h2>${ma ? "Sửa món" : "Thêm món mới"}</h2>
  <form id="formSanPham">
    <div class="hang-form">
      <div><label>Tên sản phẩm</label><input id="ten_sp" value="${thoatHtml(sp.ten_sp || "")}" required></div>
      <div><label>Hình ảnh</label><input id="hinh_anh" value="${thoatHtml(sp.hinh_anh || "")}" placeholder="Dán URL ảnh sản phẩm"></div>
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
      hinh_anh:hinh_anh.value.trim(),
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

function moFormNguyenLieu(ma) { const n = trangThai.nguyenLieu.find(x=>x.ma_nl===ma)||{}; moFormChung({ tieuDe: ma?"Sửa nguyên liệu":"Thêm nguyên liệu", fields: [["ten_nl","Tên nguyên liệu",n.ten_nl||""],["don_vi","Đơn vị",n.don_vi||""],["so_luong_ton","Số lượng tồn",n.so_luong_ton||0,"number"],["muc_canh_bao","Mức cảnh báo",n.muc_canh_bao||0,"number"],["gia_nhap_tb","Giá nhập trung bình",n.gia_nhap_tb||0,"number"]], onSave: async data => { data.so_luong_ton=Number(data.so_luong_ton||0); data.muc_canh_bao=Number(data.muc_canh_bao||0); data.gia_nhap_tb=Number(data.gia_nhap_tb||0); ma?await api.suaNguyenLieu(ma,data):await api.themNguyenLieu(data); trangThai.nguyenLieu=await api.layNguyenLieu(); renderKho(); } }); }

function moFormNCC(ma) { const n = trangThai.nhaCungCap.find(x=>x.ma_ncc===ma)||{}; moFormChung({ tieuDe: ma?"Sửa nhà cung cấp":"Thêm nhà cung cấp", fields: [["ten_ncc","Tên",n.ten_ncc||""],["sdt","SĐT",n.sdt||""],["dia_chi","Địa chỉ",n.dia_chi||""],["ghi_chu","Ghi chú",n.ghi_chu||""]], onSave: async data => { ma ? await api.suaNhaCungCap(ma,data) : await api.themNhaCungCap(data); trangThai.nhaCungCap = await api.layNhaCungCap(); renderNhaCungCap(); } }); }

function moFormKhach(ma) { const k = trangThai.khachHang.find(x=>x.ma_kh===ma)||{}; moModal(`<h2>${ma?"Sửa":"Thêm"} khách hàng</h2><form id="formKhach"><div class="hang-form"><div><label>Tên khách hàng</label><input id="ten_kh" value="${thoatHtml(k.ten_kh||"")}" required></div><div><label>Số điện thoại</label><input id="sdt" value="${thoatHtml(k.sdt||"")}" required></div><div><label>Email</label><input id="email" type="email" value="${thoatHtml(k.email||"")}"></div><div><label>Địa chỉ</label><input id="dia_chi" value="${thoatHtml(k.dia_chi||"")}"></div><div><label>Ngày sinh</label><input id="ngay_sinh" type="date" value="${thoatHtml(k.ngay_sinh||"")}"></div><div><label>Giới tính</label><select id="gioi_tinh"><option value="" ${!k.gioi_tinh?'selected':''}>Không ghi</option><option ${k.gioi_tinh==='Nam'?'selected':''}>Nam</option><option ${k.gioi_tinh==='Nữ'?'selected':''}>Nữ</option><option ${k.gioi_tinh==='Khác'?'selected':''}>Khác</option></select></div><div><label>Điểm hiện có</label><input id="diem" type="number" min="0" value="${k.diem||0}"></div><div><label>Trạng thái</label><select id="trang_thai"><option value="dang_hoat_dong" ${k.trang_thai!=='ngung_hoat_dong'?'selected':''}>Đang hoạt động</option><option value="ngung_hoat_dong" ${k.trang_thai==='ngung_hoat_dong'?'selected':''}>Ngừng hoạt động</option></select></div><div class="full"><label>Ghi chú chăm sóc khách hàng</label><input id="ghi_chu" value="${thoatHtml(k.ghi_chu||"")}"></div></div><p class="so-lieu-phu">Hạng khách sẽ tự cập nhật theo điểm và tổng chi tiêu. Bạc từ 100 điểm/1.000.000đ, Vàng từ 300 điểm/3.000.000đ, VIP từ 800 điểm/8.000.000đ.</p><div class="hang-nut"><button type="button" class="nut phu" onclick="dongModal()">Hủy</button><button class="nut chinh">Lưu</button></div></form>`); formKhach.addEventListener("submit", async e=>{ e.preventDefault(); const data={ten_kh:ten_kh.value.trim(), sdt:sdt.value.trim(), email:email.value.trim(), dia_chi:dia_chi.value.trim(), ngay_sinh:ngay_sinh.value, gioi_tinh:gioi_tinh.value, diem:Number(diem.value||0), trang_thai:trang_thai.value, ghi_chu:ghi_chu.value.trim()}; try{ if(ma) await api.suaKhachHang(ma,data); else await api.themKhachHang(data); dongModal(); trangThai.khachHang = await api.layKhachHang(); renderKhachHang(); hienThongBao('Đã lưu khách hàng'); }catch(err){ baoLoi(err); } }); }

function moFormNhanVien(ma) { const n = trangThai.nhanVien.find(x=>x.ma_nv===ma)||{}; moModal(`<h2>${ma?"Sửa":"Thêm"} nhân viên</h2><form id="formNV"><div class="hang-form"><div><label>Tên</label><input id="ten_nv" value="${thoatHtml(n.ten_nv||"")}" required></div><div><label>Vai trò</label><select id="vai_tro"><option value="nhan_vien" ${n.vai_tro==='nhan_vien'?'selected':''}>Nhân viên</option><option value="quan_ly" ${n.vai_tro==='quan_ly'?'selected':''}>Quản lý</option></select></div><div><label>SĐT</label><input id="sdt" value="${thoatHtml(n.sdt||"")}"></div><div><label>Username</label><input id="username" value="${thoatHtml(n.username||"")}" required></div><div><label>Mật khẩu ${ma?"(bỏ trống nếu không đổi)":""}</label><input id="mat_khau" type="password" ${ma?"":"required"}></div><div><label>Trạng thái</label><select id="trang_thai"><option value="dang_lam" ${n.trang_thai==='dang_lam'?'selected':''}>Đang làm</option><option value="nghi_lam" ${n.trang_thai==='nghi_lam'?'selected':''}>Nghỉ làm</option></select></div></div><div class="hang-nut"><button type="button" class="nut phu" onclick="dongModal()">Hủy</button><button class="nut chinh">Lưu</button></div></form>`); formNV.addEventListener("submit", async e=>{ e.preventDefault(); const data={ten_nv:ten_nv.value.trim(), vai_tro:vai_tro.value, sdt:sdt.value.trim(), username:username.value.trim(), mat_khau:mat_khau.value, trang_thai:trang_thai.value}; try{ if(ma) await api.suaNhanVien(ma,data); else await api.themNhanVien(data); dongModal(); trangThai.nhanVien=await api.layNhanVien(); renderNhanVien(); hienThongBao("Đã lưu nhân viên"); }catch(err){ baoLoi(err); } }); }
