FROM node:8-alpine

WORKDIR /app

COPY . /app

RUN apk update
RUN apk add mysql-client
RUN npm install

EXPOSE 3033

ENV PORT 3033

CMD ["node", "app.js"]
