FROM node:22-slim AS builder

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.25.0 --activate

WORKDIR /workspace

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY apps/bffs/admin-bff ./apps/bffs/admin-bff
COPY libs ./libs

RUN pnpm install --frozen-lockfile

RUN pnpm nx build admin-bff

FROM node:22-slim AS runner

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.25.0 --activate

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /workspace/dist/apps/bffs/admin-bff/package.json ./package.json

RUN pnpm install --prod --no-frozen-lockfile \
	&& pnpm add tslib --prod

COPY --from=builder /workspace/dist/apps/bffs/admin-bff ./dist/apps/bffs/admin-bff

EXPOSE 3100

USER node

CMD ["node", "dist/apps/bffs/admin-bff/main.js"]