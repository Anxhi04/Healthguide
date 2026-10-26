$ErrorActionPreference = 'Stop'
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]::new($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Open PowerShell as Administrator, then run this script again.'
}
Set-Service -Name W32Time -StartupType Automatic
Start-Service -Name W32Time
& w32tm /resync /rediscover
if ($LASTEXITCODE -ne 0) { throw 'Time synchronization failed. Check internet access and the Windows time server configuration.' }
& w32tm /query /status
Write-Host 'Automatic time synchronization enabled. Restart the HealthGuide backend.'
