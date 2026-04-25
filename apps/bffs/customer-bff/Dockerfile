FROM node:22-slim AS builder

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /workspace

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY apps/bffs/customer-bff ./apps/bffs/customer-bff
COPY libs ./libs

RUN pnpm install --frozen-lockfile

RUN pnpm nx build customer-bff

FROM node:22-slim AS runner

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /workspace/dist/apps/bffs/customer-bff/package.json ./package.json

RUN pnpm install --prod --no-frozen-lockfile \
	&& pnpm add tslib --prod

COPY --from=builder /workspace/dist/apps/bffs/customer-bff ./dist/apps/bffs/customer-bff

EXPOSE 3100

USER node

CMD ["node", "dist/apps/bffs/customer-bff/main.js"]