FROM node:lts-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app
COPY ./src /usr/src/app/src
COPY ./scripts /usr/src/app/scripts
COPY ./.env.example /usr/src/app/
COPY ./.npmrc /usr/src/app/
COPY ./package.json /usr/src/app/
COPY ./tsconfig.json /usr/src/app/
COPY ./yarn.lock /usr/src/app/

RUN yarn install

ARG CLDR_TIER="modern"
ARG CLDR_VERSION="40.0.0"

ENV CLDR_TIER=${CLDR_TIER}
ENV CLDR_VERSION=${CLDR_VERSION}

RUN yarn setup

EXPOSE 3000
EXPOSE 8000

CMD [ "yarn", "start" ]
