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
Access is limited to a signed-in operator. The app uses one shared Supabase Auth user (`admin@ontennis.app`, created in the Supabase dashboard with Auto Confirm). The password can be changed in the app under Format, Admin account.

## Reading attendance screenshots
The players screen can read a KakaoTalk attendance screenshot (button "Read from image", or paste an image into the paste box).
- Preferred: the Supabase Edge Function `supabase/functions/roster-ocr` sends the image to the Anthropic API. It requires a signed-in operator and a secret named `ANTHROPIC_API_KEY` (Supabase dashboard, Edge Functions, Secrets). Optional secret `ROSTER_OCR_MODEL` overrides the model.
- Fallback: in-browser text recognition (Tesseract). It works without a key but misreads many Korean names, so every name must be checked.
