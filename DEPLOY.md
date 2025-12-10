Deployment to GitHub Pages

This document shows safe, repeatable steps to commit the current site and publish it on GitHub Pages using PowerShell (Windows).

1) Prepare your local repo (one-time)
- If this folder is not a git repo yet:
  ```powershell
  cd 'C:\vapesssss\jvapes'
  git init
  git branch -M main
  ```
- Add a remote (use SSH or HTTPS):
  - SSH: `git remote add origin git@github.com:USERNAME/REPO.git`
  - HTTPS: `git remote add origin https://github.com/USERNAME/REPO.git`

2) Stage, commit and push the changes
- Recommended minimal flow (PowerShell):
  ```powershell
  cd 'C:\vapesssss\jvapes'
  git add .
  git commit -m "site: scaffold J_VAPES — static site and admin"
  git push -u origin main
  ```
- If you prefer `gh` (GitHub CLI) you can create the repo and push in one step:
  ```powershell
  gh repo create USERNAME/REPO --public --source=. --remote=origin --push
  ```
  (Install `gh` and authenticate before using it.)

3) Enable GitHub Pages
- Quick manual: In the repository on GitHub -> Settings -> Pages -> Source -> select `main` branch and folder `/ (root)` -> Save.
- GitHub will publish shortly (URL shown in Settings), typically at `https://USERNAME.github.io/REPO/`.

4) Update `sitemap.xml` base URLs
- `sitemap.xml` currently uses `https://your-domain-or-github-pages/jvapes/`. After you know your Pages URL, update those `<loc>` lines to the real site root (or re-generate via `admin.html` Download sitemap).

5) Optional: Use `gh-pages` branch (if you prefer a separate branch)
- Build/push approach (not necessary for plain static sites served from root):
  ```powershell
  git checkout --orphan gh-pages
  git reset --hard
  git add .
  git commit -m "deploy: gh-pages"
  git push -u origin gh-pages --force
  ```
  Then set Pages source to `gh-pages` branch.

6) Notes and authentication
- Pushing requires authentication: use SSH keys or a Personal Access Token (PAT) for HTTPS. On Windows, you can use Git Credential Manager.
- If your repo is private, GitHub Pages for private repos may require a paid plan or Actions-based deployment. For simplicity, use a public repo.

7) Quick troubleshooting
- If `git push` is rejected, run `git pull --rebase origin main` to bring local branch up-to-date, resolve conflicts, then push.
- If GitHub Pages shows 404, ensure Pages source is set and that you're publishing from the correct branch and folder.

8) Deploy helper script
- A helper PowerShell script is included at `scripts/deploy_github_pages.ps1` that stages and commits with a prompt for commit message and remote/branch.

If you want, I can:
- Fill `sitemap.xml` with absolute URLs using your GitHub Pages domain once you give it, or
- Create a GitHub Actions workflow that automatically pushes the `main` branch to Pages (not necessary for basic flow).