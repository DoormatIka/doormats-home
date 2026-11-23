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
CMD ["./server"]
