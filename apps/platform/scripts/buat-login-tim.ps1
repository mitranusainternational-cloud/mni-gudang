# Buat akun login tim di project Supabase TUJUAN dengan aman (PowerShell).
#   SIMULASI, password sementara : powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\buat-login-tim.ps1 -Ref <ref-tujuan>
#   SIMULASI, password LAMA sama : ... -Ref <ref-tujuan> -SandiLama
#   SUNGGUHAN                    : tambahkan -Sungguhan
# Kunci service-role tujuan (dan, bila -SandiLama, string koneksi Postgres production HANYA UNTUK DIBACA) diminta lewat prompt tersembunyi,
# hanya hidup selama skrip berjalan, tidak disimpan di berkas. Hash password lama tidak pernah dicetak.
param(
  [Parameter(Mandatory = $true)][string]$Ref,
  [switch]$Sungguhan,
  [switch]$SandiLama
)
$ErrorActionPreference = 'Stop'
$ke = { param($aman) $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($aman); try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) } }
$env:SUPABASE_URL = "https://$Ref.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = & $ke (Read-Host "Kunci service-role project TUJUAN $Ref (tidak ditampilkan)" -AsSecureString)
if ($SandiLama) {
  $env:SUMBER_DATABASE_URL = & $ke (Read-Host "String koneksi Session pooler project SUMBER (production), hanya dibaca (tidak ditampilkan)" -AsSecureString)
  if (-not (Test-Path (Join-Path $PSScriptRoot '..\node_modules\pg'))) { Write-Host 'Memasang paket pg (sekali)...'; Push-Location (Join-Path $PSScriptRoot '..'); npm i --no-save pg --no-audit --no-fund | Out-Null; Pop-Location }
}
try {
  $argumen = @((Join-Path $PSScriptRoot 'buat-login-tim.mjs'))
  if ($Sungguhan) {
    $ketik = Read-Host "SUNGGUHAN: ketik ulang ref project tujuan ($Ref) untuk memastikan"
    if ($ketik -ne $Ref) { Write-Error 'Ref tidak sama. Dibatalkan, tidak ada yang berubah.'; exit 2 }
    $argumen += '--apply'; $argumen += "--yakin=$Ref"
  }
  node @argumen
  $kode = $LASTEXITCODE
}
finally {
  Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:SUPABASE_URL -ErrorAction SilentlyContinue
  Remove-Item Env:SUMBER_DATABASE_URL -ErrorAction SilentlyContinue
}
exit $kode
