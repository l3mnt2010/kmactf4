FROM node:20.7.0-alpine

RUN apk update
RUN apk add build-base

COPY ./flag.txt /flag.txt
COPY ./readflag.c /tmp/readflag.c

RUN gcc -o /readflag /tmp/readflag.c
RUN rm /tmp/readflag.c

RUN chmod 400 /flag.txt
RUN chown root /flag.txt /readflag
RUN chmod u+s /readflag

WORKDIR /src
COPY ./src/package.json /src/
RUN npm install

COPY ./src /src

USER nobody
EXPOSE 8888

CMD ["node", "index.js"]
