# Kế hoạch thực hiện: Refactor Web Shared Libraries

## Phase 1: `libs/web-theme` — Tailwind Presets + CSS

- [ ] 1.1 Tạo file `libs/web-theme/src/presets/base.js`
  - Extract phần chung từ 3 file `tailwind.config.js`: fontFamily, primary colors (10 shades), borderRadius, boxShadow (card, floating), transitionDuration
  - Export dưới dạng Tailwind preset (`module.exports = { theme: { extend: { ... } } }`)
  - Không include `content` — mỗi app tự define content paths

- [ ] 1.2 Tạo file `libs/web-theme/src/presets/dashboard.js`
  - `presets: [require('./base')]`
  - Thêm: colors (sidebar, background, surface, ink, success, warning, danger), spacing (sidebar: 260px, topbar: 64px)
  - Đây là preset cho `admin-web` và `seller-web`

- [ ] 1.3 Tạo file `libs/web-theme/src/presets/storefront.js`
  - `presets: [require('./base')]`
  - Thêm: colors (accent, surface, ink, success, warning, danger, border), maxWidth (container: 1200px), fontSize (price-lg, price-md)
  - Đây là preset cho `customer-web`

- [ ] 1.4 Tạo file `libs/web-theme/src/css/base.css`
  - Extract `@layer base` chung: `:root { color-scheme: light }`, html font-family, body reset, heading, link, button, box-sizing
  - KHÔNG include `@tailwind base/components/utilities` — mỗi app tự import
  - KHÔNG include Google Fonts `@import` — mỗi app tự import (vì URL có thể khác weight)

- [ ] 1.5 Tạo file `libs/web-theme/src/css/components.css`
  - Extract `@layer components` chung: `.btn`, `.btn-primary`, `.btn-outline`, `.btn-ghost`, `.btn-md`, `.btn-sm`, `.btn-lg`, `.card`, `.input`, `.chip`, `.scrollbar-none`
  - Dùng token colors (không hardcode `border-slate-200` — dùng `border-border` hoặc CSS variable)

- [ ] 1.6 Tạo file `libs/web-theme/src/css/dashboard.css`
  - Extract `@layer components` riêng cho dashboard: `.label-field`
  - Chỉ dùng ở admin-web và seller-web

- [ ] 1.7 Tạo file `libs/web-theme/src/css/storefront.css`
  - Extract `@layer components` riêng cho customer: `.container-page`, `.btn-secondary`, `.chip-primary`, `.chip-flash`, `.product-img`, `.nav-link`

- [ ] 1.8 Cập nhật `apps/webs/seller-web/tailwind.config.js`
  - Thay toàn bộ `theme.extend` bằng `presets: [require('../../../libs/web-theme/src/presets/dashboard')]`
  - Cập nhật `content` paths: thêm `'../../../libs/web-ui/src/**/*.{ts,tsx,js,jsx}'`
  - Giữ `'../../../libs/convex/src/**/*.{ts,tsx,js,jsx}'`

- [ ] 1.9 Cập nhật `apps/webs/admin-web/tailwind.config.js`
  - Giống seller-web (cùng dùng dashboard preset)

- [ ] 1.10 Cập nhật `apps/webs/customer-web/tailwind.config.js`
  - `presets: [require('../../../libs/web-theme/src/presets/storefront')]`
  - Cập nhật `content` paths

- [ ] 1.11 Cập nhật `global.css` của seller-web
  - Giữ `@import url(...)` cho Google Fonts
  - Giữ `@tailwind base; @tailwind components; @tailwind utilities;`
  - Thay nội dung `@layer base` và `@layer components` bằng `@import` từ `libs/web-theme/src/css/base.css`, `components.css`, `dashboard.css`
  - Hoặc: inline import bằng PostCSS `@import` (cần kiểm tra Next.js hỗ trợ)
  - **Fallback**: nếu `@import` relative path không work với Next.js Turbopack, copy nội dung CSS vào file nhưng thêm comment `/* SOURCE: libs/web-theme/src/css/... */` — sẽ refactor lại khi Turbopack hỗ trợ

- [ ] 1.12 Cập nhật `global.css` của admin-web (giống seller-web)

