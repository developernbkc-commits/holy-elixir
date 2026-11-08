# Holy Elixir website

The deployable website is in `holy-elixir/`. It contains local CSS, JavaScript, WebP images and WOFF2 fonts. It needs no runtime packages, third-party CDN requests, build server or API. Netlify publishes the prebuilt folder directly. External editorial links are optional reading, not loading dependencies.

Preview with `python -m http.server 5181 --directory holy-elixir`, then open `http://localhost:5181`.

## Optional maintenance tools

The root `package.json` and lockfile contain development tools only. To regenerate utility CSS after adding or changing Tailwind classes, run `npm ci` and `npm run build`. Commit `holy-elixir/assets/site.css` with the source changes. Netlify does not install these tools or rebuild the site.

Fonts are self-hosted from the Fontsource packages. Their licenses are in `holy-elixir/assets/fonts/`. `node scripts/bundle-fonts.mjs` refreshes these vendored font files. Existing custom layout, navigation, carousel and FAQ behavior use local CSS and native JavaScript/HTML.

Run `python scripts/check-site.py` for static link, asset and dependency checks. See `docs/image-edit.md` for the updated product artwork and its prompt. Product specifications and physical label approval remain a separate business review.

The staging lifestyle collection lives in `holy-elixir/assets/images/lifestyle/`. Ten selected photorealistic AI-generated scenes are provided at 640px and 1440px widths; the brand-supplied actual Black Drink packaging photograph is also stored locally. Final generation and corrective edit prompts are in `docs/lifestyle-image-prompts.json`. Earlier glossy variants are not used by the site. To rebuild the WebP variants, run `node scripts/install-lifestyle-images.mjs <manifest.json>` with an `images` map of names to local source PNG paths and an `actualPackaging` source path. The manifest is local input and is not needed by the deployed website.

The catalogue has two families: Zubrex Black Drink and home water ionizers. The site has 16 public pages, a noindex imagery review and a custom 404 page. The seasonal homepage opens with the Diwali greeting and family scene, followed by routes into the catalogue, serving and label guides, hospitality and trade. The evergreen homepage opens with the actual Black Drink pack, which also has a photograph viewer on its product page. The blue-pack line is temporarily off the site; its artwork is preserved under `archive/blue-product/` and its old URLs redirect to the collection.

Edit shared and interior-page content in `scripts/build-pages.py` or the homepage in `templates/signature-home.html`, then run `python scripts/build-pages.py` to regenerate the HTML, local search index and sitemap. The design uses `holy-elixir/premium.css`, `refinements.css`, `signature.css`, `assets/fonts.css` and `script.js`. The old notice and rotating homepage are absent; previous styles are retained outside the publish folder. Search and page interactions run locally without extra runtime dependencies.

The branch named `staging` is connected to production at https://holy-elixir.com/. Review changes on a separate preview branch and publish them only with explicit user approval. See `docs/brand-assets.md` for the Samvida Labs footer logo and Zubrex favicon provenance.

For the local seasonal build and poster replacement, see `docs/diwali-preview.md`.
