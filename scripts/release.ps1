# 词环 LexiLoop 发布脚本 (Windows PowerShell)
# 用法: .\scripts\release.ps1 -Version "1.0.0"

param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 开始发布版本 v$Version" -ForegroundColor Green

# 检查工作区是否干净
$status = git status --porcelain
if ($status) {
    Write-Host "❌ 错误: 工作区有未提交的更改，请先提交或暂存" -ForegroundColor Red
    git status --short
    exit 1
}

# 更新 package.json 版本
Write-Host "📝 更新 package.json 版本..." -ForegroundColor Cyan
npm version $Version --no-git-tag-version

# 更新 tauri.conf.json 版本
Write-Host "📝 更新 tauri.conf.json 版本..." -ForegroundColor Cyan
$configPath = "src-tauri\tauri.conf.json"
$config = Get-Content $configPath -Raw
$config = $config -replace '"version":\s*"[^"]*"', "`"version`": `"$Version`""
Set-Content $configPath -Value $config

# 提交更改
Write-Host "💾 提交版本更新..." -ForegroundColor Cyan
git add package.json package-lock.json src-tauri\tauri.conf.json
git commit -m "chore: bump version to $Version"

# 创建 tag
Write-Host "🏷️  创建 tag v$Version..." -ForegroundColor Cyan
git tag -a "v$Version" -m "Release v$Version"

# 推送到远程
Write-Host "📤 推送到远程仓库..." -ForegroundColor Cyan
git push origin main
git push origin "v$Version"

Write-Host ""
Write-Host "✅ 发布完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📦 GitHub Actions 将自动构建以下平台的安装包：" -ForegroundColor Yellow
Write-Host "   - Windows (x64)"
Write-Host "   - macOS (Apple Silicon + Intel)"
Write-Host "   - Linux (x64)"
Write-Host ""
Write-Host "🔗 查看构建进度: https://github.com/yezihack/lexiloop/actions" -ForegroundColor Cyan
Write-Host "🔗 查看 Release: https://github.com/yezihack/lexiloop/releases/tag/v$Version" -ForegroundColor Cyan
