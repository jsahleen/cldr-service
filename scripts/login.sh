#!/bin/bash
echo "User email:"
read email
echo "User password:"
read -s password

export JWT=$(curl -H -X POST 'localhost:3000/auth' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email":"'$email'",
    "password":"'$password'"
}')

CLDR_ACCESS_TOKEN=$(echo $JWT | python3 -c "import sys, json; print(json.load(sys.stdin)['accessToken'])")
CLDR_REFRESH_TOKEN=$(echo $JWT | python3 -c "import sys, json; print(json.load(sys.stdin)['refreshToken'])")

echo "Logged in as ${email}."
