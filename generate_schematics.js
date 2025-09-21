const fs = require('fs');
const path = require('path');

function fmt(num) {
  if (!Number.isFinite(num)) return '0';
  const rounded = Math.round(num * 100) / 100;
  if (Object.is(rounded, -0)) return '0';
  return rounded.toString();
}

function classify(id) {
  const name = id.toLowerCase();
  if (/(round|circle|ø)/.test(name) && /(table|hightop|coffee|dining)/.test(name)) return 'round-table';
  if (/(table|dining|coffee|desk|workstation|communal|stand)/.test(name)) return 'square-table';
  if (/(chair|stool|seat)/.test(name)) return 'chair';
  if (/(sofa|banquette|sectional|booth|bench)/.test(name)) return 'sofa';
  if (/(bed|bunk)/.test(name)) return 'bed';
  if (/(wardrobe|closet|shelv|cabinet|locker)/.test(name)) return 'wardrobe';
  if (/(sink|basin|hand-sink|bath-sink)/.test(name)) return 'sink';
  if (/(cook|stove|oven|hob|range|cooktop)/.test(name)) return 'stove';
  if (/(bath|tub)/.test(name)) return 'bath';
  if (/(shower)/.test(name)) return 'shower';
  if (/(toilet|wc)/.test(name)) return 'toilet';
  if (/planter/.test(name)) return 'planter';
  if (/(plant)/.test(name)) return 'plant';
  if (/(fridge|freezer|dishwasher|washer|dryer|microwave|kitchen-line|island|oven|radiator|ac-)/.test(name)) return 'appliance';
  if (/(counter|bar|workstation|desk|reception|line)/.test(name)) return 'counter';
  if (/(queue-post|post)/.test(name)) return 'post';
  if (/(lamp)/.test(name)) return 'post';
  if (/(projector|screen|tv|menu|board|whiteboard)/.test(name)) return 'panel';
  if (/(rug|carpet)/.test(name)) return 'rug';
  if (/(partition)/.test(name)) return 'panel';
  if (/(terminal|drawer)/.test(name)) return 'equipment';
  if (/(printer|copier|server|rack|equipment)/.test(name)) return 'equipment';
  if (/(espresso|grinder|brewer|pour-over|kettle|filter|ice-machine|milk|trash|case|syrup|condiment|water|cooler|upright|undercounter)/.test(name)) return 'appliance';
  return 'generic';
}

