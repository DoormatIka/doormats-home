FROM golang:1.26-alpine AS build
ENV GOWORK=off
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /server .

FROM alpine:3.20
WORKDIR /app
COPY --from=build /server .

RUN apk add --no-cache ffmpeg ca-certificates
RUN wget -O /usr/local/bin/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_musllinux \
    && chmod 755 /usr/local/bin/yt-dlp \
    && yt-dlp --version

CMD ["./server"]
