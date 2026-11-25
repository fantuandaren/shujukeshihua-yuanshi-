$ids = @(
  'BV1jkBVYKEme','BV1jmwMzgEbA','BV1oNwbzbEuA','BV1sbbD64ERP',
  'BV1H841127eo','BV1Ay421h79m','BV1zQ4y1J7CS','BV1aN411s7tw',
  'BV1EF4m1u7cN','BV1GnanzGEwn','BV1vT4y187kp','BV128uh6xEZt'
)
$assetDir = Join-Path $PSScriptRoot 'dist\assets'
for ($i = 0; $i -lt $ids.Count; $i++) {
  $n = $i + 1
  $id = $ids[$i]
  $json = & curl.exe --compressed -s -L -A 'Mozilla/5.0' "https://api.bilibili.com/x/web-interface/view?bvid=$id"
  try { $meta = $json | ConvertFrom-Json } catch { Write-Output "MISS`t$n`t$id`tinvalid-json"; continue }
  if ($meta.code -ne 0 -or -not $meta.data.pic) { Write-Output "MISS`t$n`t$id`t$($meta.code)"; continue }
  $url = $meta.data.pic -replace '^http:', 'https:'
  $out = Join-Path $assetDir ("bili-$n.jpg")
  & curl.exe -s -L -A 'Mozilla/5.0' -e 'https://www.bilibili.com/' $url -o $out
  Write-Output "OK`t$n`t$id`t$($meta.data.title)`t$url"
}
