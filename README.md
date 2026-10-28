# Holy Elixir website

The deployable website is in `holy-elixir/`. It contains local CSS, JavaScript, WebP images and WOFF2 fonts. It needs no runtime packages, third-party CDN requests, build server or API. Netlify publishes the prebuilt folder directly. External editorial links are optional reading, not loading dependencies.

Preview with `python -m http.server 5181 --directory holy-elixir`, then open `http://localhost:5181`.

## Optional maintenance tools

The root `package.json` and lockfile contain development tools only. To regenerate utility CSS after adding or changing Tailwind classes, run `npm ci` and `npm run build`. Commit `holy-elixir/assets/site.css` with the source changes. Netlify does not install these tools or rebuild the site.

Fonts are self-hosted from the Fontsource packages. Their licenses are in `holy-elixir/assets/fonts/`. `node scripts/bundle-fonts.mjs` refreshes these vendored font files. Existing custom layout, navigation, carousel and FAQ behavior use local CSS and native JavaScript/HTML.

Run `python scripts/check-site.py` for static link, asset and dependency checks. See `docs/image-edit.md` for the updated product artwork and its prompt. Product specifications and physical label approval remain a separate business review.

The staging lifestyle collection lives in `holy-elixir/assets/images/lifestyle/`. Ten selected photorealistic AI-generated scenes are provided at 640px and 1440px widths; the brand-supplied actual Black Drink packaging photograph is also stored locally. Final generation and corrective edit prompts are in `docs/lifestyle-image-prompts.json`. Earlier glossy variants are not used by the site. To rebuild the WebP variants, run `node scripts/install-lifestyle-images.mjs <manifest.json>` with an `images` map of names to local source PNG paths and an `actualPackaging` source path. The manifest is local input and is not needed by the deployed website.

The current premium preview follows the supplied Zubrex presentation. It has 17 public pages, a noindex imagery review and a custom 404 page. Four locally hosted campaign scenes in `holy-elixir/assets/images/campaign/` complement selected lifestyle scenes. The actual supplied Black Drink pack remains on its dedicated product page. See `docs/premium-site.md` for the artwork provenance, content boundaries, navigation and animation behavior.

Edit page content and shared HTML in `scripts/build-pages.py`, then run `python scripts/build-pages.py` to regenerate the HTML, local search index and sitemap. The current design uses `holy-elixir/premium.css`, `assets/fonts.css` and `script.js`; the legacy utility styles are retained as history and are not loaded by current pages. Search and cinematic still-image motion are implemented locally without extra runtime dependencies.

The preview branch is `elegant-preview`, attached to draft PR #10 and its Netlify deploy preview. The branch named `staging` is connected to production. Do not merge or push this redesign there without explicit production release approval.
