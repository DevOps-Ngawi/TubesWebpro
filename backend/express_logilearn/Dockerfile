FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy Prisma schema before npm install so postinstall script can find it
COPY prisma ./prisma/

# Install dependencies (this will automatically trigger prisma generate due to postinstall script)
RUN npm install

# Copy the rest of the application code
COPY . .

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy dependencies and built files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Copy application source code
COPY --from=builder /app/src ./src
COPY --from=builder /app/index.js ./

EXPOSE 3000

CMD ["npm", "start"]
