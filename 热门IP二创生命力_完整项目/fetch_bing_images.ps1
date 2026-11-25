$queries = @(
  '奶龙 原版 B站',
  '奶蛙 奶龙 B站',
  'Loopy 原动画 B站',
  'Loopy 表情包 B站',
  '吉伊卡哇 官方动画 B站',
  '吉伊卡哇 抽象版 B站'
)
$outDir = Join-Path $PSScriptRoot 'dist\assets'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$index = 0
foreach ($query in $queries) {
  $index++
  $encoded = [uri]::EscapeDataString($query)
  $htmlPath = Join-Path $env:TEMP "bili-image-$index.html"
  & curl.exe --compressed -L -A 'Mozilla/5.0' "https://cn.bing.com/images/search?q=$encoded" -o $htmlPath 2>$null
  $html = Get-Content -Raw -Encoding UTF8 $htmlPath
  $matches = [regex]::Matches($html, 'purl&quot;:&quot;(?<purl>.*?)&quot;.*?murl&quot;:&quot;(?<murl>.*?)&quot;.*?turl&quot;:&quot;(?<turl>.*?)&quot;')
  $chosen = $matches | Where-Object { $_.Groups['purl'].Value -match 'bilibili\.com' } | Select-Object -First 1
  if (-not $chosen) { $chosen = $matches | Select-Object -First 1 }
  if (-not $chosen) { Write-Output "MISS`t$query"; continue }
  $url = [Net.WebUtility]::HtmlDecode($chosen.Groups['turl'].Value)
  $purl = [Net.WebUtility]::HtmlDecode($chosen.Groups['purl'].Value)
  $file = Join-Path $outDir ("morph-$index.jpg")
  & curl.exe -L -A 'Mozilla/5.0' $url -o $file 2>$null
  Write-Output "OK`t$index`t$query`t$purl`t$url"
}
