# Thiết kế: Refactor Web Applications — Shared Libraries

## Tổng quan

Tách code trùng lặp từ 3 web apps (`customer-web`, `seller-web`, `admin-web`) vào 3 shared libraries mới:

- **`libs/web-theme`** — Tailwind presets + shared CSS
- **`libs/web-ui`** — React components dùng chung
- **`libs/web-core`** — Logic server-side (API factory, auth, OIDC, IAM)

Path aliases đã được cấu hình trong `tsconfig.base.json`:

```
@common/web-core/* → libs/web-core/src/*
@common/web-ui/*   → libs/web-ui/src/*
@common/web-theme/* → libs/web-theme/src/*
```

## Nguyên tắc thiết kế

1. **Không breaking change** — mỗi phase hoàn thành phải build được cả 3 app
2. **Parameterize, không hardcode** — factory pattern cho API, OIDC; props cho UI components
3. **Giữ nguyên UX** — không thay đổi giao diện, chỉ refactor internal
4. **Tailwind content paths** — mỗi app phải scan `libs/web-ui/src/**` và `libs/web-theme/src/**` trong `tailwind.config.js`
5. **Server vs Client boundary** — file có `'use client'` directive phải nằm riêng, export qua `index.ts` (client) và `server.ts` (server-only)

---

## Phase 1: `libs/web-theme` — Tailwind Presets + CSS

### Mục tiêu

Tạo Tailwind preset dùng chung, giảm trùng lặp `tailwind.config.js` và `global.css`.

### Cấu trúc file

```
libs/web-theme/src/
├── presets/
│   ├── base.js              # Font, border-radius, shadows, transitions — dùng chung 3 app
│   ├── dashboard.js         # Extends base: sidebar/topbar colors, spacing — admin + seller
│   └── storefront.js        # Extends base: accent, container-page, chip variants — customer
├── css/
│   ├── base.css             # @layer base: html/body reset, heading, link, button, box-sizing
│   ├── components.css       # @layer components: btn, card, input, chip, scrollbar-none
│   ├── dashboard.css        # @layer components bổ sung cho dashboard (label-field)
│   └── storefront.css       # @layer components bổ sung cho customer (container-page, chip-flash, product-img)
└── index.ts                 # Re-export paths cho TypeScript (nếu cần)
```

### Chi tiết preset

**`base.js`** (dùng chung cả 3):

```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: { sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'] },
      colors: {
        primary: { DEFAULT: '#FF6B35', 50: '...', ..., 900: '...' },
      },
      borderRadius: { sm: '0.25rem', DEFAULT: '0.5rem', md: '0.75rem', lg: '1rem' },
      boxShadow: { card: '...', floating: '...' },
      transitionDuration: { DEFAULT: '200ms' },
    },
  },
};
```

**`dashboard.js`** (admin + seller):

```javascript
const base = require('./base');
module.exports = {
  presets: [base],
  theme: {
    extend: {
      colors: {
        sidebar: { DEFAULT: '#0F172A', hover: '#1E293B', border: '#1E293B' },
        background: '#F8FAFC',
        surface: { DEFAULT: '#FFFFFF', alt: '#F8FAFC', muted: '#F1F5F9' },
        ink: { DEFAULT: '#0B1C30', muted: '#475569', subtle: '#94A3B8' },
        success: '#2E7D32',
        warning: '#E65100',
        danger: '#BA1A1A',
      },
      spacing: { sidebar: '260px', topbar: '64px' },
    },
  },
};
```

**`storefront.js`** (customer):

```javascript
const base = require('./base');
module.exports = {
  presets: [base],
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: '#E8F4FD', foreground: '#0B6FB8' },
        surface: { DEFAULT: '#FFFFFF', alt: '#FAFAFA', muted: '#F5F5F5' },
        ink: { DEFAULT: '#212121', muted: '#616161', subtle: '#9E9E9E' },
        success: '#2ECC71',
        warning: '#F5A623',
        danger: '#EF4444',
        border: { DEFAULT: '#E0E0E0', subtle: '#F0F0F0' },
      },
      maxWidth: { container: '1200px' },
      fontSize: {
        'price-lg': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '700' }],
        'price-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '700' }],
      },
    },
  },
};
```

### Cách dùng ở mỗi app

