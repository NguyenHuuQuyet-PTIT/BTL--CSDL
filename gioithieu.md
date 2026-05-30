# Giới thiệu dự án quản lý cửa hàng đồ uống

Đây là đồ án web quản lý cho cửa hàng đồ uống, làm theo hướng tách rõ frontend và backend.

- Frontend để nhân viên/quản lý thao tác.
- Backend xử lý nghiệp vụ và gọi database.
- Database dùng MySQL.

## Mục đích chính

- Quản lý sản phẩm, nguyên liệu, khách hàng, nhân viên.
- Tạo đơn, thanh toán, hủy đơn.
- Nhập hàng từ nhà cung cấp.
- Xem báo cáo tổng quan bán hàng.

## Công nghệ dùng

- Frontend: HTML, CSS, JavaScript.
- Backend: Python FastAPI.
- Database: MySQL + PyMySQL.

## Các module trong hệ thống

- `dangnhap`, `xacthuc`: đăng nhập, token, phân quyền.
- `sanpham`: quản lý menu và công thức nguyên liệu.
- `nguyenlieu`: quản lý kho nguyên liệu.
- `khachhang`: quản lý khách, điểm tích lũy.
- `donhang`: tạo đơn, thanh toán, hủy đơn.
- `nhaphang`: phiếu nhập kho.
- `nhacungcap`, `nhanvien`: quản lý danh mục liên quan.
- `baocao`: số liệu tổng quan.

## Database
Database hiện có 11 bảng chính:

- `NhanVien`, `KhachHang`, `NhaCungCap`, `NguyenLieu`, `SanPham`
- `CongThuc`, `HoaDon`, `ChiTietHoaDon`, `ThanhToan`
- `PhieuNhap`, `ChiTietPhieuNhap`

Quan hệ đã được làm rõ trong:

- `so_do_er.md`
- `so_do_rd.md`