function buildElements(id, bbox) {
  const width = bbox.width || 60;
  const height = bbox.height || 60;
  const halfW = width / 2;
  const halfH = height / 2;
  const minX = -halfW;
  const minY = -halfH;
  const maxX = halfW;
  const maxY = halfH;
  const radius = Math.min(width, height) / 2;
  const type = classify(id);
  const elements = [];

  const baseRect = (w = width, h = height, opts = {}) => {
    const x = -w / 2;
    const y = -h / 2;
    const rx = opts.rx ? ` rx="${fmt(opts.rx)}"` : '';
    const cls = opts.className || 'shape shape-fill';
    return `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(w)}" height="${fmt(h)}"${rx} class="${cls}"/>`;
  };

  const centerLineV = `<line x1="0" y1="${fmt(minY)}" x2="0" y2="${fmt(maxY)}" class="furn-center"/>`;
  const centerLineH = `<line x1="${fmt(minX)}" y1="0" x2="${fmt(maxX)}" y2="0" class="furn-center"/>`;

  switch (type) {
    case 'round-table': {
      elements.push(`<circle cx="0" cy="0" r="${fmt(radius)}" class="shape shape-fill"/>`);
      elements.push(centerLineV);
      elements.push(centerLineH);
      break;
    }
    case 'square-table': {
      elements.push(baseRect(undefined, undefined, {rx: Math.min(width, height) * 0.08}));
      elements.push(centerLineV);
      elements.push(centerLineH);
      break;
    }
    case 'chair': {
      const seatW = Math.min(width * 0.7, height * 0.9);
      const seatH = Math.min(height * 0.7, width * 0.9);
      elements.push(baseRect(seatW, seatH, {rx: Math.min(seatW, seatH) * 0.2}));
      elements.push(centerLineV);
      break;
    }
    case 'sofa': {
      elements.push(baseRect(width, height, {rx: Math.min(width, height) * 0.12}));
      elements.push(`<line x1="${fmt(0)}" y1="${fmt(minY)}" x2="${fmt(0)}" y2="${fmt(maxY)}" class="furn-center"/>`);
      const cushionH = height * 0.5;
      elements.push(`<rect x="${fmt(minX + width * 0.05)}" y="${fmt(-cushionH / 2)}" width="${fmt(width * 0.9)}" height="${fmt(cushionH)}" class="shape"/>`);
      break;
    }
    case 'bed': {
      elements.push(baseRect(width, height, {rx: Math.min(width, height) * 0.1}));
      const pillowW = width * 0.75;
      const pillowH = height * 0.22;
      const pillowY = minY + pillowH / 2 + height * 0.05;
      elements.push(`<rect x="${fmt(-pillowW / 2)}" y="${fmt(pillowY - pillowH / 2)}" width="${fmt(pillowW)}" height="${fmt(pillowH)}" rx="${fmt(pillowH * 0.4)}" class="shape"/>`);
      elements.push(centerLineV);
      break;
    }
    case 'wardrobe': {
      elements.push(baseRect(width, height));
      elements.push(`<rect x="${fmt(-width * 0.05)}" y="${fmt(minY)}" width="${fmt(width * 0.1)}" height="${fmt(height)}" class="shape"/>`);
      break;
    }
    case 'sink': {
      elements.push(baseRect(width, height, {rx: Math.min(width, height) * 0.15}));
      elements.push(`<circle cx="0" cy="0" r="${fmt(radius * 0.35)}" class="shape"/>`);
      elements.push(`<circle cx="0" cy="${fmt(minY + height * 0.25)}" r="${fmt(Math.min(width, height) * 0.08)}" class="shape"/>`);
      break;
    }
    case 'stove': {
      elements.push(baseRect(width, height));
      const burnerR = Math.min(width, height) * 0.18;
      const offsetX = width * 0.3;
      const offsetY = height * 0.3;
      [-1, 1].forEach(ix => {
        [-1, 1].forEach(iy => {
          elements.push(`<circle cx="${fmt(ix * offsetX)}" cy="${fmt(iy * offsetY)}" r="${fmt(burnerR)}" class="shape"/>`);
        });
      });
      break;
    }
    case 'bath': {
      const rx = Math.min(width, height) * 0.25;
      elements.push(baseRect(width, height, {rx}));
      elements.push(`<ellipse cx="0" cy="0" rx="${fmt(width * 0.4)}" ry="${fmt(height * 0.38)}" class="shape"/>`);
      elements.push(`<circle cx="${fmt(width * 0.3)}" cy="0" r="${fmt(Math.min(width, height) * 0.08)}" class="shape"/>`);
      break;
    }
    case 'shower': {
      elements.push(baseRect(width, height, {rx: Math.min(width, height) * 0.1}));
      elements.push(`<circle cx="0" cy="0" r="${fmt(radius * 0.35)}" class="shape"/>`);
      elements.push(`<line x1="${fmt(-radius * 0.6)}" y1="${fmt(-radius * 0.6)}" x2="${fmt(radius * 0.6)}" y2="${fmt(radius * 0.6)}" class="shape"/>`);
      break;
    }
    case 'toilet': {
      const seatRx = width * 0.3;
      const seatRy = height * 0.35;
      elements.push(`<ellipse cx="0" cy="0" rx="${fmt(seatRx)}" ry="${fmt(seatRy)}" class="shape shape-fill"/>`);
      const tankW = width * 0.55;
      const tankH = height * 0.25;
      const tankY = seatRy + tankH / 2;
      elements.push(`<rect x="${fmt(-tankW / 2)}" y="${fmt(tankY - tankH / 2)}" width="${fmt(tankW)}" height="${fmt(tankH)}" class="shape"/>`);
      break;
    }
    case 'plant': {
      const potR = Math.min(width, height) * 0.4;
      elements.push(`<circle cx="0" cy="0" r="${fmt(potR)}" class="shape shape-fill"/>`);
      elements.push(`<path d="M0 ${fmt(-potR)} C${fmt(potR * 0.7)} ${fmt(-potR * 0.2)} ${fmt(potR * 0.4)} ${fmt(potR * 0.8)} 0 ${fmt(potR)}" class="shape" fill="none"/>`);
      break;
    }
    case 'planter': {
      elements.push(baseRect(width, height, {rx: Math.min(width, height) * 0.2}));
      const positions = [-width * 0.3, 0, width * 0.3];
      positions.forEach(offset => {
        const tipX = offset * 0.4;
        const tipY = -height * 0.45;
        elements.push(`<path d="M${fmt(offset)} 0 Q${fmt(offset)} ${fmt(-height * 0.25)} ${fmt(tipX)} ${fmt(tipY)}" class="shape" fill="none"/>`);
      });
      break;
    }
    case 'appliance': {
      elements.push(baseRect(width, height));
      const panelH = height * 0.35;
      elements.push(`<rect x="${fmt(-width * 0.35)}" y="${fmt(-panelH / 2)}" width="${fmt(width * 0.7)}" height="${fmt(panelH)}" class="shape"/>`);
      break;
    }
    case 'rug': {
      elements.push(baseRect(width, height, {rx: Math.min(width, height) * 0.15}));
      elements.push(`<rect x="${fmt(-width * 0.4)}" y="${fmt(-height * 0.4)}" width="${fmt(width * 0.8)}" height="${fmt(height * 0.8)}" class="shape"/>`);
      break;
    }
    case 'counter': {
      elements.push(baseRect(width, height));
      elements.push(centerLineH);
      break;
    }
    case 'post': {
      elements.push(`<circle cx="0" cy="0" r="${fmt(radius)}" class="shape shape-fill"/>`);
      elements.push(centerLineV);
      break;
    }
    case 'panel': {
      elements.push(baseRect(width, height));
      elements.push(`<rect x="${fmt(-width * 0.42)}" y="${fmt(-height * 0.2)}" width="${fmt(width * 0.84)}" height="${fmt(height * 0.4)}" class="shape"/>`);
      break;
    }
    case 'equipment': {
      elements.push(baseRect(width, height));
      elements.push(`<rect x="${fmt(-width * 0.3)}" y="${fmt(-height * 0.25)}" width="${fmt(width * 0.6)}" height="${fmt(height * 0.5)}" class="shape"/>`);
      break;
    }
    default: {
      const fallbackSize = 30;
      elements.push(`<rect x="${fmt(-fallbackSize / 2)}" y="${fmt(-fallbackSize / 2)}" width="${fmt(fallbackSize)}" height="${fmt(fallbackSize)}" class="shape shape-fill"/>`);
      elements.push(`<line x1="0" y1="${fmt(-fallbackSize / 2)}" x2="0" y2="${fmt(fallbackSize / 2)}" class="furn-center"/>`);
      break;
    }
  }
  return elements;
}

