param(
    [switch]$Probe
)

$ErrorActionPreference = "Stop"

$SourceDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClaudeDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME ".claude" }
$HookDir = Join-Path $ClaudeDir "hooks"
$ConfigFile = Join-Path $ClaudeDir "bash-dump-guard.config.json"
$CapabilityFile = Join-Path $ClaudeDir "bash-dump-guard-capabilities.json"
$GuardFile = Join-Path $HookDir "bash-dump-guard.mjs"
$CanaryFile = Join-Path $HookDir "claude-hook-capability-canary.mjs"
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"

$Node = Get-Command node -ErrorAction SilentlyContinue
if (-not $Node) { throw "Node.js >= 18 is required." }
$NodeMajor = [int]((& node -p 'Number(process.versions.node.split(".")[0])').Trim())
if ($NodeMajor -lt 18) { throw "Node.js >= 18 is required; found $(& node --version)." }

New-Item -ItemType Directory -Force -Path $HookDir | Out-Null

foreach ($Target in @($GuardFile, $CanaryFile, $ConfigFile)) {
    if (Test-Path $Target) {
        $Backup = "$Target.bak.$Stamp"
        Copy-Item $Target $Backup
        Write-Host "Backup: $Backup"
    }
}

Copy-Item (Join-Path $SourceDir "bash-dump-guard.mjs") $GuardFile -Force
Copy-Item (Join-Path $SourceDir "claude-hook-capability-canary.mjs") $CanaryFile -Force
Copy-Item (Join-Path $SourceDir "bash-dump-guard.config.json") $ConfigFile -Force

& node $GuardFile --self-test
if ($LASTEXITCODE -ne 0) { throw "bash-dump-guard self-test failed." }
& node $CanaryFile --self-test
if ($LASTEXITCODE -ne 0) { throw "capability canary self-test failed." }

if ($Probe) {
    if (Get-Command claude -ErrorAction SilentlyContinue) {
        & node $CanaryFile --output $CapabilityFile
        $ProbeRc = $LASTEXITCODE
        switch ($ProbeRc) {
            0 { Write-Host "Live capability probe passed sufficiently for an automatic path." }
            2 { Write-Warning "Both mutation paths failed. Guard stays shadow-only; use explicit filter/MCP fallback." }
            3 { Write-Warning "At least one capability remained unknown. Guard stays shadow-only." }
            default { Write-Warning "Capability probe failed operationally (exit $ProbeRc). Guard stays shadow-only." }
        }
    } else {
        Write-Warning "Claude CLI not found; guard installed but live capability probe skipped."
    }
} else {
    Write-Host "Live capability probe not run. hookActivation=auto therefore stays in shadow mode."
    Write-Host "Run later: node `"$CanaryFile`" --output `"$CapabilityFile`""
}

& node $GuardFile --status

$JsonGuard = $GuardFile.Replace("\", "/")
$JsonCanary = $CanaryFile.Replace("\", "/")
$JsonCapability = $CapabilityFile.Replace("\", "/")
Write-Host ""
Write-Host "Installed bash-dump-guard v3. Merge the following PostToolUse/Bash hook into $ClaudeDir/settings.json."
Write-Host "Keep exactly one PostToolUse/Bash output owner; matching hooks run concurrently."
Write-Host @"
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$JsonGuard\"",
            "timeout": 15,
            "statusMessage": "Evaluating Bash output budget"
          }
        ]
      }
    ]
  }
}
"@
Write-Host "Capability probe: node `"$JsonCanary`" --output `"$JsonCapability`""
Write-Host "Status: node `"$JsonGuard`" --status"
Write-Host "Raw retrieval: node `"$JsonGuard`" --show SESSION/ID"
Write-Host "Explicit fallback: noisy-command 2>&1 | node `"$JsonGuard`" --filter --command `"noisy-command`""
Write-Host "Prune archive: node `"$JsonGuard`" --prune 7"
