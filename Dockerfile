FROM rust:1.88-slim AS builder

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo 'fn main() {}' > src/main.rs \
    && cargo build --release \
    && rm -rf src
COPY src ./src
COPY migrations ./migrations
RUN touch src/main.rs && cargo build --release

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 appuser
WORKDIR /app

COPY --from=builder /app/target/release/cert-service /usr/local/bin/cert-service
COPY --from=builder /app/migrations ./migrations

USER appuser
EXPOSE 8080

CMD ["cert-service"]
