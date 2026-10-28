import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
const output='holy-elixir/assets/images/campaign';
await mkdir(output,{recursive:true});
const images={
  'collection':'image.png',
  'water-terrace':'image4.png',
  'black-occasion':'image5.png',
  'ionizer-kitchen':'image11.png'
};
for(const [name,source] of Object.entries(images)) {
  for(const width of [640,1440]) {
    await sharp(`qa/ppt-reference/${source}`).resize({width,withoutEnlargement:true}).webp({quality:88}).toFile(`${output}/${name}-${width}.webp`);
  }
}
console.log('Installed four locally hosted campaign images from the supplied presentation.');
