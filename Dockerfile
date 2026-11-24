# Chimera — Docker image for Render (free Web Service).
# Why Docker, not a plain Node host: /api/analyze shells out to Slither
# (Python) + a solc binary. Plain Node hosts (Vercel, plain Render Node)
# have neither, so analysis would fail. This image installs both.
#
# Layout note: analyzer.js looks for solc binaries under $SVM_DIR/<version>/
# solc-<version> (default /home/hatch/.svm on the dev VM). Here SVM_DIR is
# /opt/svm, set via ENV below; analyzer.js reads process.env.SVM_DIR.
#
# Build:  docker build -t chimera .
# Run:    docker run -p 3000:3000 -e LLM_API_KEY=... -e LLM_BASE_URL=... -e LLM_MODEL=... chimera
# No secret is ever baked into this image — the Gemini key comes from the
# host env vars at runtime only.

FROM node:22-slim

# Slither needs Python + pip; curl fetches the static solc binaries.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 python3-pip curl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Pin to the version verified on the dev VM (slither --version = 0.11.6).
RUN pip install --no-cache-dir --break-system-packages slither-analyzer==0.11.6

# Static solc binaries, in the SVM layout analyzer.js expects.
# Versions cover the most common pragma ranges (0.4.x–0.8.30). Add more
# versions to this list if a target contract needs one that is missing —
# the analyzer falls back to the closest compatible installed version.
ENV SVM_DIR=/opt/svm
ENV SLITHER_BIN=/usr/local/bin/slither
RUN mkdir -p /opt/svm \
 && for v in 0.4.26 0.5.16 0.6.12 0.7.6 0.8.4 0.8.10 0.8.15 0.8.17 0.8.19 0.8.20 0.8.21 0.8.22 0.8.24 0.8.26 0.8.28 0.8.30; do \
      mkdir -p /opt/svm/$v \
      && curl -fsSL -o /opt/svm/$v/solc-$v https://github.com/ethereum/solidity/releases/download/v$v/solc-static-linux \
      && chmod +x /opt/svm/$v/solc-$v; \
    done \
 && ln -s /opt/svm/0.8.30/solc-0.8.30 /usr/local/bin/solc

WORKDIR /app

# Zero-dependency Node app — no npm install step needed.
COPY app/ ./

# Render injects $PORT at runtime; server.js reads process.env.PORT (default 3000).
EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "server.js"]
