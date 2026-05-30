import json
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request


def _snake_to_pascal_key(k: str) -> str:
    explicit = {
        'sdt': 'SoDienThoai', 'so_dien_thoai': 'SoDienThoai',
        'vai_tro': 'ChucVu', 'ten_nv': 'TenNV', 'ten_sp': 'TenSP',
        'ma_sp': 'MaSP', 'ma_nv': 'MaNV', 'ma_nl': 'MaNL', 'ma_ncc': 'MaNCC',
        'ma_kh': 'MaKH', 'ma_hd': 'MaHD', 'ma_pn': 'MaPN', 'mat_khau': 'MatKhau',
        'trang_thai': 'TrangThai', 'so_luong': 'SoLuong', 'don_gia': 'DonGia',
        'tong_tien': 'TongTien', 'ghi_chu': 'GhiChu', 'diem_su_dung': 'DiemSuDung',
        'phuong_thuc_thanh_toan': 'PhuongThucThanhToan', 'ten_kh': 'TenKH', 'username': 'Username'
    }
    if k in explicit:
        return explicit[k]
    parts = k.split("_")
    abbr = set(['nv', 'sp', 'nl', 'ncc', 'hd', 'pn', 'kh'])
    return "".join(p.upper() if p in abbr else p.capitalize() for p in parts)


def _pascal_to_snake_key(k: str) -> str:
    new = ""
    for i, ch in enumerate(k):
        if ch.isupper() and i != 0 and (k[i-1].islower() or (i+1 < len(k) and k[i+1].islower())):
            new += "_"
        new += ch
    return new.lower()


def _convert_keys(obj, convert_fn):
    if isinstance(obj, dict):
        return {convert_fn(k): _convert_keys(v, convert_fn) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_convert_keys(x, convert_fn) for x in obj]
    return obj


class CaseMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            content_type = request.headers.get("content-type", "")
            if content_type.startswith("application/json"):
                body_bytes = await request.body()
                if body_bytes:
                    data = json.loads(body_bytes.decode("utf-8"))
                    pascal = _convert_keys(data, _snake_to_pascal_key)
                    snake = _convert_keys(data, _pascal_to_snake_key)
                    merged = {}

                    for src in (data, pascal, snake):
                        if isinstance(src, dict):
                            for k, v in src.items():
                                if k not in merged:
                                    merged[k] = v

                    if isinstance(merged, dict):
                        if "ChiTiet" in merged and isinstance(merged["ChiTiet"], list):
                            for it in merged["ChiTiet"]:
                                if isinstance(it, dict):
                                    if "SoLuong" in it and "SoLuongNhap" not in it:
                                        it["SoLuongNhap"] = it["SoLuong"]
                                    if "DonGia" in it and "DonGiaNhap" not in it:
                                        it["DonGiaNhap"] = it["DonGia"]
                        if "GiaNhapTb" in merged and "GiaNhapTB" not in merged:
                            merged["GiaNhapTB"] = merged["GiaNhapTb"]

                    request._body = json.dumps(merged, ensure_ascii=False).encode("utf-8")
        except Exception:
            pass

        response = await call_next(request)

        return response
