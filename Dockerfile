# Use Node.js Alpine as the base for a lightweight, reliable server
FROM node:alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy the entire project
COPY . .

# Cloud Run sets the PORT environment variable.
# Our server.js is designed to listen to process.env.PORT automatically.
EXPOSE 8080

# Start the server using the built-in Node.js runtime
# This is much more reliable for port binding on Cloud Run than Nginx
CMD [ "node", "server.js" ]
