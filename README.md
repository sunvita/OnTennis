# Tennis draw builder

Installable web app (PWA) that builds tennis rosters and draw sheets, records scores, and suggests player levels.
Korean and English are supported in the app and in the generated sheet.

## Files
- `index.html`: the whole app (HTML, CSS, JavaScript, embedded images)
- `config.js`: Supabase project URL and publishable key. Empty values keep data only on the device.
- `manifest.webmanifest`, `sw.js`, `icons/`: PWA install and offline support
- `supabase/schema.sql`: database tables and access rules (run once in the Supabase SQL editor)
- `netlify.toml`: Netlify publish settings

## Deploy
Connect this repository to Netlify (Add new site, Import an existing project, choose GitHub). No build command is needed. Every push to `main` redeploys.

## Data
Players, settings, match results, level changes, and saved draws are stored in Supabase.
The current access rules are for testing and let anyone with the link read and write. Add operator login before wider use.
