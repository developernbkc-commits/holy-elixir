# Diwali hero

The seasonal build keeps the navigation, update notice, product names and Samvida Labs footer. Its homepage uses the supplied `Zubrex_Diwali_Website_Hero.html` design: the greeting, family scene, Zubrex logo and ornaments. The reviewed fragment is in `templates/diwali-hero.html`, with scoped CSS in `styles/diwali.css`. The two embedded images were extracted as local files; smaller WebP variants keep the same artwork and aspect ratio for narrower screens.

```sh
python scripts/build-pages.py --diwali-preview
python scripts/check-site.py qa/diwali-preview
python -m http.server 5186 --bind 127.0.0.1 --directory qa/diwali-preview
```

Open `http://127.0.0.1:5186/`. The preview writes only to the ignored `qa/diwali-preview/` folder and is marked noindex. The regular build writes the release pages into `holy-elixir/` for Netlify. `DIWALI_LIVE` in `scripts/build-pages.py` controls the seasonal release: set it to `False` and rerun `python scripts/build-pages.py` to prepare the evergreen layout for a future release.

To preview an alternate standalone poster, use a JPG, PNG or WebP and an accurate text alternative:

```sh
python scripts/build-pages.py --diwali-preview --poster "path/to/poster.png" --poster-alt "Describe the poster and its essential text here."
```

The alternate poster stays in the local preview. The published hero shows the complete family scene without cropping and stacks the greeting above the artwork at widths up to 900px.
