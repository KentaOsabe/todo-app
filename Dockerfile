FROM node:22.18.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5173 9229

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]