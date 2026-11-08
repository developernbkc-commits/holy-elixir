# Diwali preview

The seasonal preview starts from the live Zubrex design. It keeps the navigation, update notice, product names and Samvida Labs footer, and adds a gold-and-plum palette and a Diwali homepage hero. The existing festive campaign concept is only a stand-in for the supplied poster.

```sh
python scripts/build-pages.py --diwali-preview
python scripts/check-site.py qa/diwali-preview
python -m http.server 5186 --bind 127.0.0.1 --directory qa/diwali-preview
```

Open `http://127.0.0.1:5186/`. The preview writes only to the ignored `qa/diwali-preview/` folder and is marked noindex. The regular build still writes the same production site.

Once the poster arrives, rebuild with the original JPG, PNG or WebP and an accurate text alternative:

```sh
python scripts/build-pages.py --diwali-preview --poster "path/to/poster.png" --poster-alt "Describe the poster and its essential text here."
```

The frame keeps the full artwork visible without placing site copy over it. Check text legibility on desktop and mobile, confirm the product name and any campaign copy printed on the poster, and optimize the image for the final release. Production publication is a separate step after review of the finished poster.
