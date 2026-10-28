import {readFile, writeFile, copyFile} from 'node:fs/promises';
import sharp from 'sharp';

// Reuse approved artwork. The SVG clips the original logo to its Z symbol;
// no generated or redrawn logo is substituted.
const logo = await readFile('holy-elixir/assets/images/logo.webp');
const logoPng = await sharp(logo).png().toBuffer();
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <title>Zubrex</title>
  <rect width="64" height="64" rx="13" fill="#07182e"/>
  <svg x="6" y="4" width="52" height="56" viewBox="59 72 121 133">
    <defs><clipPath id="z-symbol"><path d="M59 72H178V108L141 122V158H154V205H59Z"/></clipPath></defs>
    <image width="440" height="293" href="data:image/png;base64,${logoPng.toString('base64')}" clip-path="url(#z-symbol)"/>
  </svg>
</svg>\n`;
await writeFile('holy-elixir/assets/favicon-zubrex.svg', svg);
await writeFile('holy-elixir/assets/favicon.svg', svg);
for (const size of [32, 192, 256]) {
  await sharp(Buffer.from(svg)).resize(size,size).png().toFile(`holy-elixir/assets/favicon-zubrex-${size}.png`);
}
await sharp(Buffer.from(svg)).resize(180,180).png().toFile('holy-elixir/assets/apple-touch-icon.png');
const png = await readFile('holy-elixir/assets/favicon-zubrex-256.png');
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1,2); ico.writeUInt16LE(1,4);
ico.writeUInt16LE(1,10); ico.writeUInt16LE(32,12);
ico.writeUInt32LE(png.length,14); ico.writeUInt32LE(22,18);
await writeFile('holy-elixir/favicon.ico', Buffer.concat([ico,png]));

const symbol = process.argv[2];
if (symbol) await copyFile(symbol,'holy-elixir/assets/images/samvida-labs-symbol.png');
console.log('Built the Zubrex Z favicon family'+(symbol?' and installed the existing Samvida Labs symbol.':'.'));
