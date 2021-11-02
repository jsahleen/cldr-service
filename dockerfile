FROM node:lts-alpine as base

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN yarn

FROM node:lts-alpine as localedata

WORKDIR /usr/src/app

COPY --from=base /usr/src/app /usr/src/app

EXPOSE 3000

CMD [ "yarn", "start" ]

ARG CLDR_VERSION=39
ARG CLDR_TIER=modern

RUN yarn add cldr-core@${CLDR_VERSION} cldr-localenames-${CLDR_TIER}@${CLDR_VERSION} cldr-numbers-${CLDR_TIER}@${CLDR_VERSION}
