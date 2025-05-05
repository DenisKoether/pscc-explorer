FROM node:lts as build
ARG TARGET_ENVIRONMENT="staging"
WORKDIR /usr/src/app
RUN sh -c '[ -z "$http_proxy" ] || ( npm config set proxy $http_proxy; npm config set https-proxy $http_proxy )'
COPY package.json ./
RUN npm install
COPY ./vite.config.ts ./svelte.config.js ./
COPY ./src ./src
COPY ./static ./static

ENV NODE_ENV=staging
ENV VITE_TARGET_ENVIRONMENT=staging

RUN VITE_TARGET_ENVIRONMENT="staging" npm run build

EXPOSE 5173
CMD ["npm", "run", "release"]