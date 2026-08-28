#!/bin/bash
# Idempotent: ensure supplier service + edge Host block exist on staging EC2.
# Invoked by GitHub Actions deploy (base64 → /tmp/ensure-supplier.sh).
set -euo pipefail
cd /opt/zucci

if ! grep -q 'profiles: \["supplier"\]' docker-compose.yml; then
  python3 - <<'PY'
from pathlib import Path

p = Path("docker-compose.yml")
t = p.read_text()
block = """
  # Supplier SPA (Front-end-supplier) — image set by deploy-supplier / CI
  supplier:
    image: ${SUPPLIER_ECR_IMAGE:-public.ecr.aws/nginx/nginx:alpine}
    profiles: ["supplier"]
    restart: unless-stopped
    expose:
      - "80"
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://127.0.0.1/healthz || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s

"""
needle = "  # Host-based reverse proxy"
services = t.split("services:", 1)[-1].split("volumes:", 1)[0]
if needle in t and "\n  supplier:" not in services:
    p.write_text(t.replace(needle, block + needle, 1))
    print("Inserted supplier service into docker-compose.yml")
else:
    print("Supplier service already present or compose layout unexpected")
PY
fi

# Always refresh admin/supplier server blocks to use Docker DNS variables
# (avoids edge crash when optional SPA containers are not up yet).
python3 - <<'PY'
from pathlib import Path
import re

p = Path("edge/nginx.conf")
t = p.read_text()

desired = """
server {
    listen 80;
    server_name admin.zucci.xyz;

    resolver 127.0.0.11 valid=10s ipv6=off;

    location / {
        set $upstream_admin admin;
        proxy_pass http://$upstream_admin:80;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name supplier.zucci.xyz;

    client_max_body_size 50m;
    resolver 127.0.0.11 valid=10s ipv6=off;

    # Same-origin API proxy — avoids cross-origin PATCH CORS issues in Firefox.
    location /api/ {
        proxy_pass http://api:80;
        proxy_http_version 1.1;
        proxy_set_header Host api.zucci.xyz;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
        proxy_read_timeout 120s;
    }

    location / {
        set $upstream_supplier supplier;
        proxy_pass http://$upstream_supplier:80;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Accept-Encoding "";
        sub_filter_types text/css text/javascript application/javascript;
        sub_filter 'https://api.zucci.xyz/api/v1/' '/api/v1/';
        sub_filter 'https://api.zucci.xyz/api/v1' '/api/v1';
        sub_filter '<div id="app"></div>' '<script>(function(){var a="https://api.zucci.xyz/api/v1",r="/api/v1";function n(u){return typeof u==="string"&&u.indexOf(a)===0?r+u.slice(a.length):u}var o=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){arguments[1]=n(u);return o.apply(this,arguments)};var f=window.fetch;window.fetch=function(i,t){if(typeof i==="string")i=n(i);else if(i&&typeof i.url==="string"&&i.url.indexOf(a)===0)i=new Request(n(i.url),i);return f.call(this,i,t)}})();</script><div id="app"></div>';
        sub_filter_once off;
    }
}
""".strip() + "\n\n"

# Drop existing admin/supplier server blocks (if any), then insert before default_server
t2 = re.sub(
    r"\nserver \{\n    listen 80;\n    server_name (?:admin|supplier)\.zucci\.xyz;.*?\n\}\n",
    "\n",
    t,
    flags=re.S,
)

needle = "# EIP / unknown host"
if needle in t2:
    t2 = t2.replace(needle, desired + needle, 1)
elif "server_name supplier.zucci.xyz" not in t2:
    t2 = t2.rstrip() + "\n\n" + desired

if t2 != t:
    p.write_text(t2)
    print("Updated edge/nginx.conf (admin + supplier with Docker DNS)")
else:
    print("edge/nginx.conf already up to date")
PY
