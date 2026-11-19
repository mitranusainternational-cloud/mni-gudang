# Jalankan alat pindah-data ke project Supabase TUJUAN dengan aman (PowerShell).
#   SIMULASI (aman, dibatalkan di akhir):
#     powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\pindah-ke-tujuan.ps1 -Berkas <cadangan.json>
#   SUNGGUHAN (menyimpan):
#     powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\pindah-ke-tujuan.ps1 -Berkas <cadangan.json> -Sungguhan
#   Tambah -Paksa bila tujuan berisi data uji yang boleh hilang (mis. staging).
# String koneksi (Supabase > Connect > Session pooler, mengandung password) diminta lewat prompt tersembunyi, hanya hidup selama skrip
# berjalan, tidak disimpan di berkas. Penjaga (menolak production, wajib mengetik ref project) ada di pindah-data.mjs dan di sini.
param(
  [Parameter(Mandatory = $true)][string]$Berkas,
  [switch]$Sungguhan,
  [switch]$Paksa
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $Berkas)) { Write-Error "Berkas tidak ditemukan: $Berkas"; exit 2 }

$aman = Read-Host "String koneksi Session pooler project TUJUAN (tidak ditampilkan)" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($aman)
try { $env:DATABASE_URL = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }

try {
  if ($env:DATABASE_URL -notmatch 'postgres\.([a-z0-9]{20})') { Write-Error 'String koneksi tidak dikenali. Pakai string "Session pooler" (postgres.<ref>@...pooler.supabase.com).'; exit 2 }
  $ref = $Matches[1]
  Write-Host "Project tujuan terbaca: $ref"
  if (-not (Test-Path (Join-Path $PSScriptRoot '..\node_modules\pg'))) { Write-Host 'Memasang paket pg (sekali)...'; Push-Location (Join-Path $PSScriptRoot '..'); npm i --no-save pg --no-audit --no-fund | Out-Null; Pop-Location }
  $argumen = @((Join-Path $PSScriptRoot 'pindah-data.mjs'), $Berkas, '--bentuk-ulang')
  if ($Paksa) { $argumen += '--paksa' }
  if ($Sungguhan) {
    $ketik = Read-Host "SUNGGUHAN: ketik ulang ref project tujuan ($ref) untuk memastikan"
    if ($ketik -ne $ref) { Write-Error 'Ref tidak sama. Dibatalkan, tidak ada yang berubah.'; exit 2 }
    $argumen += '--apply'; $argumen += "--yakin=$ref"
  }
  node @argumen
  $kode = $LASTEXITCODE
}
finally {
  Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
}
exit $kode
