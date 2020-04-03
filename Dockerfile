FROM node:latest
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -qq -y --no-install-recommends exiftool qpdf
COPY package*.json ./
RUN npm set unsafe-perm true && npm install
COPY . .
EXPOSE 8000
CMD [ "npm", "start"]