#!/bin/bash
export JWT=$(curl -H -X POST 'localhost:3000/auth' \
--header 'Content-Type: application/json' \
--data-raw '{
    "password":"'$2'",
    "email":"'$1'"
}')

echo $JWT

CLDR_ACCESS_TOKEN=$(echo $JWT | python3 -c "import sys, json; print(json.load(sys.stdin)['accessToken'])")
CLDR_REFRESH_TOKEN=$(echo $JWT | python3 -c "import sys, json; print(json.load(sys.stdin)['refreshToken'])")
