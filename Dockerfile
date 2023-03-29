# Base image
FROM node:17-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy app source code
COPY . .

# Set environment variables
ENV PORT=3000
# ENV NODE_ENV=production

# Expose the port
EXPOSE $PORT

# Start the app
CMD [ "npm", "start" ]
