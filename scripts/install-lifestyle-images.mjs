import fs from 'node:fs/promises';
import sharp from 'sharp';

const manifestPath = process.argv[2] || 'qa/lifestyle-sources.json';
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const output = manifest.outputFolder || 'holy-elixir/assets/images/lifestyle';
await fs.mkdir(output, { recursive: true });
for (const [name, source] of Object.entries(manifest.images)) {
  for (const width of [640, 1440]) {
    await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 85 }).toFile(`${output}/${name}-${width}.webp`);
  }
}
await sharp(manifest.actualPackaging)
  .resize({ height: 1100, withoutEnlargement: true }).webp({ quality: 90 })
  .toFile(`${output}/black-drink-actual.webp`);

console.log('Installed local responsive lifestyle assets and actual packaging photograph.');
