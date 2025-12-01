# Compile and run the RestaurantBackend from the package layout
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)

if (!(Test-Path -Path .\bin)) {
  New-Item -ItemType Directory -Path .\bin | Out-Null
}

# Compile all java sources under src/main/java
Write-Host "Compiling Java sources..."
javac -d .\bin src\main\java\com\restaurant\*.java
if ($LASTEXITCODE -ne 0) {
  Write-Error "Compilation failed. See errors above."
  exit 1
}

Write-Host "Starting RestaurantBackend..."
Start-Process -FilePath java -ArgumentList '-cp', '.\\bin', 'com.restaurant.RestaurantBackend'
Write-Host "RestaurantBackend started. Open http://localhost:8080 in your browser."
