<#
PowerShell helper to stage, commit and push the current repo to GitHub.
Usage: open PowerShell, cd to repo root and run:
  .\scripts\deploy_github_pages.ps1
#>

Param()

$cwd = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent | Split-Path -Parent
if (-not $cwd) { $cwd = Get-Location }
Set-Location $cwd

if (-not (Test-Path .git)){
  Write-Host "No git repository found. Initializing..." -ForegroundColor Yellow
  git init
  git branch -M main
}

# Show git status
git status --porcelain

# Ask for commit message
$msg = Read-Host "Commit message (leave empty to use default)"
if ([string]::IsNullOrWhiteSpace($msg)) { $msg = "site: update J_VAPES static site" }

Write-Host "Staging all changes..." -ForegroundColor Cyan
git add .

Write-Host "Committing..." -ForegroundColor Cyan
git commit -m $msg

# Ask for remote and branch
$remote = Read-Host "Remote name or URL (leave empty to use 'origin')"
if ([string]::IsNullOrWhiteSpace($remote)) { $remote = 'origin' }
$branch = Read-Host "Branch to push (leave empty for 'main')"
if ([string]::IsNullOrWhiteSpace($branch)) { $branch = 'main' }

# If remote looks like an URL, add/replace origin
if ($remote -match 'https://|git@github.com:'){
  if ((git remote | Select-String -Pattern '^origin$')){ git remote remove origin }
  git remote add origin $remote
  $remoteName = 'origin'
} else {
  $remoteName = $remote
}

Write-Host "Pushing to $remoteName/$branch..." -ForegroundColor Green
try{
  git push -u $remoteName $branch
  Write-Host "Push completed. If you haven't enabled Pages yet, go to your repository Settings -> Pages and set source to '$branch' / root." -ForegroundColor Green
} catch {
  Write-Host "Push failed: $_" -ForegroundColor Red
  Write-Host "If this is first push, consider creating the remote repo on GitHub and adding it as remote. You can use GitHub CLI: 'gh repo create'" -ForegroundColor Yellow
}

# Reminder to update sitemap base URLs
Write-Host "Remember to update 'sitemap.xml' loc entries to your published URL (e.g. https://USERNAME.github.io/REPO/)." -ForegroundColor Yellow
