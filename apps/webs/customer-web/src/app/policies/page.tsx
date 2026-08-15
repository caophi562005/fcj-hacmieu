import {
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  RefreshCcw,
  Scale,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { MainShell } from '../../components/MainShell';

const sections = [
  { href: '#shipping', label: 'Vận chuyển' },
  { href: '#returns', label: 'Đổi trả & hoàn tiền' },
  { href: '#warranty', label: 'Bảo hành' },
  { href: '#seller-settlement', label: 'Thanh toán cho Shop' },
  { href: '#complaints', label: 'Khiếu nại' },
];

export const metadata = {
  title: 'Chính sách mua bán | V-Shop',
  description:
    'Chính sách vận chuyển, đổi trả, hoàn tiền, bảo hành và thanh toán doanh thu cho Shop trên V-Shop.',
};

export default function PoliciesPage() {
  return (
    <MainShell>
      <div className="container-page py-6 md:py-10">
        <div className="mx-auto max-w-5xl">
          <header className="rounded-xl bg-gradient-to-br from-primary to-primary-600 px-5 py-8 text-white shadow-card md:px-10 md:py-12">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" />
              Bảo vệ Người mua và Người bán
            </div>
            <h1 className="text-2xl font-bold md:text-4xl">
              Chính sách giao dịch V-Shop
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/90 md:text-base">
              Quy định về vận chuyển, đổi trả, hoàn tiền, bảo hành, giải quyết
              khiếu nại và thanh toán doanh thu cho Shop khi giao dịch trên
              V-Shop.
            </p>
            <p className="mt-4 text-xs text-white/75">
              Cập nhật lần cuối: 15/08/2026
            </p>
          </header>

          <nav
            aria-label="Mục lục chính sách"
            className="mt-4 flex gap-2 overflow-x-auto rounded-lg border border-border-subtle bg-white p-3 shadow-card"
          >
            {sections.map((section) => (
              <a
                key={section.href}
                href={section.href}
                className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-primary hover:text-primary"
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="mt-6 space-y-6 text-sm leading-7 text-ink-muted">
            <PolicySection id="general" icon={Scale} title="1. Phạm vi và nguyên tắc chung">
              <p>
                Chính sách này áp dụng cho Người mua, Shop, đơn vị vận chuyển
                và các bên liên quan đến giao dịch được thực hiện trên V-Shop.
                V-Shop cung cấp nền tảng trung gian, hỗ trợ đặt hàng, thanh toán,
                vận chuyển và xử lý tranh chấp; Shop chịu trách nhiệm về nguồn
                gốc, chất lượng, tính hợp pháp, thông tin và chế độ bảo hành của
                hàng hóa do mình đăng bán.
              </p>
              <p>
                Các bên phải cung cấp thông tin trung thực, bảo mật tài khoản,
                lưu giữ chứng từ cần thiết và hợp tác khi V-Shop xác minh giao
                dịch. Nếu pháp luật hoặc cam kết của Shop dành cho Người mua có
                quyền lợi cao hơn chính sách này, quy định hoặc cam kết có lợi
                hơn được ưu tiên áp dụng.
              </p>
            </PolicySection>

            <PolicySection id="shipping" icon={Truck} title="2. Chính sách giao hàng và vận chuyển">
              <ul className="list-disc space-y-2 pl-5">
                <li>Phí và thời gian giao dự kiến được hiển thị trước khi Người mua xác nhận đặt hàng. Thời gian thực tế có thể thay đổi do địa chỉ nhận, thời tiết, ngày nghỉ, sự kiện bất khả kháng hoặc năng lực của đơn vị vận chuyển.</li>
                <li>Shop phải đóng gói phù hợp, bàn giao đúng sản phẩm, số lượng và thời hạn. Hàng cấm, hàng giả, hàng không rõ nguồn gốc hoặc không đủ điều kiện lưu thông không được vận chuyển qua V-Shop.</li>
                <li>Người mua có trách nhiệm cung cấp đúng thông tin nhận hàng; kiểm tra tình trạng bên ngoài, số kiện và dấu hiệu hư hỏng khi nhận nếu đơn vị vận chuyển cho phép.</li>
                <li>Đơn hàng được xem là giao thành công khi đơn vị vận chuyển hoặc hệ thống V-Shop ghi nhận thành công. Việc ký nhận không làm mất quyền khiếu nại đối với lỗi ẩn, sai hàng hoặc quyền bảo hành hợp pháp.</li>
              </ul>
            </PolicySection>

            <PolicySection id="returns" icon={RefreshCcw} title="3. Chính sách đổi trả và hoàn tiền">
              <p>
                Người mua nên gửi yêu cầu đổi trả hoặc hoàn tiền trên V-Shop
                trong vòng 03 ngày theo lịch kể từ khi đơn hàng được ghi nhận
                giao thành công. Thời hạn bảo hành, quyền khiếu nại về hàng hóa
                khuyết tật và các quyền bắt buộc khác theo pháp luật vẫn được áp
                dụng dù thời hạn trên đã kết thúc.
              </p>
              <p>Yêu cầu có thể được xem xét khi:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Không nhận được hàng nhưng hệ thống báo đã giao;</li>
                <li>Hàng bị hư hỏng, thiếu sản phẩm hoặc thiếu phụ kiện;</li>
                <li>Hàng sai mẫu, sai số lượng hoặc khác đáng kể so với mô tả;</li>
                <li>Hàng giả, không rõ nguồn gốc, hết hạn hoặc không bảo đảm an toàn;</li>
                <li>Sản phẩm có lỗi kỹ thuật thuộc trách nhiệm của Shop.</li>
              </ul>
              <p>
                Người mua cần cung cấp ảnh, video mở kiện, nhãn vận chuyển, hóa
                đơn hoặc bằng chứng hợp lý. Hàng hoàn trả phải gồm sản phẩm, phụ
                kiện, quà tặng và chứng từ đi kèm trong tình trạng phù hợp để xác
                minh, trừ hư hỏng xuất phát từ chính lỗi đang khiếu nại. V-Shop
                có thể từ chối yêu cầu thiếu căn cứ, có dấu hiệu lạm dụng, tráo
                đổi hoặc làm hỏng sản phẩm sau khi nhận.
              </p>
              <p>
                Sau khi yêu cầu được chấp thuận, khoản hoàn tiền được trả về
                phương thức thanh toán ban đầu hoặc số dư phù hợp trên hệ thống.
                Thời gian tiền thực tế xuất hiện phụ thuộc ngân hàng, tổ chức
                trung gian thanh toán và phương thức đã sử dụng.
              </p>
            </PolicySection>

            <PolicySection id="warranty" icon={BadgeCheck} title="4. Chính sách bảo hành">
              <ul className="list-disc space-y-2 pl-5">
                <li>Thời hạn, địa điểm và điều kiện bảo hành áp dụng theo thông tin Shop công bố trên trang sản phẩm, phiếu bảo hành hoặc chính sách của nhà sản xuất.</li>
                <li>Shop phải cung cấp thông tin bảo hành rõ ràng, tiếp nhận sản phẩm đủ điều kiện và thông báo kết quả kiểm tra, phương án sửa chữa, đổi mới hoặc xử lý khác cho Người mua.</li>
                <li>Bảo hành có thể không áp dụng với hao mòn tự nhiên, sử dụng sai hướng dẫn, tự ý sửa chữa, rơi vỡ, ngấm nước hoặc mất số sê-ri, trừ khi Shop, nhà sản xuất hoặc pháp luật có quy định khác.</li>
                <li>V-Shop hỗ trợ kết nối và lưu vết trao đổi; nghĩa vụ bảo hành trực tiếp thuộc Shop hoặc đơn vị bảo hành được Shop công bố.</li>
              </ul>
            </PolicySection>

            <PolicySection id="seller-settlement" icon={CircleDollarSign} title="5. Ghi nhận và thanh toán doanh thu cho Shop">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-1 h-5 w-5 shrink-0" />
                  <p className="font-semibold">
                    Sau khi đơn hàng được ghi nhận giao thành công, V-Shop chuyển
                    số tiền Shop được nhận vào Ví Shop trong vòng tối đa 03 ngày
                    theo lịch.
                  </p>
                </div>
              </div>
              <p>
                Số tiền ghi có là giá trị được thanh toán cho hàng hóa sau khi
                khấu trừ khoản giảm giá do Shop chịu, phí dịch vụ sàn, thuế khấu
                trừ hoặc nộp thay và các khoản điều chỉnh hợp lệ được công bố tại
                thời điểm giao dịch. Phí vận chuyển được hạch toán theo cơ chế áp
                dụng cho từng đơn hàng.
              </p>
              <p>
                Thời hạn 03 ngày được tính từ thời điểm hệ thống nhận trạng thái
                giao thành công hợp lệ. V-Shop có thể tạm hoãn ghi có hoặc tạm
                giữ khoản tiền liên quan nếu đơn hàng đang có yêu cầu đổi trả,
                hoàn tiền, khiếu nại, sai lệch đối soát, dấu hiệu gian lận, vi
                phạm chính sách hoặc theo yêu cầu của cơ quan có thẩm quyền.
                Khoản tiền đủ điều kiện sẽ được xử lý sau khi nguyên nhân tạm giữ
                được giải quyết.
              </p>
              <p>
                Tiền trong Ví Shop và việc rút tiền về tài khoản ngân hàng là hai
                bước khác nhau. Yêu cầu rút tiền được xử lý theo thông tin ngân
                hàng Shop đã xác minh, lịch đối soát và trạng thái kiểm soát rủi
                ro tại thời điểm yêu cầu.
              </p>
            </PolicySection>

            <PolicySection id="complaints" icon={PackageCheck} title="6. Khiếu nại và giải quyết tranh chấp">
              <p>
                Người mua và Shop nên gửi khiếu nại qua chức năng báo cáo, trò
                chuyện hỗ trợ hoặc email hotro@vshop.vn, kèm mã đơn hàng và bằng
                chứng liên quan. V-Shop tiếp nhận, phân loại, yêu cầu bổ sung hồ
                sơ khi cần và tạo điều kiện để các bên thương lượng trên nguyên
                tắc thiện chí, khách quan và bảo vệ dữ liệu cá nhân.
              </p>
              <p>
                Nếu không đạt thỏa thuận, các bên có quyền yêu cầu cơ quan quản
                lý nhà nước, tổ chức bảo vệ người tiêu dùng, trọng tài hoặc Tòa
                án có thẩm quyền giải quyết theo pháp luật Việt Nam. Chính sách
                này không hạn chế các quyền bắt buộc của người tiêu dùng.
              </p>
            </PolicySection>

            <section className="card scroll-mt-24 p-5 md:p-7" id="legal-basis">
              <h2 className="text-lg font-bold text-ink md:text-xl">7. Cơ sở tham khảo</h2>
              <p className="mt-3">
                Chính sách được xây dựng có tham khảo Luật Bảo vệ quyền lợi
                người tiêu dùng 2023, Nghị định 55/2024/NĐ-CP, Nghị định
                52/2013/NĐ-CP và Nghị định 85/2021/NĐ-CP. Nội dung có thể được
                cập nhật để phù hợp với pháp luật và hoạt động của V-Shop; thay
                đổi quan trọng sẽ được công bố trước khi áp dụng.
              </p>
              <Link href="/" className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline">
                Quay lại trang chủ
              </Link>
            </section>
          </div>
        </div>
      </div>
    </MainShell>
  );
}

function PolicySection({ id, icon: Icon, title, children }: {
  id: string;
  icon: typeof ShieldCheck;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="card scroll-mt-24 p-5 md:p-7">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-bold text-ink md:text-xl">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
