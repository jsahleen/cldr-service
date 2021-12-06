FROM node:lts-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN yarn

ARG CLDR_VERSION=39
ARG CLDR_TIER=modern

RUN yarn add cldr-core@${CLDR_VERSION} cldr-localenames-${CLDR_TIER}@${CLDR_VERSION} cldr-numbers-${CLDR_TIER}@${CLDR_VERSION}

EXPOSE 3000

CMD [ "yarn", "start" ]

