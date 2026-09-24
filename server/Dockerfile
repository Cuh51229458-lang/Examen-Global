FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node src ./src
COPY --chown=node:node scripts/seed.js ./scripts/seed.js
USER node
ENV NODE_ENV=production
EXPOSE 5001
CMD ["node", "src/server.js"]
