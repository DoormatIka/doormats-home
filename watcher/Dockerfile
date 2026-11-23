FROM golang:1.26-alpine AS build
ENV GOWORK=off
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /watcher .

FROM alpine:3.20
RUN apk add --no-cache git git-lfs docker-cli docker-cli-compose ca-certificates
WORKDIR /app
COPY --from=build /watcher .
COPY config.json .
CMD ["./watcher"]
