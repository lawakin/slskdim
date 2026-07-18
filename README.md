# slskdim

slskdim (from slskd **im**proved, like vim) is a fork of [slskd](https://github.com/slskd/slskd) with a reworked, more customizable UI.

This started as a personal project. I plan to keep maintaining it, but some features may be undercooked.

## Install

### Docker

Add slskdim as a service and hand it the web port (`5030`). slskdim serves the UI and talks to slskd, so slskd must stop publishing `5030` itself.

```yaml
services:
  slskdim:
    image: lawakin/slskdim
    ports:
      - "5030:80"
    depends_on:
      - slskd
    restart: always
  slskd:
    image: slskd/slskd
    container_name: slskd
    ports:
      # - "5030:5030"   # slskdim serves this now
      - "5031:5031"
      - "50300:50300"
    environment:
      - PUID=1000
      - PGID=1000
      - SLSKD_REMOTE_CONFIGURATION=true
    volumes:
      - ./data:/app
    restart: always
```

### Manual

Build the UI, then drop the output into wherever slskd serves its web files from (`wwwroot` or whichever)

```
npm install
npm run build
```

Copy the contents of `dist/` into slskd's `wwwroot`.

## Upstream

For the original, well documented and production ready client, use [slskd](https://github.com/slskd/slskd).
