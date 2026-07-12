FROM node:20-alpine
ENV TZ=Asia/Jakarta

RUN apk update && apk add --no-cache git

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8001
CMD ["node", "index.js"]
