FROM node:16-alpine3.11

WORKDIR /usr/src/app

RUN apk update ; apk upgrade ; apk add --no-cache \
	libc6-compat \
	build-base \
	python3-dev

COPY package*.json ./

RUN npm ci --only=production

COPY . .

CMD [ "node", "index.js" ]