$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot
try {
    if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME/bin/javac.exe")) { throw 'Configura JAVA_HOME con un JDK 21.' }
    $env:PATH = "$env:JAVA_HOME/bin;$env:PATH"
    $sdkPath = Join-Path $projectRoot '.tools/android-sdk'
    if (-not (Test-Path $sdkPath)) { throw 'No se encuentra .tools/android-sdk. Consulta ANDROID.md.' }
    $env:ANDROID_HOME = $sdkPath
    $env:GRADLE_USER_HOME = Join-Path $env:TEMP 'rotacion-gradle'
    $sdkProperty = $sdkPath.Replace('\', '/')
    Set-Content -LiteralPath android/local.properties -Value "sdk.dir=$sdkProperty" -Encoding ascii
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw 'Falló el build web.' }
    & npx.cmd cap sync android
    if ($LASTEXITCODE -ne 0) { throw 'Falló la sincronización Android.' }
    Push-Location android
    try {
        & ./gradlew.bat --no-daemon --max-workers=2 :app:assembleDebug
        if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación Android.' }
    } finally { Pop-Location }
    New-Item -ItemType Directory -Force deliverables | Out-Null
    Copy-Item -LiteralPath android/app/build/outputs/apk/debug/app-debug.apk -Destination deliverables/rotacion-demo.apk -Force
    Get-FileHash -LiteralPath deliverables/rotacion-demo.apk -Algorithm SHA256
} finally { Pop-Location }
