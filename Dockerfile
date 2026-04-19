# Use the official Nginx image as the base (1.19+ supports templates)
FROM nginx:alpine

# Cloud Run requires the container to listen on $PORT. 
# The official Nginx image uses envsubst to replace variables in any .template file 
# found in /etc/nginx/templates/ and outputs the result to /etc/nginx/conf.d/
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy the static files to the nginx html directory
COPY . /usr/share/nginx/html

# The default Nginx entrypoint will automatically handle the envsubst step.
# No custom CMD is needed, making the startup process more robust.
