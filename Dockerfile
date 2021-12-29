FROM node:latest

WORKDIR /usr/src/app

COPY . .

RUN npm install && echo "Aoooba"

CMD [ "npm", "start" ]
