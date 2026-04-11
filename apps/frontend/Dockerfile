FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy all static files to nginx web root
COPY . /usr/share/nginx/html

# Railway injects $PORT at runtime — the start script handles that
CMD ["/bin/sh", "-c", "sed -i 's/__PORT__/'\"$PORT\"'/g' /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
