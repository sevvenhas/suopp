FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
EXPOSE 3000
CMD ["node", "server.js"]
