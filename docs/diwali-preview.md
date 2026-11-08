# Diwali hero

The seasonal build keeps the current catalogue, navigation and Samvida Labs footer. Its homepage retains the greeting, family scene, Zubrex logo and ornaments from the supplied `Zubrex_Diwali_Website_Hero.html`. The fragment is in `templates/diwali-hero.html`; `styles/diwali.css` styles the hero and `holy-elixir/festival-surfaces.css` carries the palette and rounded surfaces through the site. The local WebP variants preserve the artwork and aspect ratio. A small pointer-driven tilt runs only for fine pointers when reduced motion is off.

```sh
python scripts/build-pages.py --diwali-preview
python scripts/check-site.py qa/diwali-preview
python -m http.server 5186 --bind 127.0.0.1 --directory qa/diwali-preview
```

Open `http://127.0.0.1:5186/`. The local preview writes only to the ignored `qa/diwali-preview/` folder and is marked noindex. The regular build writes the current seasonal candidate into `holy-elixir/` for Netlify. Set `DIWALI_LIVE` in `scripts/build-pages.py` to `False` and rebuild to return to the evergreen layout. Neither build deploys the site.

To preview an alternate standalone poster, use a JPG, PNG or WebP and an accurate text alternative:

```sh
python scripts/build-pages.py --diwali-preview --poster "path/to/poster.png" --poster-alt "Describe the poster and its essential text here."
```

The alternate poster stays in the local preview. The supplied hero shows the complete family scene without cropping and stacks the greeting above the artwork at widths up to 780px.
