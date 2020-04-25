<img src="./public/images/squanchy.png" align="right" alt="metasquanch" width="160x">

# ｍ е ｔａ ѕ ｑｕ а ｎ сһ

<img src="https://img.shields.io/badge/license-GPLv3-brightgreen">

metasquanch is a server application that allows ingestion of files via web upload or email to remove metadata, javascript and other unwanted parts.

- Simple web interface to upload and clean files
- Ability to monitor a mailbox, clean attachments and respond to sender
- Usage of of exiftool and qpdf in the background
- Ready to deploy as Node.js application, standalone docker container or using docker-compose
- Use of promises and async/await
- Focus on security (TLS, CSP, HSTS,...)

 <img src="./public/images/example.png " alt="example" align="center" height="500" />
  
## Running metasquanch as Node.js application

### Prerequisites

If you plan to run metasquanch without a container runtime, be sure to have a working Node.js environment.
Furthermore install exiftool and qpdf. This can be achieved by running...

```
sudo apt update && sudo apt install exiftool qpdf
```

...on a Debian based OS or by running...

```
sudo dnf install qpdf exiftool
```

...on a RedHat based OS.

### Deployment

Clone the repo, adjust the environment variables and start the application:

```
git clone https://github.com/ttinkr/metasquanch
cd metasquanch
cp .env-sample .env
vim .env
npm start
```

## Running metasquanch using docker

### Prerequisites

If you plan to run metasquanch as a container you need a working container engine like docker.

### Deployment

Clone the repo, adjust the environment variables, build the image and run the container:

```
git clone https://github.com/ttinkr/metasquanch
cd metasquanch
cp .env-sample .env
vim .env
docker build -t ttinkr/metasquanch .
docker run metasquanch
```

I am planning on uploading the image to Docker Hub soon.

## Running metasquanch using docker-compose

### Prerequisites

If you plan to run metasquanch as a container using docker-compose you need a working docker container engine and docker-compose installed.

### Deployment

Clone the repo, adjust the environment variables, configure ngingx and build the image and run the container:

```
git clone https://github.com/ttinkr/metasquanch
cd metasquanch
cp .env-sample .env
vim .env
vim nginx.conf
docker-compose up
```
