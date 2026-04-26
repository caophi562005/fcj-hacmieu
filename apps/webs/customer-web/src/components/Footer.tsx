import Link from 'next/link';

export function Footer() {
  return (
    <footer className="hidden md:block bg-white border-t border-border-subtle mt-12">
      <div className="container-page py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary text-white font-bold">
              V
            </span>
            <span className="text-base font-bold">V-Shop</span>
          </div>
          <p className="text-ink-muted leading-relaxed">
            Sàn thương mại điện tử hiện đại — hàng triệu sản phẩm, giao nhanh,
            thanh toán an toàn.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Về V-Shop</h4>
          <ul className="space-y-2 text-ink-muted">
            <li><Link className="hover:text-primary" href="#">Giới thiệu</Link></li>
            <li><Link className="hover:text-primary" href="#">Tuyển dụng</Link></li>
            <li><Link className="hover:text-primary" href="#">Liên hệ</Link></li>
            <li><Link className="hover:text-primary" href="#">Tin tức</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2 text-ink-muted">
            <li><Link className="hover:text-primary" href="#">Trung tâm trợ giúp</Link></li>
            <li><Link className="hover:text-primary" href="#">Hướng dẫn mua hàng</Link></li>
            <li><Link className="hover:text-primary" href="#">Chính sách đổi trả</Link></li>
            <li><Link className="hover:text-primary" href="#">Vận chuyển</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Pháp lý</h4>
          <ul className="space-y-2 text-ink-muted">
            <li><Link className="hover:text-primary" href="#">Điều khoản dịch vụ</Link></li>
            <li><Link className="hover:text-primary" href="#">Chính sách bảo mật</Link></li>
            <li><Link className="hover:text-primary" href="#">Chính sách thanh toán</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border-subtle">
        <div className="container-page py-4 text-xs text-ink-subtle text-center">
          © 2024 V-Shop. Mọi quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
