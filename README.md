# Finance
Fiance programs
This repostory contains all the small finance projects I have created.

## Loan calculator — deploy online

**GitHub Pages (recommended)**  
Push this repo to GitHub. In the repo: **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**. The workflow [`.github/workflows/deploy-loan-calculator.yml`](.github/workflows/deploy-loan-calculator.yml) publishes the `loan_calculator/` folder. After the first successful run, open the URL shown under **Actions** (or **Settings → Pages**), typically `https://<user>.github.io/<repo>/`.

**Cloudflare Pages (CLI)**  
From `loan_calculator/`, create an [API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) with **Account → Cloudflare Pages → Edit**, then in PowerShell:

```powershell
$env:CLOUDFLARE_API_TOKEN = "<paste-token>"
npm run deploy:cloudflare
```
