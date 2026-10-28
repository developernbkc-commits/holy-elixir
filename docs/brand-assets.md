# Production brand assets

The Samvida Labs footer uses the existing 160px transparent symbol from the local Samvida Labs email-signature brand kit. Its pixels and colours are unchanged. It is copied into `holy-elixir/assets/images/samvida-labs-symbol.png` and linked to the verified official website, https://samvidalabs.com/. The image loads locally.

The favicon uses the gold Z from the existing `assets/images/logo.webp` Zubrex logo. An SVG clip isolates the mark from the wordmark and places it on the site's navy background. It preserves the source artwork rather than substituting a font or a generated logo. `scripts/build-brand-assets.mjs` produces SVG, PNG, ICO and Apple touch variants using local Sharp tooling. The SVG embeds the source image and has no external dependency. PNG source conversion is lossless; no image-generation prompt or model is used.

Run `node scripts/build-brand-assets.mjs` to rebuild the favicon family. To reinstall the Samvida symbol, pass the original symbol file as the first argument. The installed symbol remains a normal committed asset and does not require access to the brand kit at deployment time.
