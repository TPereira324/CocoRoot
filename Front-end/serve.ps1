param(
    [int]$Port = 8000,
    [string]$Root = (Resolve-Path .).Path
)

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
try {
    $listener.Start()
} catch {
    Write-Host "Não foi possível iniciar o servidor em http://localhost:$Port/"
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "HTTP server running at http://localhost:$Port/ (root=$Root)"

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()

        try {
            $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
            if ([string]::IsNullOrWhiteSpace($rel)) {
                $rel = 'index.html'
            }

            $file = Join-Path $Root $rel
            if (Test-Path $file -PathType Container) {
                $file = Join-Path $file 'index.html'
            }

            if (!(Test-Path $file -PathType Leaf)) {
                $ctx.Response.StatusCode = 404
                $bytes = [Text.Encoding]::UTF8.GetBytes('Not Found')
                $ctx.Response.ContentType = 'text/plain; charset=utf-8'
                $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
                $ctx.Response.Close()
                continue
            }

            $ext = [IO.Path]::GetExtension($file).ToLowerInvariant()
            $contentType = switch ($ext) {
                '.html' { 'text/html; charset=utf-8' }
                '.css' { 'text/css; charset=utf-8' }
                '.js' { 'application/javascript; charset=utf-8' }
                '.svg' { 'image/svg+xml' }
                '.png' { 'image/png' }
                '.jpg' { 'image/jpeg' }
                '.jpeg' { 'image/jpeg' }
                default { 'application/octet-stream' }
            }

            $bytes = [IO.File]::ReadAllBytes($file)
            $ctx.Response.ContentType = $contentType
            $ctx.Response.ContentLength64 = $bytes.Length
            $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
            $ctx.Response.OutputStream.Close()
            $ctx.Response.Close()
        } catch {
            try {
                $ctx.Response.StatusCode = 500
                $bytes = [Text.Encoding]::UTF8.GetBytes('Server error')
                $ctx.Response.ContentType = 'text/plain; charset=utf-8'
                $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
                $ctx.Response.Close()
            } catch {
            }
        }
    }
} finally {
    try { $listener.Stop() } catch { }
    try { $listener.Close() } catch { }
}