(async () => {
  const {createSVGWindow} = await import('svgdom');
  const svgjs = await import('@svgdotjs/svg.js');
  const {SVG, registerWindow} = svgjs;
  const filePath = path.resolve('templates.js');
  const source = fs.readFileSync(filePath, 'utf8');
  const patchHeader = '// Auto-generated schematic variants\n';
  const headerIdx = source.indexOf(patchHeader.trim());
  const baseSource = headerIdx >= 0 ? source.slice(0, headerIdx).trimEnd() : source.replace(/\s*$/, '');

  const mod = new Function(`${baseSource}; return ITEM_TEMPLATES;`);
  const templates = mod();
  const blocks = [];

  for (const [id, tpl] of Object.entries(templates)) {
    if (!tpl || typeof tpl.svg !== 'function' || typeof tpl.schematicSvg === 'function') continue;
    const markup = tpl.svg();
    const window = createSVGWindow();
    const document = window.document;
    registerWindow(window, document);
    const draw = svgjs.SVG(document.documentElement);
    draw.svg(`<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`);
    const core = draw.findOne('.core');
    if (!core) continue;
    const bbox = core.bbox();
    const elements = buildElements(id, bbox);
    const inner = elements.map(el => `        ${el}`).join('\n');
    const block = `if (ITEM_TEMPLATES['${id}'] && !ITEM_TEMPLATES['${id}'].schematicSvg) {\n  ITEM_TEMPLATES['${id}'].schematicSvg = () => \`\n    <g class="core schematic-only" data-id="${id}">\n${inner}\n    </g>\n  \`;\n}\n`;
    blocks.push(block);
  }

  const patchContent = patchHeader + blocks.join('\n');
  fs.writeFileSync('templates.schematic.patch.js', patchContent);

  fs.writeFileSync(filePath, `${baseSource}\n\n${patchContent}`);
})();
