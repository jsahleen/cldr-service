# cldr-service

Proof of concept implementation for a CLDR web service. Allows dynamic loading of CLDR data across multiple locales, with element and content filtering. The current implementation provides publicly accessible data for number systems, currencies, languages, scripts, territories, variants, extensions and dynamically contructed locales.

## Local Setup

To use the service locally, follow these steps:

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop) for Mac or Windows. 

2. Create a new directory and add a `docker-compose.yml` file with the following content

```YAML
version: '3'
services:
  cldr-db:
    container_name: cldr-db
    image: mongo
    volumes:
      - ./data:/data/db
    ports:
      - "27017:27017"
  cldr-service:
    container_name: cldr-service
    image: jsahleen/cldr-service
    restart: always
    ports:
      - "3000:3000"
    depends_on:
      - cldr-db
    env_file:
      - .env
```

3. Add a `.env` file with overrides for the following default values:

```properties
CLDR_ROOT_USER_EMAIL="root@example.com"
CLDR_ROOT_USER_PASSWORD="P@$sW0rD"
CLDR_JWT_SECRET="b2upnzpr/XkBCpP"
```

4. Run `docker compose up -d` to start the service

5. The first time you use the service you will need to seed the database with data taken from `cldr-json`. To do this, run:

```bash
docker compose exec cldr-service yarn seed
```

Seeding the database will take some time, but it only needs to be done once.

## USAGE

The following endpoints are currently implemented. The service runs on port `3000`:

* AUTH

    * POST /auth
    * POST /auth/refresh-token

* USERS

    * GET admin/users
    * POST admin/users
    * GET admin/users/:id
    * PUT admin/users/:id
    * PATCH admin/users/:id
    * DELETE admin/users/:id

* NUMBERS

    * GET public/numbers?locales={locales}&systems={systems}&filters={filters}&page={page}&limit={limit}
    * GET public/numbers/:system?locales={locales}&filters={filters}&page={page}&limit={limit}
    * GET admin/numbers?locales={locales}&systems={systems}&filters={filters}&page={page}&limit={limit}
    * POST admin/numbers
    * GET admin/numbers/:id
    * PUT admin/numbers/:id
    * PATCH admin/numbers/:id
    * DELETE admin/numbers/:id

* CURRENCIES

    * GET public/currencies?locales={locales}&codes={codes}&filters={filters}&page={page}&limit={limit}
    * GET public/currencies/:code?locales={locales}&filters={filters}&page={page}&limit={limit}
    * GET admin/currencies?locales={locales}&codes={codes}&filters={filters}&page={page}&limit={limit}
    * POST admin/currencies
    * GET admin/currencies/:id
    * PUT admin/currencies/:id
    * PATCH admin/currencies/:id
    * DELETE admin/currencies/:id

* LANGUAGES

    * GET public/languages?locales={locales}&tags={tags}&filters={filters}&page={page}&limit={limit}
    * GET public/languages/:tag?locales={locales}&filters={filters}&page={page}&limit={limit}
    * GET admin/languages?locales={locales}&tags={tags}&filters={filters}&page={page}&limit={limit}
    * POST admin/languages
    * GET admin/languages/:id
    * PUT admin/languages/:id
    * PATCH admin/languages/:id
    * DELETE admin/languages/:id

* SCRIPTS

    * GET public/scripts?locales={locales}&tags={tags}&filters={filters}&page={page}&limit={limit}
    * GET public/scripts/:tag?locales={locales}&filters={filters}&page={page}&limit={limit}
    * GET admin/scripts?locales={locales}&tags={tags}&filters={filters}&page={page}&limit={limit}
    * POST admin/scripts
    * GET admin/scripts/:id
    * PUT admin/scripts/:id
    * PATCH admin/scripts/:id
    * DELETE admin/scripts/:id

* TERRITORIES

    * GET public/territories?locales={locales}&tags={tags}&filters={filters}&page={page}&limit={limit}
    * GET public/territories/:tag?locales={locales}&filters={filters}&page={page}&limit={limit}
    * GET admin/territories?locales={locales}&tags={tags}&filters={filters}&page={page}&limit={limit}
    * POST admin/territories
    * GET admin/territories/:id
    * PUT admin/territories/:id
    * PATCH admin/territories/:id
    * DELETE admin/territories/:id

* VARIANTS

    * GET public/variants?locales={locales}&tags={tags}&filters={filters}&page={page}&limit={limit}
    * GET public/variants/:tag?locales={locales}&filters={filters}&page={page}&limit={limit}
    * GET admin/variants?locales={locales}&tags={tags}&filters={filters}&page={page}&limit={limit}
    * POST admin/variants
    * GET admin/variants/:id
    * PUT admin/variants/:id
    * PATCH admin/variants/:id
    * DELETE admin/variants/:id

* EXTENSIONS

    * GET public/extensions?locales={locales}&keys={keys}&filters={filters}&page={page}&limit={limit}
    * GET public/extensions/:key?locales={locales}&filters={filters}&page={page}&limit={limit}
    * GET admin/extensions?locales={locales}&keys={keys}&filters={filters}&page={page}&limit={limit}
    * POST admin/extensions
    * GET admin/extensions/:id
    * PUT admin/extensions/:id
    * PATCH admin/extensions/:id
    * DELETE admin/extensions/:id

* LOCALES

    * GET public/locales?locales={locales}&tags={tags}&filters={filters}&page={page}&limit={limit}
    * GET public/locales/:tag?locales={locales}&filters={filters}&page={page}&limit={limit}
    * GET admin/locales?locales={locales}&tags={tags}&filters={filters}&page={page}&limit={limit}
    * POST admin/locales
    * GET admin/locales/:id
    * PUT admin/locales/:id
    * PATCH admin/locales/:id
    * DELETE admin/locales/:id

For the all query parameters except `page` and `limit`, the expected value is a comma-separated list of elements (e.g., `?locales=en,fr,de`). The locales, tags, systems and codes parameters support the corresponding lists of elements in cldr-json. Locales are limited to modern locales. Filters can be any set of paths inside the `main` element of a data module. Only paths specified in filters are returned. By default, all paths are returned. For number systems, there are additional systems keywords `default` and `native` that can be passed. For currencies, there is an additional keyword `current`. Data returned is taken from `cldr-core`, `cldr-numbers-modern` and `cldr-localenames-modern`.
