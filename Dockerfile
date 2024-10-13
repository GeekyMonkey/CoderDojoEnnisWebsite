# syntax = docker/dockerfile:1
ARG NODE_VERSION=22.7.0
FROM node:${NODE_VERSION}-alpine AS base

ARG BUILD_VERSION
ENV BUILD_VERSION=${BUILD_VERSION}

ENV NODE_ENV=production
WORKDIR /src

# Install Yarn
RUN npm install -g yarn --force

# Build stage
#COPY --link src/package.json .
#COPY --link src/yarn.lock .
#COPY --link src/prisma ./prisma
#COPY --link src/node_modules/.prisma/client ./prisma
COPY --link src/. .

RUN npx yarn install --production=false

EXPOSE 3000

RUN yarn build
#RUN npm prune

CMD [ "yarn", "start" ]

