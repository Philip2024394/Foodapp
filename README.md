## Sitemap
- See `docs/sitemap.md` for multi-app routes covering Customer, Vendor, Admin, Delivery, and Support.
- Paths use kebab-case and app namespaces (e.g., `/admin/vendors`, `/vendor/orders`).
### Auth Health Component
- Import and render `components/common/AuthHealth.tsx` anywhere (e.g., in `Landing` page) to verify client connectivity and session status.

### Users Schema Check
- PowerShell:
```
$env:APPWRITE_USERS_NAME='Users'
npx ts-node --esm scripts/checkUsersSchema.ts
```
- Outputs required attributes for the `Users` collection so you can align your signup UI.
## Appwrite Setup
- Endpoint: set `VITE_APPWRITE_ENDPOINT` (e.g., `https://syd.cloud.appwrite.io/v1`).
- Project: set `VITE_APPWRITE_PROJECT_ID`.
- Database: set `VITE_APPWRITE_DATABASE_ID`.
- Bucket: set `VITE_APPWRITE_IMAGES_BUCKET_ID` (default `692af3f00015cc5be040`).
- Server API key: set `APPWRITE_API_KEY` (Databases+Storage write).

### Migration Scripts
- Dry-run:
   - `npx ts-node --esm scripts/migrateImages.ts` with `DRY_RUN=true`.
- Full run:
   - `npx ts-node --esm scripts/migrateImages.ts` with `DRY_RUN=false`.
- Report:
   - `npx ts-node --esm scripts/reportImageMigration.ts` to see coverage and missing docs.

### PowerShell Example
```
$env:VITE_APPWRITE_ENDPOINT='https://syd.cloud.appwrite.io/v1'
$env:VITE_APPWRITE_PROJECT_ID='<PROJECT_ID>'
$env:VITE_APPWRITE_DATABASE_ID='<DATABASE_ID>'
$env:VITE_APPWRITE_IMAGES_BUCKET_ID='692af3f00015cc5be040'
$env:APPWRITE_API_KEY='<SERVER_API_KEY>'
$env:DRY_RUN='true'
npx ts-node --esm scripts/migrateImages.ts
```
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1G-MRpVSNe9s37yQQ2O_JTs1bnqkfQfFu

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
