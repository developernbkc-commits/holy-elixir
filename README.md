# Holy Elixir website

The deployable website is in `holy-elixir/`. It contains local CSS, JavaScript, WebP images and WOFF2 fonts. It needs no runtime packages, third-party CDN requests, build server or API. Netlify publishes the prebuilt folder directly. External editorial links are optional reading, not loading dependencies.

Preview with `python -m http.server 5181 --directory holy-elixir`, then open `http://localhost:5181`.

## Optional maintenance tools

The root `package.json` and lockfile contain development tools only. To regenerate utility CSS after adding or changing Tailwind classes, run `npm ci` and `npm run build`. Commit `holy-elixir/assets/site.css` with the source changes. Netlify does not install these tools or rebuild the site.

Fonts are self-hosted from the Fontsource packages. Their licenses are in `holy-elixir/assets/fonts/`. `node scripts/bundle-fonts.mjs` refreshes these vendored font files. Existing custom layout, navigation, carousel and FAQ behavior use local CSS and native JavaScript/HTML.

Run `python scripts/check-site.py` for static link, asset and dependency checks. See `docs/image-edit.md` for the updated product artwork and its prompt. Product specifications and physical label approval remain a separate business review.

The staging lifestyle collection lives in `holy-elixir/assets/images/lifestyle/`. Ten selected photorealistic AI-generated scenes are provided at 640px and 1440px widths; the brand-supplied actual Black Drink packaging photograph is also stored locally. Final generation and corrective edit prompts are in `docs/lifestyle-image-prompts.json`. Earlier glossy variants are not used by the site. To rebuild the WebP variants, run `node scripts/install-lifestyle-images.mjs <manifest.json>` with an `images` map of names to local source PNG paths and an `actualPackaging` source path. The manifest is local input and is not needed by the deployed website.

The current staging collection is version 2 in `holy-elixir/assets/images/lifestyle-v2/`. The hero uses the actual supplied product photo. Nine revised generated scenes provide a white studio setting plus varied indoor/outdoor venues. Review all ten images at `imagery.html` (marked noindex). Updated prompts are in `docs/lifestyle-image-prompts-v2.json`; the previous collection is retained as source history but is not used by current pages.
