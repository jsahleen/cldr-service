#!/bin/bash
echo "User email:"
read email
echo "User password:"
read -s password

export JWT=$(curl -H -X POST 'cldr-service:8090/auth' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email":"'$email'",
    "password":"'$password'"
}')

ACCESS="var fs = require('fs');process.stdout.write(JSON.parse(fs.readFileSync(0, 'utf-8'))['accessToken'])"
REFRESH="var fs = require('fs');process.stdout.write(JSON.parse(fs.readFileSync(0, 'utf-8'))['refreshToken'])"

export CLDR_ACCESS_TOKEN=$(echo $JWT | node -e "${ACCESS}")
export CLDR_REFRESH_TOKEN=$(echo $JWT | node -e "${REFRESH}")

echo "Logged in as ${email}."
