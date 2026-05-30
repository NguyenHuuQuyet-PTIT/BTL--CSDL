import base64
import hashlib
import hmac
import json
import os
import time

from fastapi import Depends, Header, HTTPException, status

from ..SQL.cosodulieu import lay_mot

KHOA_BI_MAT = os.getenv("KHOA_BI_MAT", "doi-khoa-nay-khi-dua-len-web")
THOI_HAN_TOKEN_GIAY = 7 * 24 * 60 * 60


def _ky(noi_dung: str) -> str:
    return hmac.new(KHOA_BI_MAT.encode(), noi_dung.encode(), hashlib.sha256).hexdigest()


def tao_token(nguoi_dung: dict) -> str:
    payload = {
        "MaNV": nguoi_dung["MaNV"],
        "Username": nguoi_dung["Username"],
        "ChucVu": nguoi_dung["ChucVu"],
        "HetHan": int(time.time()) + THOI_HAN_TOKEN_GIAY,
    }
    noi_dung = base64.urlsafe_b64encode(json.dumps(payload, ensure_ascii=False).encode()).decode()
    return noi_dung + "." + _ky(noi_dung)


def doc_token(token: str) -> dict:
    try:
        noi_dung, chu_ky = token.split(".", 1)
        if not hmac.compare_digest(_ky(noi_dung), chu_ky):
            raise ValueError("Chu ky sai")
        payload = json.loads(base64.urlsafe_b64decode(noi_dung.encode()).decode())
        if payload.get("HetHan", 0) < int(time.time()):
            raise ValueError("Het han")
        return payload
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token không hợp lệ hoặc đã hết hạn")


def nguoi_dung_hien_tai(authorization: str = Header(default="")) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bạn cần đăng nhập")

    payload = doc_token(authorization.replace("Bearer ", "", 1).strip())
    nguoi_dung = lay_mot(
        "SELECT MaNV, TenNV, ChucVu, SoDienThoai, Username, TrangThai FROM NhanVien WHERE MaNV=? AND TrangThai='dang_lam'",
        (payload["MaNV"],),
    )
    if not nguoi_dung:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Tài khoản không còn hoạt động")
    if "ChucVu" in nguoi_dung:
        import unicodedata
        cv_raw = (nguoi_dung.get("ChucVu") or "").strip()
        folded = ''.join(c for c in unicodedata.normalize('NFKD', cv_raw) if not unicodedata.combining(c)).lower()
        if 'quan' in folded:
            nguoi_dung["VaiTro"] = "quan_ly"
        elif 'nhan' in folded or 'staff' in folded or folded == 'nv':
            nguoi_dung["VaiTro"] = "nhan_vien"
        else:
            nguoi_dung["VaiTro"] = folded.replace(" ", "_")

    return nguoi_dung


def chi_quan_ly(nguoi_dung: dict = Depends(nguoi_dung_hien_tai)) -> dict:
    # Sử dụng trường `VaiTro` đã chuẩn hóa (quan_ly / nhan_vien) để kiểm tra phân quyền
    if nguoi_dung.get("VaiTro") != "quan_ly":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chức năng này chỉ dành cho quản lý")

    return nguoi_dung
