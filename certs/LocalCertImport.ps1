# Import localhost.cert as a Trusted Root CA for the current user
$certPath = ".\localhost.cert"
Import-Certificate -FilePath $certPath -CertStoreLocation Cert:\CurrentUser\Root
Write-Host "Certificate imported to CurrentUser Root store."