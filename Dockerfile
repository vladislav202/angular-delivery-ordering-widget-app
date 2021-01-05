# Stage 1: Build project
FROM node:12.19.0-alpine3.12 AS builder
ARG ENVIRONMET_ARG=dev
ENV ENVIRONMENT $ENVIRONMET_ARG
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install --frozen-lockfile
COPY . /app/
RUN yarn build:${ENVIRONMENT}

# Stage 2: Deploy to nginx
FROM nginx:alpine
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/deliverai-frontend-web-widget /usr/share/nginx/html
