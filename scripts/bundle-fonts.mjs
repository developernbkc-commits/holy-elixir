import fs from 'node:fs/promises';
const folder = 'holy-elixir/assets/fonts';
await fs.mkdir(folder, { recursive: true });
let css = '/* Self-hosted fonts. Licenses are stored alongside these files. */\n';
for (const [name, family, weights] of [['lato', 'Lato', [400, 700]], ['playfair-display', 'Playfair Display', [400, 600, 700]]]) {
  for (const weight of weights) {
    const file = `${name}-latin-${weight}-normal.woff2`;
    await fs.copyFile(`node_modules/@fontsource/${name}/files/${file}`, `${folder}/${file}`);
    css += `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url('./fonts/${file}') format('woff2')}\n`;
  }
  await fs.copyFile(`node_modules/@fontsource/${name}/LICENSE`, `${folder}/${name}-LICENSE.txt`);
}
await fs.writeFile('holy-elixir/assets/fonts.css', css);
for (const file of await fs.readdir('holy-elixir')) {
  if (!file.endsWith('.html')) continue;
  const path = `holy-elixir/${file}`;
  let html = await fs.readFile(path, 'utf8');
  html = html.replace(/\s*<!-- Google Fonts -->\s*<link href="https:\/\/fonts.googleapis.com[^>]+>/g, '\n    <link rel="stylesheet" href="assets/fonts.css" />');
  if (!html.includes('rel="preload" href="assets/fonts/lato-latin-400-normal.woff2"')) {
    html = html.replace('    <link rel="stylesheet" href="assets/fonts.css" />', '    <link rel="stylesheet" href="assets/fonts.css" />\n    <link rel="preload" href="assets/fonts/lato-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />');
  }
  await fs.writeFile(path, html);
}
