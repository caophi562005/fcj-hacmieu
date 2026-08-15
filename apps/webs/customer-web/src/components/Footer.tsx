import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="hidden md:block bg-white border-t border-border-subtle mt-12">
      <div className="container-page py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary text-white font-bold">
              V
            </span>
            <span className="text-base font-bold">V-Shop E-Commerce</span>
          </div>
          <p className="text-ink-muted leading-relaxed text-xs">
            Công ty Cổ phần Thương mại Điện tử V-Shop
            <br />
            Mã số doanh nghiệp: 0316888999 do Sở KH&amp;ĐT TP.HCM cấp.
            <br />
            Địa chỉ: Tòa nhà V-Shop, Đường Võ Văn Ngân, TP. Thủ Đức, TP. Hồ Chí Minh.
            <br />
            Hotline: 1900 6868 — Email: hotro@vshop.vn
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Về V-Shop</h4>
          <ul className="space-y-2 text-ink-muted text-xs">
            <li>
              <Link className="hover:text-primary transition-colors" href="#">
                Giới thiệu về Sàn V-Shop
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary transition-colors" href="/policies">
                Quy chế hoạt động sàn TMĐT
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary transition-colors" href="#">
                Kênh Người bán (Seller Centre)
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary transition-colors" href="#">
                Liên hệ hợp tác
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2 text-ink-muted text-xs">
            <li>
              <Link className="hover:text-primary transition-colors" href="/policies#returns">
                Trung tâm trợ giúp &amp; Đổi trả
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-primary transition-colors"
                href="/policies#warranty"
              >
                Chính sách bảo hành
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary transition-colors" href="#">
                Hướng dẫn thanh toán VietQR
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-primary transition-colors"
                href="/policies#complaints"
              >
                Chính sách giải quyết tranh chấp
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-primary transition-colors"
                href="/policies#shipping"
              >
                Quy trình giao hàng &amp; Vận chuyển
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Tuân thủ pháp luật</h4>
          <ul className="space-y-2 text-ink-muted text-xs mb-4">
            <li>
              <Link className="hover:text-primary transition-colors" href="#">
                Điều khoản sử dụng giao dịch
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary transition-colors" href="#">
                Chính sách bảo vệ dữ liệu cá nhân (NĐ 13/2023)
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary transition-colors" href="#">
                Kê khai thuế nộp thay (NĐ 91/2022)
              </Link>
            </li>
          </ul>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Đã đăng ký Bộ Công Thương</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border-subtle">
        <div className="container-page py-4 text-xs text-ink-subtle text-center">
          © 2026 V-Shop E-Commerce Platform. Mọi quyền được bảo lưu theo Luật Thương mại &amp; Giao dịch điện tử Việt Nam.
        </div>
      </div>
    </footer>
  );
}
