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
COPY apps/services/catalog-service ./apps/services/catalog-service
COPY libs ./libs

RUN pnpm install --frozen-lockfile

RUN pnpm nx build catalog-service

FROM node:22-slim AS runner

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.25.0 --activate

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /workspace/dist/apps/services/catalog-service/package.json ./package.json

RUN pnpm install --prod --no-frozen-lockfile \
	&& pnpm add tslib @prisma/client --prod

COPY --from=builder /workspace/dist/apps/services/catalog-service ./dist/apps/services/catalog-service

USER node

CMD ["node", "dist/apps/services/catalog-service/main.js"]
