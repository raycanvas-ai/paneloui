# Panelo as one Node server (Next.js standalone), built on the server from the public repo plus the
# private Pro checkout in components/panelo/pro. See deploy/README.md.

FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# The deploy's id for Next's version-skew handling (next.config.ts); compose passes the git commit.
ARG NEXT_DEPLOYMENT_ID
ENV NEXT_DEPLOYMENT_ID=$NEXT_DEPLOYMENT_ID
# The registry first: free items into public/r (served as files), Pro into registry-pro (private).
RUN node --experimental-strip-types --no-warnings scripts/build-registry.mts && npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# Read at request time by app/r/pro, only for a valid licence key. Never under public/.
COPY --from=build --chown=node:node /app/registry-pro ./registry-pro
USER node
EXPOSE 3000
CMD ["node", "server.js"]
