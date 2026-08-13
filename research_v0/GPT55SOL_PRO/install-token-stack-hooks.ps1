param(
    [switch]$Probe
)

$ErrorActionPreference = "Stop"
$SourceDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClaudeDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME ".claude" }
$HookDir = Join-Path $ClaudeDir "hooks"
$LibDir = Join-Path $HookDir "lib"
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"

$Node = Get-Command node -ErrorAction SilentlyContinue
if (-not $Node) { throw "Node.js >= 18 is required." }
$NodeMajor = [int]((& node -p 'Number(process.versions.node.split(".")[0])').Trim())
if ($NodeMajor -lt 18) { throw "Node.js >= 18 is required; found $(& node --version)." }

New-Item -ItemType Directory -Force -Path $HookDir, $LibDir | Out-Null

$Files = @(
    @{ Source = "bash-dump-guard.mjs"; Target = (Join-Path $HookDir "bash-dump-guard.mjs") },
    @{ Source = "claude-hook-capability-canary.mjs"; Target = (Join-Path $HookDir "claude-hook-capability-canary.mjs") },
    @{ Source = "prefix-budget.mjs"; Target = (Join-Path $HookDir "prefix-budget.mjs") },
    @{ Source = "read-context-guard.mjs"; Target = (Join-Path $HookDir "read-context-guard.mjs") },
    @{ Source = "read-slice-guard.mjs"; Target = (Join-Path $HookDir "read-slice-guard.mjs") },
    @{ Source = "reread-guard.mjs"; Target = (Join-Path $HookDir "reread-guard.mjs") },
    @{ Source = "session-economy.mjs"; Target = (Join-Path $HookDir "session-economy.mjs") },
    @{ Source = "lib/token-stack-shared.mjs"; Target = (Join-Path $LibDir "token-stack-shared.mjs") },
    @{ Source = "bash-dump-guard.config.json"; Target = (Join-Path $ClaudeDir "bash-dump-guard.config.json") },
    @{ Source = "prefix-budget.config.json"; Target = (Join-Path $ClaudeDir "prefix-budget.config.json") },
    @{ Source = "read-context-guard.config.json"; Target = (Join-Path $ClaudeDir "read-context-guard.config.json") },
    @{ Source = "session-economy.config.json"; Target = (Join-Path $ClaudeDir "session-economy.config.json") }
)

foreach ($File in $Files) {
    if (Test-Path $File.Target) {
        $Backup = "$($File.Target).bak.$Stamp"
        Copy-Item $File.Target $Backup
        Write-Host "Backup: $Backup"
    }
    $Source = Join-Path $SourceDir ($File.Source -replace '/', [IO.Path]::DirectorySeparatorChar)
    Copy-Item $Source $File.Target -Force
}

& node (Join-Path $HookDir "bash-dump-guard.mjs") --self-test
if ($LASTEXITCODE -ne 0) { throw "bash-dump-guard self-test failed." }
& node (Join-Path $HookDir "claude-hook-capability-canary.mjs") --self-test
if ($LASTEXITCODE -ne 0) { throw "capability canary self-test failed." }
& node (Join-Path $HookDir "prefix-budget.mjs") --self-test
if ($LASTEXITCODE -ne 0) { throw "prefix-budget self-test failed." }
& node (Join-Path $HookDir "read-context-guard.mjs") --self-test
if ($LASTEXITCODE -ne 0) { throw "read-context-guard self-test failed." }
& node (Join-Path $HookDir "session-economy.mjs") --self-test
if ($LASTEXITCODE -ne 0) { throw "session-economy self-test failed." }

$SettingsFile = Join-Path $ClaudeDir "settings.json"
if (Test-Path $SettingsFile) {
    $Pattern = 'rtk|squeez|snip|lowfat|omni|semtrim|quiet-bash|token-saver|nestor-lean|harnesstrim|token-crunch|agentone|output-trim'
    $Conflicts = Select-String -Path $SettingsFile -Pattern $Pattern -CaseSensitive:$false
    if ($Conflicts) {
        Write-Warning "Potential overlapping token/output owners found in $SettingsFile. Audit them before merging the hook block."
        $Conflicts | ForEach-Object { Write-Warning ("{0}:{1}" -f $_.LineNumber, $_.Line.Trim()) }
    }
}

$CapabilityFile = Join-Path $ClaudeDir "bash-dump-guard-capabilities.json"
if ($Probe) {
    if (Get-Command claude -ErrorAction SilentlyContinue) {
        & node (Join-Path $HookDir "claude-hook-capability-canary.mjs") --output $CapabilityFile
        $ProbeRc = $LASTEXITCODE
        if ($ProbeRc -ne 0) { Write-Warning "Capability probe exit $ProbeRc; auto replacement remains shadow-only unless the record contains a matching pass." }
    } else {
        Write-Warning "Claude CLI not found; live capability probe skipped."
    }
} else {
    Write-Host "Live capability probe not run. bash-dump-guard hookActivation=auto stays shadow-only until a matching canary pass exists."
}

$PrefixFile = (Join-Path $HookDir "prefix-budget.mjs").Replace("\", "/")
$ReadFile = (Join-Path $HookDir "read-context-guard.mjs").Replace("\", "/")
$SessionFile = (Join-Path $HookDir "session-economy.mjs").Replace("\", "/")
$BashFile = (Join-Path $HookDir "bash-dump-guard.mjs").Replace("\", "/")
$HookConfig = @{
    hooks = @{
        SessionStart = @(@{ hooks = @(@{ type = "command"; command = "node `"$PrefixFile`""; timeout = 20; statusMessage = "Measuring prefix budget" }) })
        PreToolUse = @(@{ matcher = "Read"; hooks = @(@{ type = "command"; command = "node `"$ReadFile`""; timeout = 15; statusMessage = "Checking Read context budget" }) })
        PostToolUse = @(
            @{ matcher = "Read"; hooks = @(@{ type = "command"; command = "node `"$ReadFile`""; timeout = 15 }) },
            @{ matcher = "Bash"; hooks = @(@{ type = "command"; command = "node `"$BashFile`""; timeout = 15; statusMessage = "Evaluating Bash output budget" }) }
        )
        Stop = @(@{ hooks = @(@{ type = "command"; command = "node `"$SessionFile`""; timeout = 20 }) })
        PreCompact = @(@{ hooks = @(
            @{ type = "command"; command = "node `"$ReadFile`""; timeout = 10 },
            @{ type = "command"; command = "node `"$SessionFile`""; timeout = 20 }
        ) })
        SessionEnd = @(@{ hooks = @(
            @{ type = "command"; command = "node `"$ReadFile`""; timeout = 10 },
            @{ type = "command"; command = "node `"$SessionFile`""; timeout = 20 }
        ) })
    }
}

Write-Host ""
Write-Host "Installed Revision-3 files. Merge this block into $SettingsFile:"
$HookConfig | ConvertTo-Json -Depth 12
Write-Host ""
Write-Host "Do not keep a second mutating Bash owner or a second mutating Read owner."
Write-Host "Prefix report: node `"$PrefixFile`" --report"
Write-Host "Read status: node `"$ReadFile`" --status"
Write-Host "Session status: node `"$SessionFile`" --status"
Write-Host "Bash status: node `"$BashFile`" --status"
