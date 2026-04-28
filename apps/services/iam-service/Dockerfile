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
COPY apps/services/iam-service ./apps/services/iam-service
COPY libs ./libs

RUN pnpm install --frozen-lockfile

RUN pnpm nx build iam-service

FROM node:22-slim AS runner

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /workspace/dist/apps/services/iam-service/package.json ./package.json

RUN pnpm install --prod --no-frozen-lockfile \
	&& pnpm add tslib @prisma/client --prod

COPY --from=builder /workspace/dist/apps/services/iam-service ./dist/apps/services/iam-service

USER node

CMD ["node", "dist/apps/services/iam-service/main.js"]
