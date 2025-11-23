Param(
    [string]$Message = ''
)

function Prompt-YN($msg) {
    $ans = Read-Host "$msg (y/n)"
    return $ans -match '^[Yy]'
}

try {
    $current = git rev-parse --abbrev-ref HEAD 2>$null
} catch {
    Write-Host '错误：当前目录不是 git 仓库或 git 未安装。' -ForegroundColor Red
    exit 1
}

Write-Host "当前分支: $current"

if (-not $Message) {
    $Message = Read-Host '请输入 commit message（回车取消）'
    if (-not $Message) { Write-Host '已取消。'; exit 0 }
}

git add -A
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host 'commit 失败，可能没有变更或提交被中止。' -ForegroundColor Yellow
} else {
    git push origin $current
}

if (Prompt-YN '是否将当前分支合并到 main 并推送？') {
    git checkout main
    git pull origin main
    git merge --ff-only $current
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'fast-forward 合并失败，请手动处理冲突或使用交互式合并。' -ForegroundColor Red
        exit 1
    }
    git push origin main
    Write-Host "已将 $current 合并并推送到 main。"
} else {
    Write-Host '仅完成 commit 与 push（如已执行）。'
}
