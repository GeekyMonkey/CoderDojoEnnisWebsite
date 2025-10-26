# Import server.cert as a Trusted Root CA for the current user
$certPath = ".\src\certs\server.cert"
Import-Certificate -FilePath $certPath -CertStoreLocation Cert:\CurrentUser\Root
Write-Host "Certificate imported to CurrentUser Root store."