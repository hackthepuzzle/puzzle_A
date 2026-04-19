# STAGE 1: Build & Integrity Check
# Use a slim image for minimum attack surface and maximum overhead reduction
FROM node:alpine AS builder

WORKDIR /usr/src/app

# Copy dependency files first to leverage Docker layer caching
COPY package.json ./
# (If we had npm dependencies, we would run 'npm install' here)

# Copy source code and test suite
COPY . .

# Run the automated functional testing suite
# Ensuring code integrity before the final image is minted
RUN node test.js

# STAGE 2: Production Runtime
# Use a fresh, clean alpine image to keep the footprint under 100MB
FROM node:alpine

WORKDIR /usr/src/app

# Only copy the essential runtime files (ignoring tests, dockerfiles, etc.)
COPY --from=builder /usr/src/app/index.html .
COPY --from=builder /usr/src/app/server.js .
COPY --from=builder /usr/src/app/js ./js
COPY --from=builder /usr/src/app/css ./css
COPY --from=builder /usr/src/app/package.json .

# Cloud Run dynamic port binding
ENV PORT=8080
EXPOSE 8080

# Production start-up
CMD [ "node", "server.js" ]
