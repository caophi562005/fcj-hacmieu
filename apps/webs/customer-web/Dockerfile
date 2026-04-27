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
COPY eslint.config.mjs ./
COPY apps/webs/customer-web ./apps/webs/customer-web
COPY libs ./libs
COPY .env.example ./apps/webs/customer-web/.env

RUN pnpm install --frozen-lockfile

RUN pnpm nx build customer-web

FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone output bao gồm server.js + node_modules tối thiểu
COPY --from=builder /workspace/apps/webs/customer-web/.next/standalone ./
# Static assets không nằm trong standalone, phải copy riêng
COPY --from=builder /workspace/apps/webs/customer-web/.next/static ./apps/webs/customer-web/.next/static
COPY --from=builder /workspace/apps/webs/customer-web/public ./apps/webs/customer-web/public

EXPOSE 3000

USER node

CMD ["node", "apps/webs/customer-web/server.js"]
