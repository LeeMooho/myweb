# Build the upstream tagged source; avoid a dependency on retired binary images.
FROM golang:1.24 AS builder
ENV CGO_ENABLED=0 GOMAXPROCS=2
RUN go install -p=2 github.com/minio/minio@RELEASE.2025-10-15T17-29-55Z \
    && go install -p=2 github.com/minio/mc@RELEASE.2025-08-13T08-35-41Z

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /data && chown 65532:65532 /data
COPY --from=builder /go/bin/minio /go/bin/mc /usr/local/bin/
USER 65532:65532
EXPOSE 9000 9001
ENTRYPOINT ["minio"]