- [ ] 1.13 Cập nhật `global.css` của customer-web
  - Import `base.css`, `components.css`, `storefront.css`

- [ ] 1.14 Xoá code trùng lặp trong `tailwind.config.js` gốc (chỉ giữ `presets` + `content` + `plugins`)

- [ ] 1.15 Build verification
  - `pnpm nx build customer-web` ✓
  - `pnpm nx build seller-web` ✓
  - `pnpm nx build admin-web` ✓
  - Visual check: UI không thay đổi

---

## Phase 2: `libs/web-ui` — Shared React Components (đơn giản)

- [ ] 2.1 Xoá scaffold files mặc định
  - Xoá `libs/web-ui/src/lib/hello-server.tsx`, `libs/web-ui/src/lib/web-ui.tsx`
  - Xoá `libs/web-ui/src/server.ts` (sẽ tạo lại nếu cần)

- [ ] 2.2 Tạo `libs/web-ui/src/lib/Pagination.tsx`
  - Copy từ `customer-web/src/components/Pagination.tsx`
  - Thay `border-border bg-surface` (customer) thành class tương thích cả 3 app: dùng `border-border bg-white` (border token có ở cả 3 preset, bg-white universal)
  - Hoặc dùng `border-[--border] bg-white` — nhưng đơn giản nhất là `border-slate-200 bg-white` vì cả 3 app đều có slate

- [ ] 2.3 Tạo `libs/web-ui/src/lib/ToastProvider.tsx`
  - Copy nguyên từ bất kỳ app nào (100% giống nhau)
  - Directive: `'use client'`

- [ ] 2.4 Tạo `libs/web-ui/src/lib/ConvexProvider.tsx`
  - Hợp nhất: 1 component `AppConvexProvider` nhận `children`
  - Đọc `process.env.NEXT_PUBLIC_CONVEX_URL` — nếu không có thì render children trực tiếp
  - Directive: `'use client'`

- [ ] 2.5 Tạo `libs/web-ui/src/lib/CopyButton.tsx`
  - Copy nguyên từ admin-web hoặc seller-web (100% giống)
  - Directive: `'use client'`

- [ ] 2.6 Cập nhật `libs/web-ui/src/index.ts`
  - Export: `Pagination`, `ToastProvider`, `AppConvexProvider`, `CopyButton`

- [ ] 2.7 Cập nhật `customer-web`
  - Xoá `src/components/Pagination.tsx`, `src/components/ToastProvider.tsx`, `src/components/ConvexProvider.tsx`
  - Thay import: `import { Pagination } from '@common/web-ui/index'` (hoặc `from '@common/web-ui/lib/Pagination'`)
  - Thay `CustomerConvexProvider` → `AppConvexProvider` trong `layout.tsx`
  - Thay `ToastProvider` import

- [ ] 2.8 Cập nhật `seller-web`
  - Xoá `src/components/Pagination.tsx`, `src/components/ToastProvider.tsx`, `src/components/ConvexProvider.tsx`, `src/components/CopyButton.tsx`
  - Thay imports tương ứng
  - Thay `SellerConvexProvider` → `AppConvexProvider`

- [ ] 2.9 Cập nhật `admin-web`
  - Xoá `src/components/Pagination.tsx`, `src/components/ToastProvider.tsx`, `src/components/ConvexProvider.tsx`, `src/components/CopyButton.tsx`
  - Thay imports tương ứng
  - Thay `SellerConvexProvider` → `AppConvexProvider`

- [ ] 2.10 Build verification
  - `pnpm nx build customer-web` ✓
  - `pnpm nx build seller-web` ✓
  - `pnpm nx build admin-web` ✓

---

## Phase 3: `libs/web-core` — Server-side Logic

- [ ] 3.1 Xoá scaffold files mặc định
  - Xoá `libs/web-core/src/lib/hello-server.tsx`, `libs/web-core/src/lib/web-core.tsx`

- [ ] 3.2 Tạo `libs/web-core/src/lib/constants.ts`
  - Export: `ACCESS_TOKEN_COOKIE = 'access_token'`, `ID_TOKEN_COOKIE = 'id_token'`, `REFRESH_TOKEN_COOKIE = 'refresh_token'`

