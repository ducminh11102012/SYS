FROM mn9206986/workspace

WORKDIR /app

RUN apt-get update && apt-get install -y curl && \
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && \
    chmod +x /usr/local/bin/cloudflared

CMD bash -c "\
./start.sh 2>&1 | tee /app/start.log & \
cloudflared tunnel --url http://localhost:7860 | tee /app/tunnel.log & \
tail -f /app/start.log /app/tunnel.log"
