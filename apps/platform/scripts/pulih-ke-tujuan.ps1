# Jalankan pemulihan cadangan ke project Supabase TUJUAN dengan aman (PowerShell).
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\pulih-ke-tujuan.ps1 -Ref <ref-tujuan> -Berkas <cadangan.json>
# Kunci service-role project tujuan diminta lewat prompt tersembunyi, hanya hidup selama skrip berjalan, tidak disimpan di berkas.
# Penjaga (menolak production, --yakin) ada di restore-backup.mjs.
param(
  [Parameter(Mandatory = $true)][string]$Ref,
  [Parameter(Mandatory = $true)][string]$Berkas
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $Berkas)) { Write-Error "Berkas tidak ditemukan: $Berkas"; exit 2 }

$env:SUPABASE_URL = "https://$Ref.supabase.co"
$aman = Read-Host "Kunci service-role project $Ref (tidak ditampilkan)" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($aman)
try { $env:SUPABASE_SERVICE_ROLE_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }

try {
  node (Join-Path $PSScriptRoot 'restore-backup.mjs') $Berkas --apply "--yakin=$Ref"
  $kode = $LASTEXITCODE
}
finally {
  Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:SUPABASE_URL -ErrorAction SilentlyContinue
}
exit $kode
