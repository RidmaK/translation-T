# Base image
FROM node:lts-alpine3.12

# Install other dependencies including Python
RUN apk update && \
    apk upgrade busybox && \
    apk add --no-cache python3 py3-pip

    # Install the BeautifulSoup4 library
RUN pip install beautifulsoup4

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Expose the data flow through port
EXPOSE 5002

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
