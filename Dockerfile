FROM node:latest

WORKDIR /usr/src/app

COPY . .

RUN npm install && echo "Aooooba"

CMD [ "npm", "start" ]
