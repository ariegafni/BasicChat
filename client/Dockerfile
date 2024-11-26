FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json /app/

RUN npm i

ARG VITE_BASEURL

ENV VITE_BASEURL=$VITE_BASEURL

COPY . .

RUN npm run build

FROM nginx:latest

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]