- [ ] 3.3 Tạo `libs/web-core/src/lib/api-factory.ts`
  - Implement `createApiFactory(config)` trả về `{ createServerApi, createApi }`
  - Config: `{ baseUrl: string, logPrefix?: string, onUnauthorized?: 'redirect' | 'ignore' }`
  - `createServerApi`: đọc cookies, tạo axios instance, attach 401 interceptor (redirect nếu config yêu cầu)
  - `createApi`: tạo axios instance với baseUrl + auth headers + error logging

- [ ] 3.4 Tạo `libs/web-core/src/lib/oidc-factory.ts`
  - Implement `createOidcClientFactory(config)` trả về `getOidcClient()`
  - Config: `{ region, userPoolId, clientId, clientSecret, redirectUri }`
  - Cache client vào module scope

- [ ] 3.5 Tạo `libs/web-core/src/lib/iam.ts`
  - `getCurrentUser(api: AxiosInstance): Promise<UserResponse | null>`
  - `changePassword(api: AxiosInstance, payload): Promise<void>`
  - `logout(api: AxiosInstance): Promise<void>`
  - Nhận `api` instance — không tự tạo (separation of concerns)

- [ ] 3.6 Tạo `libs/web-core/src/lib/auth-helpers.ts`
  - `isAuthed()`: đọc cookies, return boolean
  - `withCacheBust(url, version)`: append `?v=timestamp`
  - `decodeJwtPayload(token)`: decode base64 JWT payload

- [ ] 3.7 Cập nhật `libs/web-core/src/index.ts` và `libs/web-core/src/server.ts`
  - `index.ts`: export constants, auth-helpers (client-safe)
  - `server.ts`: export api-factory, oidc-factory, iam (server-only — dùng `cookies()`)

- [ ] 3.8 Cập nhật `seller-web/src/lib/api.ts`
  - Thay toàn bộ nội dung bằng:
    ```typescript
    import { createApiFactory } from '@common/web-core/lib/api-factory';
    import { SellerWebConfig } from './config';
    export const { createServerApi, createApi } = createApiFactory({
      baseUrl: SellerWebConfig.bffUrl(),
      logPrefix: '[Seller BFF]',
      onUnauthorized: 'redirect',
    });
    export { ACCESS_TOKEN_COOKIE, ID_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@common/web-core/lib/constants';
    ```

- [ ] 3.9 Cập nhật `admin-web/src/lib/api.ts` (tương tự seller, dùng `AdminWebConfig`)

- [ ] 3.10 Cập nhật `customer-web/src/lib/api.ts`
  - Dùng `createApiFactory` với `onUnauthorized: 'ignore'` (customer-web không auto-redirect)
  - Giữ `AppConfiguration.CUSTOMER_BFF_URL` làm baseUrl

- [ ] 3.11 Cập nhật `seller-web/src/lib/oidc.ts`
  - Thay bằng:
    ```typescript
    import { createOidcClientFactory } from '@common/web-core/lib/oidc-factory';
    import { AuthConfiguration } from '@common/configurations/auth.config';
    import { BaseConfiguration } from '@common/configurations/base.config';
    export const getOidcClient = createOidcClientFactory({
      region: BaseConfiguration.AWS_REGION,
      userPoolId: AuthConfiguration.USER_POOL_ID,
      clientId: AuthConfiguration.SELLER_CLIENT_ID,
      clientSecret: AuthConfiguration.SELLER_CLIENT_SECRET,
      redirectUri: AuthConfiguration.SELLER_REDIRECT_URI,
    });
    ```

- [ ] 3.12 Cập nhật `admin-web/src/lib/oidc.ts` (tương tự, dùng ADMIN config keys)

- [ ] 3.13 Cập nhật `customer-web/src/lib/oidc.ts` (dùng CUSTOMER config keys)

- [ ] 3.14 Cập nhật `seller-web/src/lib/iam.ts` và `admin-web/src/lib/iam.ts`
  - Import `getCurrentUser`, `changePassword`, `logout` từ `@common/web-core/lib/iam`
  - Wrap với local `createServerApi()` call

- [ ] 3.15 Build verification
  - `pnpm nx build customer-web` ✓
  - `pnpm nx build seller-web` ✓
  - `pnpm nx build admin-web` ✓

