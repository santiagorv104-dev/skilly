# Genera la narración en WAV con una voz en español de Windows (OneCore).
# Uso: powershell -File tts.ps1 -Json frases.json -OutDir carpeta [-Voice Laura]
# frases.json: [{ "id": "intro", "text": "Hola, soy Sky..." }, ...]
param(
  [Parameter(Mandatory = $true)][string]$Json,
  [Parameter(Mandatory = $true)][string]$OutDir,
  [string]$Voice = 'Laura',
  [double]$Rate = 1.08
)
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Runtime.WindowsRuntime
[void][Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media.SpeechSynthesis, ContentType = WindowsRuntime]
[void][Windows.Storage.Streams.DataReader, Windows.Storage.Streams, ContentType = WindowsRuntime]

$asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() |
  Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } |
  Select-Object -First 1

function Await($operation, [Type]$resultType) {
  $task = $asTask.MakeGenericMethod($resultType).Invoke($null, @($operation))
  [void]$task.Wait()
  $task.Result
}

$synth = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
$chosen = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices |
  Where-Object { $_.DisplayName -like "*$Voice*" } |
  Select-Object -First 1
if ($chosen) { $synth.Voice = $chosen }
if ($synth.Options -and ($synth.Options | Get-Member -Name SpeakingRate)) { $synth.Options.SpeakingRate = $Rate }
Write-Output "voz: $($synth.Voice.DisplayName)"

New-Item -ItemType Directory -Force $OutDir | Out-Null
$items = Get-Content -Raw -Encoding UTF8 $Json | ConvertFrom-Json
foreach ($item in $items) {
  $stream = Await ($synth.SynthesizeTextToStreamAsync($item.text)) ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])
  $size = [uint32]$stream.Size
  $reader = New-Object Windows.Storage.Streams.DataReader($stream.GetInputStreamAt(0))
  [void](Await ($reader.LoadAsync($size)) ([uint32]))
  $bytes = New-Object byte[] $size
  $reader.ReadBytes($bytes)
  [IO.File]::WriteAllBytes((Join-Path $OutDir "$($item.id).wav"), $bytes)
  Write-Output "ok $($item.id) ($size bytes)"
}
