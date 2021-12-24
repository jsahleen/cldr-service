FROM node:lts-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN yarn --production

ARG CLDR_TIER="modern"
ARG CLDR_VERSION="40.0.0"

ENV CLDR_TIER=${CLDR_TIER}
ENV CLDR_VERSION=${CLDR_VERSION}

RUN yarn setup

EXPOSE 3000

CMD [ "yarn", "start" ]
