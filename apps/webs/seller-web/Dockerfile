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
COPY eslint.config.mjs ./
COPY apps/webs/seller-web ./apps/webs/seller-web
COPY libs ./libs
COPY .env.example ./apps/webs/seller-web/.env

RUN pnpm install --frozen-lockfile

RUN pnpm nx build seller-web

FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4001
ENV HOSTNAME=0.0.0.0

# Standalone output bao gồm server.js + node_modules tối thiểu
COPY --from=builder /workspace/apps/webs/seller-web/.next/standalone ./
# Static assets không nằm trong standalone, phải copy riêng
COPY --from=builder /workspace/apps/webs/seller-web/.next/static ./apps/webs/seller-web/.next/static
COPY --from=builder /workspace/apps/webs/seller-web/public ./apps/webs/seller-web/public

EXPOSE 4001

USER node

CMD ["node", "apps/webs/seller-web/server.js"]
