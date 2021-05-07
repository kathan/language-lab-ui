FROM nginx:1.16-alpine

COPY build/             /www/data/
COPY nginx/nginx.conf   /etc/nginx/nginx.conf

RUN addgroup -g 1001 appuser && \
  adduser -D -u 1001 -G appuser appuser

RUN touch /var/run/nginx.pid && \
  chown -R appuser:appuser  /var/run/ && \
  chown -R appuser:appuser /var/cache/nginx

USER appuser