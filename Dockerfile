FROM node:latest
WORKDIR /usr/src/app
RUN apt install -y --no-install-recommends exiftool qpdf
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]