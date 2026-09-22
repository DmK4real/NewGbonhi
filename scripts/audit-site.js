import fs from 'node:fs';
import path from 'node:path';
import { parse as parseSfc } from '@vue/compiler-sfc';
import { parse } from '@vue/compiler-dom';
const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf8'));
const routes = new Set(['/', '/collections', '/studio', '/checkout', '/orders', '/lookbook', '/lab', '/lab/arw-studio', '/about', '/cgu', '/confidentialite', ...products.map(p => `/product/${p.slug}`)]);
const files = fs.readdirSync('src', { recursive: true }).filter(f => f.endsWith('.vue')).map(f => path.join('src', f));
const errors = [];
let images = 0, links = 0;
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const template = parseSfc(source).descriptor.template?.content;
  if (!template) continue;
  const visit = node => {
    if (node.type === 1) {
      const prop = name => node.props.find(p => p.type === 6 && p.name === name);
      const bound = name => node.props.find(p => p.type === 7 && p.name === 'bind' && p.arg?.content === name);
      if (node.tag === 'img') {
        images++;
        if (!prop('alt') && !bound('alt')) errors.push(`${file}: image without alt`);
      }
      for (const name of ['to', 'href', 'src']) {
        const value = prop(name)?.value?.content;
        if (!value?.startsWith('/') || value.startsWith('//')) continue;
        links++;
        const target = value.split(/[?#]/)[0];
        if (!routes.has(target) && !fs.existsSync(path.join('public', target))) errors.push(`${file}: broken ${name} ${value}`);
      }
    }
    for (const child of node.children || []) visit(child);
  };
  visit(parse(template));
  for (const match of source.matchAll(/new URL\(\s*["']([^"']+)["']\s*,\s*import.meta.url/g)) {
    if (!fs.existsSync(path.resolve(path.dirname(file), match[1]))) errors.push(`${file}: missing asset ${match[1]}`);
  }
}
for (const file of ['favicon.ico', 'favicon-32x32.png', 'apple-touch-icon.png', 'social-share.jpg', 'robots.txt', 'sitemap.xml', 'sitemap-main.xml']) {
  if (!fs.existsSync(`public/${file}`)) errors.push(`Missing public/${file}`);
}
for (const match of fs.readFileSync('public/sitemap-main.xml', 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)) {
  const target = new URL(match[1]).pathname;
  if (!routes.has(target) || ['/studio', '/checkout', '/orders'].includes(target)) errors.push(`Invalid sitemap route: ${target}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Static audit passed: ${files.length} Vue files, ${images} image alt attributes, ${links} static internal references, public SEO assets and sitemap routes. Dynamic links and external services require runtime verification.`);
