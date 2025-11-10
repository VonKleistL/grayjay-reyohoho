#!/bin/sh
# Script Signing Tool for Grayjay Plugin
# Usage:
#   ./sign-script.sh ReyohohoScript.js
#   cat ReyohohoScript.js | ./sign-script.sh

# Set your key paths here
PRIVATE_KEY_PATH=~/.ssh/id_rsa
PUBLIC_KEY_PATH=~/.ssh/id_rsa.pub

# Check if keys exist
if [ ! -f "$PRIVATE_KEY_PATH" ]; then
    echo "ERROR: Private key not found at $PRIVATE_KEY_PATH"
    echo "Please generate SSH keys first: ssh-keygen -t rsa -b 4096"
    exit 1
fi

if [ ! -f "$PUBLIC_KEY_PATH" ]; then
    echo "ERROR: Public key not found at $PUBLIC_KEY_PATH"
    exit 1
fi

# Extract public key in PKCS8 format
PUBLIC_KEY_PKCS8=$(ssh-keygen -f "$PUBLIC_KEY_PATH" -e -m pkcs8 | tail -n +2 | head -n -1 | tr -d '\n')

echo "====================================="
echo "Grayjay Plugin Script Signing"
echo "====================================="
echo ""
echo "PUBLIC KEY (scriptPublicKey):"
echo "$PUBLIC_KEY_PKCS8"
echo ""

# Read script data
if [ $# -eq 0 ]; then
    # No parameter provided, read from stdin
    DATA=$(cat)
else
    # Parameter provided, read from file
    if [ ! -f "$1" ]; then
        echo "ERROR: File '$1' not found"
        exit 1
    fi
    DATA=$(cat "$1")
fi

# Generate signature
SIGNATURE=$(echo -n "$DATA" | openssl dgst -sha512 -sign "$PRIVATE_KEY_PATH" | base64 -w 0 2>/dev/null || echo -n "$DATA" | openssl dgst -sha512 -sign "$PRIVATE_KEY_PATH" | base64)

echo "SIGNATURE (scriptSignature):"
echo "$SIGNATURE"
echo ""
echo "====================================="
echo "Instructions:"
echo "1. Copy the PUBLIC KEY above"
echo "2. Paste it into 'scriptPublicKey' in ReyohohoConfig.json"
echo "3. Copy the SIGNATURE above"
echo "4. Paste it into 'scriptSignature' in ReyohohoConfig.json"
echo "5. Commit and push changes to GitHub"
echo "====================================="
