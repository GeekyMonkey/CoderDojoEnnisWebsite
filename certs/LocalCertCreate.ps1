# Generate a self-signed certificate for localhost with subjectAltName
& openssl req -x509 -newkey rsa:4096 -keyout localhost.key -out localhost.cert -days 365 -nodes -subj "/CN=localhost" -addext "subjectAltName = DNS:localhost"
& openssl pkcs12 -export -out localhost.pfx -inkey localhost.key -in localhost.cert -passout pass:
Write-Host "Certificate files created: localhost.cert, localhost.key, localhost.pfx"