# doormat's home

my [home website](https://home.yuyuqk.com)! make yourself at home.

experiencing making a website with no frameworks.

### todos:

- hovering over one of the sidebar links would show an image

## stuff

dev running:

```
docker compose -f docker-compose.dev.yml down --remove-orphans
docker compose -f docker-compose.dev.yml build server
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml exec server yt-dlp --version
```

prod running:

```
docker compose -f docker-compose.yml up -d
docker compose -f docker-compose.yml down
```