```javascript
// apps/webs/seller-web/tailwind.config.js
const dashboardPreset = require('../../../libs/web-theme/src/presets/dashboard');
module.exports = {
  presets: [dashboardPreset],
  content: ['./{src}/**/*.{ts,tsx,js,jsx}', '../../../libs/web-ui/src/**/*.{ts,tsx,js,jsx}', '../../../libs/convex/src/**/*.{ts,tsx,js,jsx}'],
  plugins: [],
};
```

```css
/* apps/webs/seller-web/src/app/global.css */
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;900&display=swap');
@import '../../../../libs/web-theme/src/css/base.css';
@import '../../../../libs/web-theme/src/css/components.css';
@import '../../../../libs/web-theme/src/css/dashboard.css';
```

---

## Phase 2: `libs/web-ui` — Shared React Components

### Mục tiêu

Extract các component 100% trùng lặp hoặc chỉ khác config.

### Cấu trúc file

```
libs/web-ui/src/
├── index.ts                    # Re-export client components
├── server.ts                   # Re-export server components (nếu có)
└── lib/
    ├── Pagination.tsx          # Props: page, totalPages, buildHref, ariaLabel
    ├── ToastProvider.tsx       # Không props — wrapper react-toastify
    ├── ConvexProvider.tsx      # Props: children (đọc NEXT_PUBLIC_CONVEX_URL từ env)
    ├── CopyButton.tsx          # Props: value, label?, className?
    ├── UserMenu.tsx            # Props: user, logoutAction, changePasswordAction
    ├── DashboardSidebar.tsx    # Props: items[], title, subtitle, footerText?
    └── DashboardTopbar.tsx     # Props: user, logoutAction, changePasswordAction, searchSlot?, actionsSlot?
```

### Chi tiết component interfaces

**Pagination** (giữ nguyên logic, chuẩn hóa CSS dùng token):

```typescript
// Không thay đổi props interface — chỉ đổi hardcoded `border-slate-200` thành `border-border`
// Yêu cầu: app phải define `border` color trong tailwind config (đã có ở cả 3 preset)
```

**ConvexProvider** (hợp nhất 3 file):

```typescript
'use client';
export function AppConvexProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return <>{children}</>;
  return <ConvexClientProvider convexUrl={url}>{children}</ConvexClientProvider>;
}
```

**DashboardSidebar** (data-driven):

```typescript
'use client';
type NavItem = { href: string; label: string; icon: LucideIcon; match?: (p: string) => boolean };
type Props = {
  items: NavItem[];
  title: string;
  subtitle: string;
  footerText?: string;
};
export function DashboardSidebar({ items, title, subtitle, footerText }: Props) { ... }
```

**UserMenu** (nhận actions qua props để tránh import path cụ thể):

```typescript
'use client';
type Props = {
  user: { name: string; email: string; avatar: string };
  logoutAction: () => Promise<void>;
  changePasswordAction: (prev: State, formData: FormData) => Promise<State>;
};
```

---

## Phase 3: `libs/web-core` — Server-side Logic

### Mục tiêu

Tạo factory functions cho API client, OIDC client, và IAM service — parameterize bằng config.

### Cấu trúc file

```
libs/web-core/src/
├── index.ts                    # Re-export tất cả
├── server.ts                   # Re-export server-only functions
└── lib/
    ├── api-factory.ts          # createApiFactory({ baseUrl, logPrefix }) → { createServerApi, createApi }
    ├── oidc-factory.ts         # createOidcClientFactory({ clientId, clientSecret, redirectUri }) → getOidcClient()
    ├── iam.ts                  # getCurrentUser(api), changePassword(api, payload), logout(api)
    ├── auth-helpers.ts         # isAuthed(), withCacheBust(), decodeJwtPayload()
    └── constants.ts            # ACCESS_TOKEN_COOKIE, ID_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE
```

### Chi tiết API Factory

