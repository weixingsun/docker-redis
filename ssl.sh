openssl genrsa -out private.pem 1024
openssl req -new -key private.pem -out cert.csr
openssl x509 -req -in cert.csr -signkey private.pem -out certificate.pem
# var options={
#   key: fs.readFileSync('./ssl/private.pem'),
#   cert: fs.readFileSync('./ssl/certificate.pem'),
# }