---

## Phase 4: `libs/web-ui` — Complex Components (UserMenu, Sidebar, Topbar)

- [ ] 4.1 Tạo `libs/web-ui/src/lib/UserMenu.tsx`
  - Extract từ seller-web (hoặc admin-web — giống nhau)
  - Props: `{ user: { name, email, avatar }, logoutAction: () => Promise<void>, changePasswordAction: (state, formData) => Promise<State> }`
  - Bao gồm `ChangePasswordModal` và `PasswordField` sub-components
  - Directive: `'use client'`

- [ ] 4.2 Tạo `libs/web-ui/src/lib/DashboardSidebar.tsx`
  - Props: `{ items: NavItem[], title: string, subtitle: string, footerText?: string }`
  - `NavItem = { href: string, label: string, icon: LucideIcon, match?: (pathname: string) => boolean }`
  - Directive: `'use client'` (dùng `usePathname`)

- [ ] 4.3 Tạo `libs/web-ui/src/lib/DashboardTopbar.tsx`
  - Props: `{ leftSlot?: ReactNode, rightSlot?: ReactNode }`
  - Shell component — mỗi app truyền nội dung riêng (search, notifications, user menu)

- [ ] 4.4 Cập nhật `libs/web-ui/src/index.ts`
  - Thêm export: `UserMenu`, `DashboardSidebar`, `DashboardTopbar`

- [ ] 4.5 Cập nhật `seller-web`
  - `SellerSidebar.tsx`: import `DashboardSidebar` từ `@common/web-ui`, truyền `ITEMS` array
  - `SellerTopbar.tsx`: import `DashboardTopbar` từ `@common/web-ui`, truyền slots
  - `UserMenu.tsx`: xoá file, import từ `@common/web-ui`
  - Cập nhật `logoutAction` và `changePasswordAction` imports trong component wrapper

- [ ] 4.6 Cập nhật `admin-web` (tương tự seller-web)

- [ ] 4.7 Build verification
  - `pnpm nx build seller-web` ✓
  - `pnpm nx build admin-web` ✓
  - `pnpm nx build customer-web` ✓ (không bị ảnh hưởng)

---

## Phase 5: Dọn dẹp + Verification

- [ ] 5.1 Xoá tất cả file đã được extract mà không còn import
  - Grep toàn bộ repo cho các file đã move
  - Xác nhận không còn import path cũ

- [ ] 5.2 Xoá scaffold files còn sót
  - `libs/web-theme/src/lib/hello-server.tsx`, `web-theme.tsx`
  - `libs/web-theme/src/server.ts` (nếu không dùng)

- [ ] 5.3 Cập nhật Nx dependency graph
  - Chạy `pnpm nx graph` — verify 3 web apps depend on `web-core`, `web-ui`, `web-theme`
  - Verify không có circular dependency

- [ ] 5.4 Full build
  - `pnpm nx run-many -t build --projects=customer-web,seller-web,admin-web`
  - Tất cả phải pass

- [ ] 5.5 Đếm dòng code giảm
  - So sánh tổng LOC trước và sau refactor
  - Target: giảm ≥ 2.000 dòng trùng lặp

---

## Ghi chú kỹ thuật

### Import paths

- Dùng `@common/web-core/lib/api-factory` (deep import) thay vì barrel `@common/web-core/index`
- Lý do: tree-shaking tốt hơn, tránh import server code vào client bundle

### CSS import trong Next.js Turbopack

- Turbopack KHÔNG hỗ trợ `@import` relative path ngoài project root
- Workaround: dùng `postcss-import` plugin HOẶC copy CSS content + comment source
- Kiểm tra bằng `pnpm nx build` — nếu fail thì dùng workaround

### `'use client'` boundary

- Tất cả component trong `libs/web-ui` dùng hooks/state PHẢI có `'use client'` ở đầu file
- Server components (nếu có) export qua `libs/web-ui/src/server.ts`

### Tailwind content scanning

- Khi component nằm trong `libs/web-ui`, Tailwind ở mỗi app PHẢI scan path đó
- Nếu thiếu → class bị purge → UI vỡ
- Verify bằng: build app → inspect CSS output → confirm class tồn tại
