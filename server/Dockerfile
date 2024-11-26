FROM node:18-alpine

WORKDIR /app

COPY package*.json /app/

RUN npm i

COPY . .

RUN npm run build

EXPOSE 5000

CMD [ "node", "dist/server.js" ]