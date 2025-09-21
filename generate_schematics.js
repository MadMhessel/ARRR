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
  if (/(round|circle)/.test(name) && /table|hightop|coffee/.test(name)) return 'round-table';
  if (/table/.test(name)) return 'square-table';
  if (/(chair|stool|seat)/.test(name)) return 'chair';
  if (/(sofa|banquette|sectional|booth|bench)/.test(name)) return 'sofa';
  if (/(bed|bunk)/.test(name)) return 'bed';
  if (/(wardrobe|closet|shelv|cabinet|locker)/.test(name)) return 'wardrobe';
  if (/(sink|basin|hand-sink|bath-sink)/.test(name)) return 'sink';
  if (/(cook|stove|oven|hob|range)/.test(name)) return 'stove';
  if (/(bath|tub)/.test(name)) return 'bath';
  if (/(shower)/.test(name)) return 'shower';
  if (/(toilet|wc)/.test(name)) return 'toilet';
  if (/(plant|planter)/.test(name)) return 'plant';
  if (/(fridge|freezer|dishwasher|washer|dryer|microwave|kitchen-line|island)/.test(name)) return 'appliance';
  if (/(counter|bar)/.test(name)) return 'counter';
  if (/(rug|carpet)/.test(name)) return 'rug';
  if (/(queue-post|post)/.test(name)) return 'post';
  if (/(projector|screen|tv|menu|board|whiteboard)/.test(name)) return 'panel';
  if (/(printer|copier|server|rack)/.test(name)) return 'equipment';
  if (/(espresso|grinder|brewer|pour-over|kettle|filter|ice-machine|fridge|freezer|milk|trash|case|syrup|condiment|water|cooler)/.test(name)) return 'appliance';
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
  const cx = 0;
  const cy = 0;
  const radius = Math.min(width, height) / 2;
  const type = classify(id);
  const elements = [];
  const baseRect = `<rect x="${fmt(minX)}" y="${fmt(minY)}" width="${fmt(width)}" height="${fmt(height)}" class="shape shape-fill"/>`;
  const centerLineV = `<line x1="${fmt(cx)}" y1="${fmt(minY)}" x2="${fmt(cx)}" y2="${fmt(maxY)}" class="furn-center"/>`;
  const centerLineH = `<line x1="${fmt(minX)}" y1="${fmt(cy)}" x2="${fmt(maxX)}" y2="${fmt(cy)}" class="furn-center"/>`;

  switch (type) {
    case 'round-table': {
      elements.push(`<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(radius)}" class="shape shape-fill"/>`);
      elements.push(centerLineV);
      elements.push(centerLineH);
      break;
    }
    case 'square-table': {
      elements.push(baseRect);
      elements.push(centerLineV);
      elements.push(centerLineH);
      break;
    }
    case 'chair': {
      elements.push(baseRect);
      elements.push(`<rect x="${fmt(-width * 0.3)}" y="${fmt(-height * 0.2)}" width="${fmt(width * 0.6)}" height="${fmt(height * 0.4)}" class="shape"/>`);
      elements.push(centerLineV);
      break;
    }
    case 'sofa': {
      elements.push(baseRect);
      elements.push(`<rect x="${fmt(minX + width * 0.05)}" y="${fmt(-height * 0.2)}" width="${fmt(width * 0.9)}" height="${fmt(height * 0.4)}" class="shape"/>`);
      elements.push(centerLineV);
      break;
    }
    case 'bed': {
      elements.push(baseRect);
      elements.push(`<rect x="${fmt(minX)}" y="${fmt(minY)}" width="${fmt(width)}" height="${fmt(height * 0.35)}" class="shape"/>`);
      elements.push(centerLineV);
      break;
    }
    case 'wardrobe': {
      elements.push(baseRect);
      elements.push(centerLineV);
      break;
    }
    case 'sink': {
      elements.push(baseRect);
      elements.push(`<circle cx="0" cy="0" r="${fmt(radius * 0.4)}" class="shape"/>`);
      elements.push(centerLineV);
      break;
    }
    case 'stove': {
      elements.push(baseRect);
      const burnerR = Math.min(width, height) * 0.12;
      const offsets = [-0.35, 0.35];
      offsets.forEach(ix => {
        offsets.forEach(iy => {
          elements.push(`<circle cx="${fmt(width * ix)}" cy="${fmt(height * iy)}" r="${fmt(burnerR)}" class="shape"/>`);
        });
      });
      break;
    }
    case 'bath': {
      elements.push(`<rect x="${fmt(minX)}" y="${fmt(minY)}" width="${fmt(width)}" height="${fmt(height)}" rx="${fmt(Math.min(width, height) * 0.2)}" class="shape shape-fill"/>`);
      elements.push(`<ellipse cx="0" cy="0" rx="${fmt(width * 0.35)}" ry="${fmt(height * 0.35)}" class="shape"/>`);
      break;
    }
    case 'shower': {
      elements.push(baseRect);
      elements.push(`<circle cx="0" cy="0" r="${fmt(radius * 0.3)}" class="shape"/>`);
      elements.push(centerLineV);
      break;
    }
    case 'toilet': {
      elements.push(baseRect);
      elements.push(`<ellipse cx="0" cy="${fmt(-height * 0.15)}" rx="${fmt(width * 0.25)}" ry="${fmt(height * 0.22)}" class="shape"/>`);
      elements.push(`<rect x="${fmt(-width * 0.3)}" y="${fmt(height * 0.05)}" width="${fmt(width * 0.6)}" height="${fmt(height * 0.35)}" class="shape"/>`);
      break;
    }
    case 'plant': {
      const leftX = -width / 2;
      const rightX = width / 2;
      const topY = minY;
      const bottomY = maxY;
      const upperCtrlY = topY + height * 0.25;
      const lowerCtrlY = bottomY - height * 0.2;
      elements.push(`<path d="M0 ${fmt(topY)} C${fmt(rightX)} ${fmt(upperCtrlY)} ${fmt(rightX)} ${fmt(lowerCtrlY)} 0 ${fmt(bottomY)} C${fmt(leftX)} ${fmt(lowerCtrlY)} ${fmt(leftX)} ${fmt(upperCtrlY)} 0 ${fmt(topY)}Z" class="shape shape-fill"/>`);
      elements.push(`<path d="M0 ${fmt(bottomY)} C${fmt(width * 0.15)} ${fmt(lowerCtrlY)} ${fmt(width * 0.1)} ${fmt(upperCtrlY)} 0 ${fmt(topY + height * 0.12)}" class="shape" fill="none"/>`);
      break;
    }
    case 'appliance': {
      elements.push(baseRect);
      elements.push(`<rect x="${fmt(minX + width * 0.12)}" y="${fmt(minY + height * 0.15)}" width="${fmt(width * 0.76)}" height="${fmt(height * 0.3)}" class="shape"/>`);
      break;
    }
    case 'counter': {
      elements.push(baseRect);
      elements.push(centerLineH);
      break;
    }
    case 'rug': {
      elements.push(baseRect);
      elements.push(`<rect x="${fmt(minX + width * 0.1)}" y="${fmt(minY + height * 0.1)}" width="${fmt(width * 0.8)}" height="${fmt(height * 0.8)}" class="shape"/>`);
      break;
    }
    case 'post': {
      elements.push(`<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(Math.min(width, height) / 2)}" class="shape shape-fill"/>`);
      elements.push(centerLineV);
      break;
    }
    case 'panel': {
      elements.push(baseRect);
      elements.push(`<rect x="${fmt(minX + width * 0.075)}" y="${fmt(minY + height * 0.15)}" width="${fmt(width * 0.85)}" height="${fmt(height * 0.4)}" class="shape"/>`);
      break;
    }
    case 'equipment': {
      elements.push(baseRect);
      elements.push(`<rect x="${fmt(minX + width * 0.15)}" y="${fmt(minY + height * 0.2)}" width="${fmt(width * 0.7)}" height="${fmt(height * 0.6)}" class="shape"/>`);
      break;
    }
    default: {
      elements.push(baseRect);
      elements.push(centerLineV);
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
