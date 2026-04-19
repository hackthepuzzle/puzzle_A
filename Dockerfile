# Use the official Nginx image as the base
FROM nginx:alpine

# Copy the static files to the nginx html directory
COPY . /usr/share/nginx/html

# Expose the default port (though Cloud Run will use $PORT)
EXPOSE 8080

# Configure Nginx to listen on the port provided by Cloud Run
# We use a simple script to replace the port in the default config
CMD ["sh", "-c", "sed -i 's/listen  80;/listen '\"$PORT\"';/' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
