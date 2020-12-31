#!/bin/sh

# Decrypt the file
mkdir ./src/assets/secrets
# --batch to prevent interactive command
# --yes to assume "yes" for questions
gpg --quiet --batch --yes --decrypt --passphrase="$LARGE_SECRET_PASSPHRASE" \
--output ./src/assets/secrets/google-client.json ./.github/secrets/google-client.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$LARGE_SECRET_PASSPHRASE" \
--output ./src/assets/secrets/google-client.prod.json ./.github/secrets/google-client.prod.json.gpg
