# Holy Elixir website

The deployable website is in `holy-elixir/`. It contains local CSS, JavaScript, WebP images and WOFF2 fonts. It needs no runtime packages, third-party CDN requests, build server or API. Netlify publishes the prebuilt folder directly. External editorial links are optional reading, not loading dependencies.

Preview with `python -m http.server 5181 --directory holy-elixir`, then open `http://localhost:5181`.

## Optional maintenance tools

The root `package.json` and lockfile contain development tools only. To regenerate utility CSS after adding or changing Tailwind classes, run `npm ci` and `npm run build`. Commit `holy-elixir/assets/site.css` with the source changes. Netlify does not install these tools or rebuild the site.

Fonts are self-hosted from the Fontsource packages. Their licenses are in `holy-elixir/assets/fonts/`. `node scripts/bundle-fonts.mjs` refreshes these vendored font files. Existing custom layout, navigation, carousel and FAQ behavior use local CSS and native JavaScript/HTML.

Run `python scripts/check-site.py` for static link, asset and dependency checks. See `docs/image-edit.md` for the updated product artwork and its prompt. Product specifications and physical label approval remain a separate business review.
