# Zubrex premium website preview

The redesign follows the visual direction in the user-supplied `Zubrex_Proposal_Visual.pptx`: midnight navy, cobalt, restrained warm gold, light stone backgrounds and dramatic product scenes. It uses the existing Zubrex logo. The proposal’s pricing, supplier commitments, schedules and ordering-system mockups are not website instructions or customer-facing product facts.

## Structure

17 public pages: Home; Collection; Alkaline Water; Black Drink; Ionizers; Our Perspective; Everyday Journal; Serving Notes; Reading Your Label; Collection Guide; pH & Product Clarity; FAQ; Hospitality & Events; Trade & Partnerships; Contact; Privacy Notice; Website Notes.

The separate imagery review and custom 404 page are marked noindex. Grouped navigation, a full footer, breadcrumbs, comparison links, article recommendations and contextual enquiry links connect the pages. Search uses a local index of public page titles, descriptions and categories. There is no checkout, payment collection, subscription or order-status system. The enquiry form opens an email draft for the visitor to review and send.

## Artwork and content

Four concept artworks were extracted from the supplied deck, converted to WebP at 640px and up to 1440px, and stored in `holy-elixir/assets/images/campaign/`:

| Asset | Source | Use |
| --- | --- | --- |
| collection | Slide 1, image.png | Cinematic collection scene |
| water-terrace | Slide 5, image4.png | Everyday water concept |
| black-occasion | Slide 6, image5.png | Black Drink occasion concept |
| ionizer-kitchen | Slide 11, image11.png | Home ionizer concept |

The deck describes its scenes as concepts. Product-family pages identify the artwork accordingly; the Black Drink page also displays the actual supplied 500 ml pack photograph. Current physical labels and model-specific documentation take precedence over illustrative artwork. No new certifications, availability guarantees, prices, ingredient concentrations, appliance specifications or medical outcomes have been invented. The general pH explanation links to the USGS Water Science School, reviewed 28 October 2026.

Selected previously generated lifestyle images are used for the journal, dining, serving and hospitality scenes. The existing local image history is retained; the new design does not need the unused legacy stylesheets or imagery at runtime.

## Motion and accessibility

The homepage creates a video-like presentation from local stills: crossfades, slow image movement and a subtle light pass. It does not load a video player or claim to be product footage. Scene selectors and a pause control are keyboard operable. Automatic scene changes stop while controls have focus or the document is hidden. The OS reduced-motion preference disables scene rotation, CSS animations, smooth scrolling and scroll reveals. The fixed update notice has its own pause control and becomes static readable text with reduced motion.

Native disclosure menus and FAQ answers work without JavaScript. A skip link, visible focus states, labelled inputs, native modal search and descriptive image alternatives support navigation. Search uses text nodes to render results rather than interpolating query HTML.

## Maintenance

Edit content and shared HTML in `scripts/build-pages.py`, run `python scripts/build-pages.py`, and commit the generated HTML, local search index and sitemap. Edit `holy-elixir/premium.css`, `holy-elixir/refinements.css` and `holy-elixir/script.js` directly. No template engine, framework, CDN or runtime package is required. `scripts/install-campaign-images.mjs` can regenerate optimized images when the extracted source files are supplied under the ignored `qa/ppt-reference/` directory; the sources and original deck are not needed to host the site.

Validation: `python scripts/check-site.py`, `node --check holy-elixir/script.js`, browser checks of every page at 320px, 768px and 1440px, plus interaction checks for menus, search, FAQ, motion, fixed notice and contextual enquiry selection. Preview deployment stays on `elegant-preview` and PR #10. The branch named `staging` is production-connected and must not receive this preview without separate release authorization.

## Premium refinement

The second design pass adds wide image-led desktop menus, individual product introductions with section links, framed collection photography, a manually controlled occasion selector, a staggered journal layout and a native modal viewer for the supplied Black Drink photograph. The selector supports arrow keys, Home and End; its controls stay hidden when JavaScript is unavailable, leaving the initial product story readable. The pack viewer restores focus to its trigger when closed. The ionizer uses contained images where cropping could hide the appliance.

The finish stylesheet refines buttons, card states, typography, editorial details and footer readability while retaining the existing palette, logo and fixed notice. Additional images are existing local assets. No new external dependency, product claim or automatic animation was introduced. The new content transition follows reduced-motion preferences.

Refinement validation includes all 19 pages at 320px and 1440px (38 page checks), a 768px menu check and a short 844×390 landscape menu check. No horizontal page overflow or broken loaded images were detected. Manual checks covered keyboard occasion selection, pack viewer open/close and focus restoration, mobile product navigation, section anchors, fixed notice placement and local search. The landscape menu remains scrollable when its contents exceed the screen height.

## Production release

The user authorized the production release on 28 October 2026. The final branding includes the existing Samvida Labs logo beside the footer credit and the existing Zubrex gold Z as the favicon, with SVG, PNG, ICO and Apple touch variants. See `brand-assets.md` for provenance. The branch named `staging` remains the production branch; subsequent production releases still require user approval.
