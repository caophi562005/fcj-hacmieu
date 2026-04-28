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
COPY apps/services/order-service ./apps/services/order-service
COPY libs ./libs

RUN pnpm install --frozen-lockfile

RUN pnpm nx build order-service

FROM node:22-slim AS runner

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /workspace/dist/apps/services/order-service/package.json ./package.json

RUN pnpm install --prod --no-frozen-lockfile \
	&& pnpm add tslib --prod

COPY --from=builder /workspace/node_modules/prisma ./node_modules/prisma
COPY --from=builder /workspace/node_modules/@prisma ./node_modules/@prisma

COPY --from=builder /workspace/dist/apps/services/order-service ./dist/apps/services/order-service

USER node

CMD ["node", "dist/apps/services/order-service/main.js"]