```typescript
// libs/web-core/src/lib/api-factory.ts
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { cookies } from 'next/headers';

export type ApiFactoryConfig = {
  baseUrl: string;
  logPrefix?: string;
  onUnauthorized?: 'redirect' | 'ignore';
};

export function createApiFactory(config: ApiFactoryConfig) {
  const { baseUrl, logPrefix = '[BFF]', onUnauthorized = 'redirect' } = config;

  async function createServerApi(): Promise<AxiosInstance> {
    const c = await cookies();
    const accessToken = c.get('access_token')?.value ?? null;
    const idToken = c.get('id_token')?.value ?? null;
    const instance = createApi({ accessToken, idToken });

    if (onUnauthorized === 'redirect') {
      instance.interceptors.response.use(
        (res) => res,
        async (err) => {
          if (err?.response?.status === 401) {
            const { redirect } = await import('next/navigation');
            redirect('/login');
          }
          return Promise.reject(err);
        },
      );
    }

    return instance;
  }

  function createApi(options: { accessToken?: string | null; idToken?: string | null } = {}): AxiosInstance {
    const { accessToken, idToken } = options;
    const cfg: AxiosRequestConfig = {
      baseURL: baseUrl,
      timeout: 10_000,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    };
    if (accessToken) cfg.headers!.Authorization = `Bearer ${accessToken}`;
    if (idToken) cfg.headers!['x-id-token'] = idToken;

    const instance = axios.create(cfg);
    instance.interceptors.response.use(
      (res) => res,
      (err) => {
        const status = err?.response?.status;
        const method = err?.config?.method?.toUpperCase();
        const url = err?.config?.url;
        const data = err?.response?.data;
        console.error(`${logPrefix} ${method ?? '?'} ${url} → ${status ?? 'ERR'}`, data ?? err.message);
        return Promise.reject(err);
      },
    );
    return instance;
  }

  return { createServerApi, createApi };
}
```

### Chi tiết OIDC Factory

```typescript
// libs/web-core/src/lib/oidc-factory.ts
import { Issuer, type Client } from 'openid-client';

export type OidcConfig = {
  region: string;
  userPoolId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export function createOidcClientFactory(config: OidcConfig) {
  let cachedClient: Client | null = null;

  return async function getOidcClient(): Promise<Client> {
    if (cachedClient) return cachedClient;
    const issuerUrl = `https://cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}`;
    const issuer = await Issuer.discover(issuerUrl);
    cachedClient = new issuer.Client({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uris: [config.redirectUri],
      response_types: ['code'],
    });
    return cachedClient;
  };
}
```

### Chi tiết IAM (nhận api instance, không tự tạo)

```typescript
// libs/web-core/src/lib/iam.ts
import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type { ChangePasswordRequest, UserResponse } from '@common/interfaces/models/iam';
import type { AxiosInstance } from 'axios';

export async function getCurrentUser(api: AxiosInstance): Promise<UserResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<UserResponse>>('/iam/user');
    return data?.data ?? null;
  } catch {
    return null;
  }
}

export async function changePassword(api: AxiosInstance, payload: Omit<ChangePasswordRequest, 'accessToken'>): Promise<void> {
  await api.post('/iam/auth/change-password', payload);
}

export async function logout(api: AxiosInstance): Promise<void> {
  await api.post('/iam/auth/logout');
}
```

### Cách dùng ở mỗi app

```typescript
// apps/webs/seller-web/src/lib/api.ts
import { createApiFactory } from '@common/web-core/lib/api-factory';
import { SellerWebConfig } from './config';

export const { createServerApi, createApi } = createApiFactory({
  baseUrl: SellerWebConfig.bffUrl(),
  logPrefix: '[Seller BFF]',
  onUnauthorized: 'redirect',
});
```

```typescript
// apps/webs/seller-web/src/lib/oidc.ts
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

```typescript
// apps/webs/seller-web/src/lib/iam.ts
import { getCurrentUser as _getCurrentUser, changePassword as _changePassword, logout as _logout } from '@common/web-core/lib/iam';
import { createServerApi } from './api';

export async function getCurrentUser() {
  const api = await createServerApi();
  return _getCurrentUser(api);
}
export async function changePassword(payload) {
  const api = await createServerApi();
  return _changePassword(api, payload);
}
export async function logout() {
  const api = await createServerApi();
  return _logout(api);
}
```

---

## Quy tắc Tailwind content paths

Sau refactor, mỗi app cần scan:

```javascript
content: [
  './{src}/**/*.{ts,tsx,js,jsx}',
  '../../../libs/web-ui/src/**/*.{ts,tsx,js,jsx}',
  '../../../libs/web-theme/src/**/*.{ts,tsx,js,jsx}',
  '../../../libs/convex/src/**/*.{ts,tsx,js,jsx}',
],
```

---

## Kiểm tra sau mỗi phase

1. `pnpm nx build customer-web` ✓
2. `pnpm nx build seller-web` ✓
3. `pnpm nx build admin-web` ✓
4. Grep: không còn code trùng lặp cho module đã extract
5. UI không thay đổi (visual regression — manual check)
