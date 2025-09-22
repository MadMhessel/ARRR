/* templates.schematic.pro.distinct.js
 * Расширенный «плановый» слой: у КАЖДОЙ модели добавлены узнаваемые детали,
 * чтобы отличить предметы «с первого взгляда» при топ-видe.
 * Безопасно: не меняет исходные ITEM_TEMPLATES, только добавляет/дополняет schematicSvg.
 *
 * Подключение: после templates.js и до инициализации сцены/рендера.
 */

(function(){
  'use strict';

  // === 1) CSS (однократно) ===
  (function injectCSS(){
    if (document.getElementById('schematic-style')) return;
    const css = `
      :root{
        --schem-stroke:#0C0C0C;
        --schem-fill:#F7F7F7;
        --schem-accent:#8A8A8A;
        --schem-thin:0.6;
        --schem-normal:1.0;
        --schem-thick:1.6;
        --schem-center:0.8;
      }
      svg.svg-mode--schematic .schematic-only,
      .svg-mode--schematic .schematic-only{ display: initial; }
      svg.svg-mode--schematic .rich-only,
      .svg-mode--schematic .rich-only{ display: none !important; }

      .schem .shape, .schematic-only .shape,
      .schem .shape-fill, .schematic-only .shape-fill,
      .schem .border, .schematic-only .border,
      .schem .axis, .schematic-only .axis,
      .schem .detail, .schematic-only .detail,
      .schem .fringe, .schematic-only .fringe{
        vector-effect: non-scaling-stroke;
        fill: none;
        stroke: var(--schem-stroke);
        stroke-width: var(--schem-normal);
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .schem .shape-fill, .schematic-only .shape-fill{ fill: var(--schem-fill); }
      .schem .axis, .schematic-only .axis{ stroke-width: var(--schem-thin); stroke-dasharray: 2 3; }
      .schem .border, .schematic-only .border{ stroke-width: var(--schem-thick); }
      .schem .fringe, .schematic-only .fringe{ stroke-width: var(--schem-thin); }
      .schem .muted, .schematic-only .muted{ stroke: var(--schem-accent); }
    `;
    const st = document.createElement('style');
    st.id = 'schematic-style';
    st.textContent = css;
    document.head.appendChild(st);
  })();

  // === 2) SVG примитивы (все центрируем на (0,0)) ===
  const PI = Math.PI;
  function roundedRect(w,h,r,cls='shape'){ const x=-w/2,y=-h/2; const rx=Math.max(0,r|0); return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" class="${cls}"/>`; }
  function rect(w,h,cls='shape'){ return roundedRect(w,h,0,cls); }
  function circleR(r,cls='shape'){ return `<circle cx="0" cy="0" r="${r}" class="${cls}"/>`; }
  function line(x1,y1,x2,y2,cls='shape'){ return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`; }
  function path(d,cls='shape'){ return `<path d="${d}" class="${cls}"/>`; }
  function polyline(points,cls='shape'){ return `<polyline points="${points}" class="${cls}"/>`; }

  // Вспом. штриховка (несколько диагоналей внутри прямоугольника w×h)
  function hatch(w,h,step=10,cls='detail muted'){
    const x0=-w/2, y0=-h/2; let res='';
    for(let x=-w; x<=w; x+=step){
      const x1=x0+x, y1=y0, x2=x0+x+h, y2=y0+h;
      res += line(x1,y1,x2,y2,cls);
    }
    return res;
  }
  // Короткие штрихи вдоль грани (сегменты «посадки»)
  function edgeTicks(w,h,side='top',count=3,len=6,offset=8,cls='detail'){
    const res=[];
    if (side==='top'){
      const y=-h/2; for(let i=1;i<=count;i++){ const x=-w/2 + i*(w/(count+1)); res.push(line(x,y, x,y-offset, cls)); }
    }else if(side==='bottom'){
      const y=h/2; for(let i=1;i<=count;i++){ const x=-w/2 + i*(w/(count+1)); res.push(line(x,y, x,y+offset, cls)); }
    }else if(side==='left'){
      const x=-w/2; for(let i=1;i<=count;i++){ const y=-h/2 + i*(h/(count+1)); res.push(line(x,y, x-offset,y, cls)); }
    }else{
      const x=w/2; for(let i=1;i<=count;i++){ const y=-h/2 + i*(h/(count+1)); res.push(line(x,y, x+offset,y, cls)); }
    }
    return res.join('');
  }

  // === 3) Модели с «характерными» деталями ===

  // Круглый стол — центральная опора (пьедестал) и опорное основание
  function roundTable(d=80){
    const r=d/2, pr=Math.max(6, d*0.12), base=Math.max(pr*1.6, 14);
    return `
      <g class="core schematic-only schem" data-role="round-table" data-d="${d}">
        ${circleR(r,'shape-fill')}
        ${circleR(pr,'detail')}      <!-- пьедестал -->
        ${circleR(base,'detail muted')} <!-- база-основание -->
      </g>`;
  }

  // Квадратный/прямоугольный стол — фаска/скруг на одном углу + «посадки» по трём сторонам
  function squareTable(w=80,h=70,r=6){
    const x=-w/2,y=-h/2;
    const d = `M ${x} ${y+r} v ${h-2*r} a ${r} ${r} 0 0 0 ${r} ${r} h ${w-2*r} a ${r} ${r} 0 0 0 ${r} -${r} v -${h-2*r} a ${r} ${r} 0 0 0 -${r} -${r} h -${w-2*r} a ${r} ${r} 0 0 0 -${r} ${r} z`;
    // Срежем правый верхний угол (фаска) характерной линией
    const chamfer = polyline(`${w/2-10},${-h/2} ${w/2},${-h/2+10}`, 'detail');
    return `
      <g class="core schematic-only schem" data-role="square-table" data-w="${w}" data-h="${h}">
        <path d="${d}" class="shape-fill"/>
        ${chamfer}
        ${edgeTicks(w,h,'left',3,6,8,'detail')}   <!-- посадки -->
        ${edgeTicks(w,h,'right',3,6,8,'detail')}
        ${edgeTicks(w,h,'bottom',2,6,8,'detail')}
      </g>`;
  }

  // Барная стойка — толстая фронтальная кромка + штриховка рабочей зоны за стойкой + круглая мойка
  function barCounter(w=180,d=50){
    const sinkR=8;
    return `
      <g class="core schematic-only schem" data-role="bar" data-w="${w}" data-d="${d}">
        ${roundedRect(w,d,6,'border')}
        ${line(-w/2, d/2, w/2, d/2, 'border')} <!-- выраженная фронтальная кромка -->
        ${hatch(w*0.8, d*0.35, 10, 'detail muted')}
        <g transform="translate(${w*0.25},${-d*0.15})">
          ${circleR(sinkR,'detail')}
        </g>
      </g>`;
  }

  // Диван — разделительные линии сидушек, подлокотники и спинка
  function sofa(w=170,d=70){
    const arm=8;
    return `
      <g class="core schematic-only schem" data-role="sofa" data-w="${w}" data-d="${d}">
        ${roundedRect(w,d,6,'shape-fill')}
        ${rect(w-2*arm, d-14, 'shape')}
        ${line(0,-d/2+10,0,d/2-10,'detail')}  <!-- разделение сидушек -->
        ${rect(arm,d-6,'border')}              <!-- левый подлокотник -->
        <g transform="scale(-1,1)">${rect(arm,d-6,'border')}</g> <!-- правый -->
        ${line(-w/2+arm, -d/2+6, w/2-arm, -d/2+6, 'detail')} <!-- спинка -->
      </g>`;
  }

  // Банкетка — высокая спинка по одной длинной стороне + стёжка
  function banquette(w=180,d=50){
    return `
      <g class="core schematic-only schem" data-role="banquette" data-w="${w}" data-d="${d}">
        ${roundedRect(w,d,6,'shape-fill')}
        ${line(-w/2, -d/2+6, w/2, -d/2+6, 'border')}   <!-- высокая спинка -->
        ${line(-w/2+8, 0, w/2-8, 0, 'detail muted')}   <!-- линия сиденья -->
        ${edgeTicks(w,d,'bottom',4,5,7,'fringe')}      <!-- вертикальная стёжка -->
      </g>`;
  }

  // Стул — квадратное сиденье + дугообразная спинка сзади
  function chair(a=32){
    const backR = a*0.75;
    return `
      <g class="core schematic-only schem" data-role="chair" data-a="${a}">
        ${roundedRect(a,a,3,'shape-fill')}
        <path d="M ${-a/2} ${-a/2} A ${backR} ${backR} 0 0 1 ${a/2} ${-a/2}" class="detail"/> <!-- спинка -->
        ${edgeTicks(a,a,'bottom',2,5,6,'detail')} <!-- передние ножки намёком -->
      </g>`;
  }

  // Кровать — две подушки и контур одеяла
  function bed(w=200,h=150){
    const pillowW=w*0.34, pillowH=h*0.22;
    return `
      <g class="core schematic-only schem" data-role="bed" data-w="${w}" data-h="${h}">
        ${roundedRect(w,h,8,'shape-fill')}
        ${roundedRect(w-14, h-18, 6,'shape')}
        <g transform="translate(${-w*0.2},${-h*0.22})">${roundedRect(pillowW,pillowH,6,'detail')}</g>
        <g transform="translate(${ w*0.2},${-h*0.22})">${roundedRect(pillowW,pillowH,6,'detail')}</g>
        ${line(-w/2,0,w/2,0,'detail muted')} <!-- край одеяла -->
      </g>`;
  }

  // Шкаф — двустворчатые двери, ручки и полки
  function wardrobe(w=110,d=55){
    return `
      <g class="core schematic-only schem" data-role="wardrobe" data-w="${w}" data-d="${d}">
        ${roundedRect(w,d,4,'shape-fill')}
        ${line(0,-d/2,0,d/2,'detail')}              <!-- линия между дверьми -->
        <g transform="translate(${ -w*0.12},0)">${circleR(2,'detail')}</g>  <!-- ручки -->
        <g transform="translate(${  w*0.12},0)">${circleR(2,'detail')}</g>
        ${line(-w/2+6, -d*0.15, w/2-6, -d*0.15,'axis')} <!-- полка -->
        ${line(-w/2+6,  d*0.18, w/2-6,  d*0.18,'axis')}  <!-- полка -->
      </g>`;
  }

  // Унитаз — бак, сиденье-овал, кнопка
  function toilet(){
    const w=38, d=70, r=16, x=-w/2,y=-d/2;
    const bowl = `M ${x} ${y+r} v ${d-2*r} a ${r} ${r} 0 0 0 ${w} 0 v ${-(d-2*r)} a ${r} ${r} 0 0 0 -${w} 0 z`;
    return `
      <g class="core schematic-only schem" data-role="toilet">
        <path d="${bowl}" class="shape-fill"/>
        ${roundedRect(w*0.82, d*0.28, 4, 'detail')}        <!-- крышка -->
        <g transform="translate(0,${-d/2+6})">${rect(w*0.85, 8, 'detail muted')}</g> <!-- бак -->
        <g transform="translate(${w*0.2},${-d/2+6})">${circleR(1.6,'detail')}</g>   <!-- кнопка -->
      </g>`;
  }

  // Раковина — чаша, слив, смеситель
  function sink(w=55,d=45){
    return `
      <g class="core schematic-only schem" data-role="sink" data-w="${w}" data-d="${d}">
        ${roundedRect(w,d,10,'shape-fill')}
        ${circleR(3,'detail')}                                   <!-- слив -->
        <g transform="translate(0,${-d/2+4})">${rect(12,4,'detail')}</g> <!-- смеситель -->
      </g>`;
  }

  // Плита/варочная — 4 конфорки разного диаметра + ряд ручек
  function cooktop(w=70,d=52){
    const r1= d*0.22, r2=d*0.16;
    return `
      <g class="core schematic-only schem" data-role="cooktop" data-w="${w}" data-d="${d}">
        ${roundedRect(w,d,6,'shape-fill')}
        <g transform="translate(${ -w*0.22},${-d*0.18})">${circleR(r1,'detail')}</g>
        <g transform="translate(${  w*0.22},${-d*0.18})">${circleR(r2,'detail')}</g>
        <g transform="translate(${ -w*0.22},${ d*0.18})">${circleR(r2,'detail')}</g>
        <g transform="translate(${  w*0.22},${ d*0.18})">${circleR(r1,'detail')}</g>
        ${edgeTicks(w,d,'bottom',4,4,6,'detail')}               <!-- ручки -->
      </g>`;
  }

  // Ванна — внутренняя чаша, слив и смеситель с одной стороны
  function bath(w=160,d=70){
    return `
      <g class="core schematic-only schem" data-role="bath" data-w="${w}" data-d="${d}">
        ${roundedRect(w,d,18,'shape-fill')}
        ${roundedRect(w-14,d-16,16,'detail')}          <!-- внутренняя чаша -->
        <g transform="translate(${w*0.32},${d*0.05})">${circleR(2,'detail')}</g>  <!-- слив -->
        <g transform="translate(${ -w*0.3},${-d*0.36})">${rect(14,5,'detail')}</g> <!-- смеситель -->
      </g>`;
  }

  // Растение — горшок-трапеция и три листа
  function plant(a=46){
    const potW=a*0.7, potH=a*0.38;
    const pot = `M ${-potW/2} ${potH/2} L ${-potW*0.35} ${-potH/2} L ${potW*0.35} ${-potH/2} L ${potW/2} ${potH/2} z`;
    return `
      <g class="core schematic-only schem" data-role="plant" data-a="${a}">
        <path d="${pot}" class="shape"/>
        <g transform="translate(0,${-potH})">
          ${path(`M 0 0 C -10 -14, -6 -26, 0 -30 C 6 -26, 10 -14, 0 0`,'detail')}
          ${path(`M -8 -6 C -22 -12, -18 -24, -10 -30 C -4 -24, 2 -12, -8 -6`,'detail muted')}
          ${path(`M 8 -6 C 22 -12, 18 -24, 10 -30 C 4 -24, -2 -12, 8 -6`,'detail muted')}
        </g>
      </g>`;
  }

  // Ковёр — декоративная внутренняя рамка + бахрома по коротким сторонам
  function rug(w=100,h=70,r=8){
    const inner=4;
    return `
      <g class="core schematic-only schem" data-role="rug" data-w="${w}" data-h="${h}">
        ${roundedRect(w,h,r,'shape')}
        ${roundedRect(w-2*inner,h-2*inner,r-2,'detail muted')}
        ${edgeTicks(w,h,'left',6,5,7,'fringe')}
        ${edgeTicks(w,h,'right',6,5,7,'fringe')}
      </g>`;
  }

  // === 4) Маршрутизатор по id ===
  function genById(idRaw){
    const id = String(idRaw||'').toLowerCase();
    if (id.includes('banquette')||id.includes('банкет')||id.includes('bench')) return banquette();
    if ((id.includes('table')||id.includes('стол')) && (id.includes('round')||id.includes('круг'))) return roundTable();
    if ((id.includes('table')||id.includes('стол'))) return squareTable();
    if (id.includes('hightop')||id.includes('high')||id.includes('стойк')) return roundTable(72);
    if (id.includes('bar')||id.includes('стойка')) return barCounter();
    if (id.includes('sofa')||id.includes('диван')) return sofa();
    if (id.includes('bed')||id.includes('кровать')) return bed();
    if (id.includes('wardrobe')||id.includes('шкаф')||id.includes('closet')) return wardrobe();
    if (id.includes('chair')||id.includes('стул')||id.includes('seat')||id.includes('табур')) return chair();
    if (id.includes('sink')||id.includes('мойк')) return sink();
    if (id.includes('stove')||id.includes('cooktop')||id.includes('плита')||id.includes('hob')) return cooktop();
    if (id.includes('bath')||id.includes('ванн')||id.includes('bathtub')) return bath();
    if (id.includes('toilet')||id.includes('унитаз')||id.includes('wc')) return toilet();
    if (id.includes('plant')||id.includes('растен')) return plant();
    if (id.includes('rug')||id.includes('ковер')||id.includes('ковёр')) return rug();
    // fallback — узнаваемый квадратик с «ушком»
    return `
      <g class="core schematic-only schem" data-role="unknown" data-id="${idRaw}">
        ${roundedRect(30,30,4,'shape-fill')}
        ${line(0,-16,0,-6,'detail')}
      </g>`;
  }

  // === 5) Вмешиваемся мягко в ITEM_TEMPLATES ===
  if (typeof window!=='undefined' && window.ITEM_TEMPLATES){
    const T = window.ITEM_TEMPLATES;
    Object.keys(T).forEach((key)=>{
      const tpl=T[key]; if(!tpl) return;
      if (typeof tpl.schematicSvg!=='function'){
        tpl.schematicSvg = ()=> genById(key);
      }else{
        // оборачиваем существующий schematicSvg и добавляем title/desc при отсутствии
        const orig = tpl.schematicSvg;
        tpl.schematicSvg = ()=>{
          let svg = String(orig());
          if (svg.indexOf('<title')===-1){
            const safe = key.replace(/&/g,'&amp;').replace(/</g,'&lt;');
            svg = svg.replace('<g ', `<g ><title>${safe}</title><desc>schematic</desc> `);
          }
          return svg;
        };
      }
    });
  }else{
    console.warn('[schematic-distinct] ITEM_TEMPLATES not found; include after templates.js');
  }

  // === 6) Резервный рендер ===
  if (typeof window!=='undefined' && typeof window.renderItemTemplate==='undefined'){
    window.renderItemTemplate = function(id, mode='schematic'){
      const T = window.ITEM_TEMPLATES || {};
      const tpl = T[id];
      if (!tpl) return '';
      if (mode==='schematic' && typeof tpl.schematicSvg==='function') return tpl.schematicSvg();
      if (typeof tpl.svg==='function') return tpl.svg();
      return tpl.schematicSvg ? tpl.schematicSvg() : '';
    };
  }

  console.log('[schematic-distinct] ready.');
})();
