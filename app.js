"use strict";
(() => {
    // --- CONSTANTS & STATE ---
    const LOCAL_STORAGE_KEY = 'layout-v9-pro'; // Incremented version to avoid loading old potentially corrupt data
    const dom = {
        svg: document.getElementById('svg'),
        itemsContainer: document.getElementById('items'),
        wallsContainer: document.getElementById('walls'),
        wallComponentsContainer: document.getElementById('wall-components'),
        previewsContainer: document.getElementById('previews'),
        sidebar: document.getElementById('sidebar'),
        properties: document.getElementById('properties'),
        trash: document.getElementById('trash'),
        toast: document.getElementById('toast'),
        ctx: document.getElementById('ctx'),
        gridPattern: document.getElementById('grid'),
        layersPanel: document.getElementById('layers-panel'),
        layersList: document.getElementById('layers-list'),
        main: document.getElementById('main'),
        propControls: document.getElementById('prop-controls'),
        propPlaceholder: document.getElementById('prop-placeholder'),
        propX: document.getElementById('prop-x'),
        propY: document.getElementById('prop-y'),
        propW: document.getElementById('prop-w'),
        propH: document.getElementById('prop-h'),
        propA: document.getElementById('prop-a'),
        btnExport: document.getElementById('btnExport'),
        btnImport: document.getElementById('btnImport'),
        fileImport: document.getElementById('fileImport'),
        btnShare: document.getElementById('btnShare'),
        btnAnalysis: document.getElementById('btnAnalysis'),
        btnCsv: document.getElementById('btnCsv'),
        btnTemplate: document.getElementById('btnTemplate'),
        gridSelect: document.getElementById('gridStep'),
        snapGuidesEl: document.getElementById('snapGuides'),
        toolPointer: document.getElementById('tool-pointer'),
        toolWall: document.getElementById('tool-wall'),
        toolDoor: document.getElementById('tool-door'),
        toolWindow: document.getElementById('tool-window'),
        toolMeasure: document.getElementById('tool-measure'),
        wallPreview: document.getElementById('wall-preview'),
        toggleSidebar: document.getElementById('toggle-sidebar'),
        toggleProperties: document.getElementById('toggle-properties'),
        measurementLayer: document.getElementById('measurement'),
        // слой для результатов анализа
        analysisLayer: document.getElementById('analysis-layer'),
        // контекстное меню: фокусировка на объекте
        ctxFocus: document.getElementById('ctx-focus'),
    };
    const state = {
        selectedObject: null,
        selectedWall: null,
        selectedComponent: null,
        objectCounter: 0,
        isShiftHeld: false,
        gridSize: 50,
        pixelsPerMeter: 50,
        history: { stack: [], idx: -1, lock: false },
        activeTool: 'pointer',
        currentWallPoints: [],
        // Хранилище для измерительного инструмента
        measurePoints: [],
        // ViewBox и панорамирование/масштаб
        viewBox: null,
        isPanning: false,
        panStart: null,
        panViewBox: null,
        isSpaceDown: false,
        // Хранилище для наложений анализа (для будущих расширений)
        analysisOverlays: [],
        // Нормативы. Все значения в метрах.
        normativeCorridorGuest: 1.0,
        normativeCorridorStaff: 1.0,
        normativeRadius: 3.0,
        // Хранилище результатов последнего анализа (для экспорта CSV)
        lastAnalysis: null
    };
    const utils = {
        showToast(msg, ms = 1500) { dom.toast.textContent = msg; dom.toast.classList.add('show'); clearTimeout(this.showToast.t); this.showToast.t = setTimeout(() => dom.toast.classList.remove('show'), ms); },
        toSVGPoint(x, y) { const p = dom.svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(dom.svg.getScreenCTM().inverse()); },
        screenDeltaToSVG(dx, dy) { const p0 = this.toSVGPoint(0, 0); const p1 = this.toSVGPoint(dx, dy); return { dx: p1.x - p0.x, dy: p1.y - p0.y }; },
        clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
        rafThrottle(fn) { let r = null, lastArgs = null; return function (...args) { lastArgs = args; if (r) return; r = requestAnimationFrame(() => { fn(...lastArgs); r = null; }); } }
    };

    // --- GEOMETRY HELPERS ---
    function getClosestPointOnSegment(p, a, b) {
        const atob = { x: b.x - a.x, y: b.y - a.y };
        const atop = { x: p.x - a.x, y: p.y - a.y };
        const len = atob.x * atob.x + atob.y * atob.y;
        if (len === 0) return a;
        let t = (atop.x * atob.x + atop.y * atob.y) / len;
        t = Math.max(0, Math.min(1, t));
        return { x: a.x + atob.x * t, y: a.y + atob.y * t };
    }
    function distance(p1, p2) { return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)); }

    // --- DATA & MODEL ---
    function getModel(el) { if (!el || !el.dataset) return {}; return { id: el.dataset.id, tpl: el.dataset.template || 'zone', x: +el.dataset.x || 0, y: +el.dataset.y || 0, a: +el.dataset.a || 0, sx: +el.dataset.sx || 1, sy: +el.dataset.sy || 1, cx: +el.dataset.cx || 0, cy: +el.dataset.cy || 0, ow: +el.dataset.ow || 0, oh: +el.dataset.oh || 0, locked: el.dataset.locked === 'true', visible: el.dataset.visible !== 'false' }; }
    function setModel(el, model) { for (const k in model) { if (model[k] !== undefined) el.dataset[k] = model[k]; } applyTransformFromDataset(el); updatePropertiesPanel(model); updateLayerItem(model); }
    function applyTransformFromDataset(el) { const m = getModel(el); el.setAttribute('transform', `translate(${m.x}, ${m.y}) rotate(${m.a})`); const core = el.querySelector('.core'); if (core) { core.setAttribute('transform', `translate(${-m.cx}, ${-m.cy}) scale(${m.sx}, ${m.sy})`); } updateSelectionUI(el); }

    // --- UI & SELECTION ---
    function updateSelectionUI(el) { if (!el) return; const m = getModel(el); const w = m.ow * m.sx, h = m.oh * m.sy; const sel = el.querySelector('.selection-box'); if (sel) { sel.setAttribute('x', -w / 2 - 5); sel.setAttribute('y', -h / 2 - 5); sel.setAttribute('width', w + 10); sel.setAttribute('height', h + 10); } const rs = el.querySelector('.resize-handle'); if (rs) { rs.setAttribute('x', w / 2 - 6); rs.setAttribute('y', h / 2 - 6); } const ro = el.querySelector('.rotate-handle'); if (ro) { ro.setAttribute('cx', 0); ro.setAttribute('cy', -h / 2 - 20); } }
    function updatePropertiesPanel(model) { if (model && state.selectedObject) { dom.propControls.classList.remove('hidden'); dom.propPlaceholder.classList.add('hidden'); dom.propX.value = Math.round(model.x); dom.propY.value = Math.round(model.y); dom.propW.value = Math.round(model.ow * model.sx); dom.propH.value = Math.round(model.oh * model.sy); dom.propA.value = Math.round(model.a); } else { dom.propControls.classList.add('hidden'); dom.propPlaceholder.classList.remove('hidden'); } }
    function updateLayersList() { dom.layersList.innerHTML = ''; const items = Array.from(dom.itemsContainer.children).filter(n => n.classList.contains('layout-object')); items.reverse().forEach(el => { const model = getModel(el); const li = createLayerItem(model); dom.layersList.appendChild(li); }); }
    function createLayerItem(model) { const li = document.createElement('li'); li.dataset.id = model.id; li.className = state.selectedObject?.dataset.id === model.id ? 'selected' : ''; if (model.locked) li.classList.add('locked'); li.innerHTML = `<span class="layer-name">${ITEM_TEMPLATES[model.tpl]?.label || model.tpl}</span><button class="layer-vis" title="Видимость">${model.visible ? '👁️' : '⚪'}</button><button class="layer-lock" title="Блокировка">${model.locked ? '🔒' : '🔓'}</button>`; return li; }
    function updateLayerItem(model) { const li = dom.layersList.querySelector(`[data-id="${model.id}"]`); if (!li) return; li.querySelector('.layer-vis').textContent = model.visible ? '👁️' : '⚪'; li.querySelector('.layer-lock').textContent = model.locked ? '🔒' : '🔓'; model.locked ? li.classList.add('locked') : li.classList.remove('locked'); }
    function clearSelections() { if (state.selectedObject) { state.selectedObject.classList.remove('selected'); state.selectedObject = null; } if (state.selectedWall) { state.selectedWall.classList.remove('selected'); state.selectedWall = null; } if (state.selectedComponent) { state.selectedComponent.classList.remove('selected'); state.selectedComponent = null; } dom.layersList.querySelector('.selected')?.classList.remove('selected'); updatePropertiesPanel(null); }

    /**
     * Центрирует вид (viewBox) на выбранном объекте без изменения масштаба.
     * Используется из контекстного меню и горячей клавиши F.
     */
    /**
     * Центрирует вид на выбранном объекте. Если возможно,
     * использует точный bounding box объекта, чтобы он полностью
     * поместился в окне, сохраняя текущий аспект изображения.
     */
    function focusSelected() {
        if (!state.selectedObject || !state.viewBox) return;
        let bbox;
        try {
            // getBBox может бросить исключение, если элемент не является SVG
            bbox = state.selectedObject.getBBox();
        } catch (e) {
            bbox = null;
        }
        // Если удалось получить bbox, масштабируем viewBox так, чтобы объект занял ~1/2 экрана
        if (bbox && bbox.width > 0 && bbox.height > 0) {
            const marginFactor = 2; // оставляем воздух вокруг объекта
            let newW = bbox.width * marginFactor;
            let newH = bbox.height * marginFactor;
            // Соотношение сторон текущего вида
            const ratio = state.viewBox.width / state.viewBox.height;
            // Подгоняем новый прямоугольник под текущий ratio
            if (newW / newH > ratio) {
                // Слишком широкая рамка – увеличим высоту
                newH = newW / ratio;
            } else {
                // Слишком высокая рамка – увеличим ширину
                newW = newH * ratio;
            }
            state.viewBox.x = (bbox.x + bbox.width / 2) - newW / 2;
            state.viewBox.y = (bbox.y + bbox.height / 2) - newH / 2;
            state.viewBox.width = newW;
            state.viewBox.height = newH;
            updateViewBox();
        } else {
            // fallback: центрируем в соответствии с моделью
            const m = getModel(state.selectedObject);
            const vb = state.viewBox;
            vb.x = m.x - vb.width / 2;
            vb.y = m.y - vb.height / 2;
            updateViewBox();
        }
    }
    function selectObject(el) { if (state.activeTool !== 'pointer') return; clearSelections(); state.selectedObject = el ? el.closest('.layout-object') : null; if (state.selectedObject) { state.selectedObject.classList.add('selected'); dom.itemsContainer.appendChild(state.selectedObject); const model = getModel(state.selectedObject); updatePropertiesPanel(model); const li = dom.layersList.querySelector(`[data-id="${model.id}"]`); if (li) li.classList.add('selected'); } }
    function selectWall(wallEl) { if (state.activeTool !== 'pointer') return; clearSelections(); state.selectedWall = wallEl; if (state.selectedWall) { state.selectedWall.classList.add('selected'); } }
    function selectComponent(compEl) { if (state.activeTool !== 'pointer') return; clearSelections(); state.selectedComponent = compEl; if (state.selectedComponent) { state.selectedComponent.classList.add('selected'); } }

    // --- OBJECT & WALL CREATION / MANIPULATION ---
    function createLayoutObject(tpl, x, y) { const el = document.createElementNS('http://www.w3.org/2000/svg', 'g'); el.classList.add('layout-object'); el.dataset.id = `el-${state.objectCounter++}`; const safeTpl = ITEM_TEMPLATES[tpl] ? tpl : 'zone'; el.dataset.template = safeTpl; el.innerHTML = (ITEM_TEMPLATES[safeTpl].svg() + `<rect class="selection-box"></rect><rect class="resize-handle" width="12" height="12"></rect><circle class="rotate-handle" r="8"></circle>`); dom.itemsContainer.appendChild(el); const core = el.querySelector('.core'); const b = core.getBBox(); const model = { x, y, a: 0, sx: 1, sy: 1, cx: b.x + b.width / 2, cy: b.y + b.height / 2, ow: b.width, oh: b.height, locked: false, visible: true }; setModel(el, model); makeInteractive(el); commit('add'); return el; }
    function makeInteractive(el) { interact(el).draggable({ onstart: () => { if (getModel(el).locked || state.activeTool !== 'pointer') return false; }, listeners: { move: utils.rafThrottle(e => { const m = getModel(el); const d = utils.screenDeltaToSVG(e.dx, e.dy); m.x += d.dx; m.y += d.dy; setModel(el, m); showGuidesIfNeeded(m); }), end: () => { snapSelectedToGrid(el); clearGuides(); commit('move'); } } }).resizable({ edges: { left: true, right: true, top: true, bottom: true }, onstart: () => { if (getModel(el).locked || state.activeTool !== 'pointer') return false; }, listeners: { move: utils.rafThrottle(e => { const m = getModel(el); const bw = Math.max(1, m.ow * m.sx), bh = Math.max(1, m.oh * m.sy); const dScr = utils.screenDeltaToSVG(e.delta.x || 0, e.delta.y || 0); const rad = m.a * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad); const dLoc = { lx: dScr.dx * cos + dScr.dy * sin, ly: -dScr.dx * sin + dScr.dy * cos }; let sx = m.sx, sy = m.sy; if (e.edges.left) sx = utils.clamp((bw - dLoc.lx) / m.ow, 0.1, 100); if (e.edges.right) sx = utils.clamp((bw + dLoc.lx) / m.ow, 0.1, 100); if (e.edges.top) sy = utils.clamp((bh - dLoc.ly) / m.oh, 0.1, 100); if (e.edges.bottom) sy = utils.clamp((bh + dLoc.ly) / m.oh, 0.1, 100); const ox = (e.edges.left ? m.ow / 2 : e.edges.right ? -m.ow / 2 : 0); const oy = (e.edges.top ? m.oh / 2 : e.edges.bottom ? -m.oh / 2 : 0); const dx = (m.sx - sx) * ox, dy = (m.sy - sy) * oy; m.x += dx * cos - dy * sin; m.y += dx * sin + dy * cos; m.sx = sx; m.sy = sy; setModel(el, m); }), end: () => { snapSelectedToGrid(el, true); commit('resize'); } } }); interact(el.querySelector('.rotate-handle')).draggable({ onstart: e => { if (getModel(el).locked || state.activeTool !== 'pointer') return false; e.interaction.el = el; }, listeners: { move: utils.rafThrottle(e => { const m = getModel(e.interaction.el); const p = utils.toSVGPoint(e.clientX, e.clientY); const ang = Math.atan2(p.y - m.y, p.x - m.x) * 180 / Math.PI + 90; m.a = state.isShiftHeld ? Math.round(ang / 15) * 15 : ang; setModel(e.interaction.el, m); }), end: () => { snapSelectedToGrid(el); commit('rotate'); } } }); }
    function updateFromProperties() { if (!state.selectedObject) return; const model = getModel(state.selectedObject); let changed = false; const props = { x: parseFloat(dom.propX.value), y: parseFloat(dom.propY.value), w: parseFloat(dom.propW.value), h: parseFloat(dom.propH.value), a: parseFloat(dom.propA.value) }; if (!isNaN(props.x) && model.x !== props.x) { model.x = props.x; changed = true; } if (!isNaN(props.y) && model.y !== props.y) { model.y = props.y; changed = true; } if (!isNaN(props.a)) { const newA = props.a % 360; if (model.a !== newA) { model.a = newA; changed = true; } } if (!isNaN(props.w) && props.w > 0) { const newSx = props.w / model.ow; if (model.sx !== newSx) { model.sx = newSx; changed = true; } } if (!isNaN(props.h) && props.h > 0) { const newSy = props.h / model.oh; if (model.sy !== newSy) { model.sy = newSy; changed = true; } } if (changed) { setModel(state.selectedObject, model); commit('props_update'); } updatePropertiesPanel(model); }
    function toggleTool(tool) {
        state.activeTool = tool;
        // Подсветка активной кнопки для всех инструментов
        ['pointer', 'wall', 'door', 'window', 'measure'].forEach(t => {
            const btn = dom[`tool${t.charAt(0).toUpperCase() + t.slice(1)}`];
            if (btn) btn.classList.toggle('active', state.activeTool === t);
        });
        // Курсор crosshair для всех инструментов, кроме указателя
        dom.svg.classList.toggle('tool-active', !!state.activeTool && state.activeTool !== 'pointer');
        // Очистить выборы и превью
        clearSelections();
        state.currentWallPoints = [];
        dom.wallPreview.setAttribute('points', '');
        dom.previewsContainer.innerHTML = '';
        // Покидая режим измерения — очищаем слой измерений
        if (state.activeTool !== 'measure') {
            clearMeasurement();
        }
    }
    function finishCurrentWall() { if (state.currentWallPoints.length > 1) { const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); const d = state.currentWallPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '); path.setAttribute('d', d); dom.wallsContainer.appendChild(path); commit('add_wall'); } state.currentWallPoints = []; dom.wallPreview.setAttribute('points', ''); }
    function placeWallComponent(type, point, angle) { const el = document.createElementNS('http://www.w3.org/2000/svg', 'g'); el.classList.add('wall-component'); const width = type === 'door' ? 80 : 120; const mask = `<rect x="-${width / 2}" y="-11" width="${width}" height="22" fill="#fdfdfd" />`; const visual = type === 'door' ? `<path d="M -40 0 A 40 40 0 0 1 0 -40" stroke="#8B4513" stroke-width="2" fill="none"/><line x1="-40" y1="0" x2="-40" y2="-5" stroke="#8B4513" stroke-width="2"/>` : `<rect x="-60" y="-5.5" width="120" height="11" fill="#a3d5ff" stroke="#5b9ad4" stroke-width="2" />`; el.innerHTML = mask + visual; el.setAttribute('transform', `translate(${point.x}, ${point.y}) rotate(${angle})`); dom.wallComponentsContainer.appendChild(el); commit('add_component'); }
    
    // --- GRID & GUIDES ---
    function snap(v) { return Math.round(v / state.gridSize) * state.gridSize; }
    function snapSelectedToGrid(el, sizeToo = false) { const m = getModel(el); m.x = snap(m.x); m.y = snap(m.y); if (sizeToo) { m.sx = Math.max(0.1, (snap(m.ow * m.sx)) / m.ow); m.sy = Math.max(0.1, (snap(m.oh * m.sy)) / m.oh); } setModel(el, m); }
    function updateGridSize() {
        state.gridSize = +dom.gridSelect.value;
        const w = String(state.gridSize);
        dom.gridPattern.setAttribute('width', w);
        dom.gridPattern.setAttribute('height', w);
        const path = dom.gridPattern.querySelector('path');
        path?.setAttribute('d', `M ${w} 0 L 0 0 0 ${w}`);
        const selectedOption = dom.gridSelect.options[dom.gridSelect.selectedIndex];
        const metersPerCell = parseFloat(selectedOption?.dataset?.meters || selectedOption?.textContent) || 1;
        state.pixelsPerMeter = metersPerCell ? state.gridSize / metersPerCell : state.gridSize;
        utils.showToast(`Сетка ${selectedOption?.text || ''}`);
    }
    function drawGuideLine(x1, y1, x2, y2, id) { let l = document.getElementById(id); if (!l) { l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l.id = id; l.setAttribute('stroke', '#8ecae6'); l.setAttribute('stroke-dasharray', '4 4'); l.setAttribute('vector-effect', 'non-scaling-stroke'); dom.svg.insertBefore(l, dom.itemsContainer); } l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2); }
    function hideGuide(id) { document.getElementById(id)?.remove(); }
    function clearGuides() { hideGuide('gX'); hideGuide('gY'); }
    function showGuidesIfNeeded(m) { if (!dom.snapGuidesEl?.checked) return; const viewBox = dom.svg.viewBox.baseVal; drawGuideLine(viewBox.x, m.y, viewBox.x + viewBox.width, m.y, 'gY'); drawGuideLine(m.x, viewBox.y, m.x, viewBox.y + viewBox.height, 'gX'); }

    // --- PAN & ZOOM ---
    function updateViewBox() {
        if (!state.viewBox) return;
        dom.svg.setAttribute('viewBox', `${state.viewBox.x} ${state.viewBox.y} ${state.viewBox.width} ${state.viewBox.height}`);
    }
    function startPan(e) {
        if (!state.viewBox) {
            const vb = dom.svg.viewBox?.baseVal;
            if (!vb) return;
            state.viewBox = { x: vb.x, y: vb.y, width: vb.width, height: vb.height };
        }
        state.isPanning = true;
        state.panStart = { x: e.clientX, y: e.clientY };
        state.panViewBox = { ...state.viewBox };
        document.body.classList.add('panning');
        dom.svg.classList.add('panning');
    }
    function panMove(e) {
        if (!state.isPanning) return;
        const svgRect = dom.svg.getBoundingClientRect();
        // пересчет смещения пикселей в координаты viewBox
        const dx = (e.clientX - state.panStart.x) * (state.viewBox.width / svgRect.width);
        const dy = (e.clientY - state.panStart.y) * (state.viewBox.height / svgRect.height);
        state.viewBox.x = state.panViewBox.x - dx;
        state.viewBox.y = state.panViewBox.y - dy;
        updateViewBox();
    }
    function endPan() {
        if (!state.isPanning) return;
        state.isPanning = false;
        document.body.classList.remove('panning');
        dom.svg.classList.remove('panning');
    }
    function zoomAt(svgPoint, factor) {
        const v = state.viewBox;
        // центрируем масштабирование вокруг svgPoint
        v.x = svgPoint.x - (svgPoint.x - v.x) * factor;
        v.y = svgPoint.y - (svgPoint.y - v.y) * factor;
        v.width *= factor;
        v.height *= factor;
        updateViewBox();
    }

    // --- MEASUREMENT TOOL ---
    function clearMeasurement() {
        state.measurePoints = [];
        const layer = dom.measurementLayer;
        if (layer) layer.innerHTML = '';
    }
    function drawMeasurementLine(p0, p1) {
        const layer = dom.measurementLayer;
        if (!layer) return;
        layer.innerHTML = '';
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', p0.x);
        line.setAttribute('y1', p0.y);
        line.setAttribute('x2', p1.x);
        line.setAttribute('y2', p1.y);
        line.setAttribute('stroke', getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#0d6efd');
        // Толстая линия для наглядности
        line.setAttribute('stroke-width', 3);
        line.setAttribute('marker-start', 'url(#dim-arrow)');
        line.setAttribute('marker-end', 'url(#dim-arrow)');
        layer.appendChild(line);
        // подпись расстояния
        const dist = distance(p0, p1);
        const pixelsPerMeter = state.pixelsPerMeter || state.gridSize || 1;
        const meters = (dist / pixelsPerMeter).toFixed(2);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const midx = (p0.x + p1.x) / 2;
        const midy = (p0.y + p1.y) / 2;
        text.setAttribute('x', midx + 4);
        text.setAttribute('y', midy - 4);
        text.setAttribute('fill', getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#0d6efd');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('stroke', 'white');
        text.setAttribute('stroke-width', '0.5');
        text.setAttribute('paint-order', 'stroke');
        text.textContent = `${meters} м`;
        layer.appendChild(text);
    }
    function finalizeMeasurement() {
        if (state.measurePoints.length !== 2) return;
        // Оставляем линию в слое measurements, сбрасываем массив для следующего измерения
        state.measurePoints = [];
        // Ничего не трогаем в слое, линия остается как есть
    }

    // --- ANALYSIS TOOL ---
    /**
     * Выполняет анализ текущей планировки: обнаруживает замкнутые помещения,
     * вычисляет их площадь/периметр, подсчитывает количество посадочных мест,
     * оценивает минимальную ширину прохода, а также отмечает коллизии между
     * объектами и дверями/окнами. Итоги выводятся в тост сообщениях,
     * а графические наложения добавляются в слой #analysis-layer.
     */
    function analysisLayout() {
        try {
            // Очистка предыдущих слоев анализа
            const analysisLayer = dom.analysisLayer;
            if (analysisLayer) analysisLayer.innerHTML = '';
            // Сброс выделения коллизий
            dom.itemsContainer.querySelectorAll('.layout-object').forEach(el => el.classList.remove('collision'));
            dom.wallComponentsContainer.querySelectorAll('.wall-component').forEach(el => el.classList.remove('collision'));
            const messages = [];
            const pixelsPerMeter = state.pixelsPerMeter || state.gridSize || 1;
            // --- Поиск замкнутых помещений ---
            const wallEls = Array.from(dom.wallsContainer.querySelectorAll('path'));
            const rooms = [];
            const parsePointsFromPath = (pathEl) => {
                const d = pathEl.getAttribute('d');
                const nums = d.match(/[-+]?[0-9]*\.?[0-9]+/g)?.map(Number) || [];
                const pts = [];
                for (let i = 0; i < nums.length; i += 2) {
                    pts.push({ x: nums[i], y: nums[i + 1] });
                }
                return pts;
            };
            const polygonArea = (pts) => {
                let area = 0;
                for (let i = 0; i < pts.length; i++) {
                    const j = (i + 1) % pts.length;
                    area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
                }
                return area / 2;
            };
            const perimeter = (pts) => {
                let peri = 0;
                for (let i = 0; i < pts.length; i++) {
                    const j = (i + 1) % pts.length;
                    peri += distance(pts[i], pts[j]);
                }
                return peri;
            };
            wallEls.forEach(w => {
                const pts = parsePointsFromPath(w);
                if (pts.length < 3) return;
                // Закрыть путь, если последняя точка не совпадает с первой
                const first = pts[0];
                const last = pts[pts.length - 1];
                const eps = 0.01;
                if (Math.abs(first.x - last.x) > eps || Math.abs(first.y - last.y) > eps) {
                    pts.push({ x: first.x, y: first.y });
                }
                const area = polygonArea(pts);
                if (Math.abs(area) > 1) {
                    rooms.push({ points: pts, area: Math.abs(area), perimeter: perimeter(pts) });
                }
            });
            // --- Визуализация комнат, назначение зон и расчёт коридора ---
            const zoneNames = ['Гости', 'Бар', 'Кухня', 'Склад', 'Персонал'];
            const zoneColors = ['rgba(0,123,255,0.15)', 'rgba(40,167,69,0.15)', 'rgba(255,193,7,0.15)', 'rgba(108,117,125,0.15)', 'rgba(23,162,184,0.15)'];
            const roomResults = [];
            rooms.forEach((room, idx) => {
                const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                poly.setAttribute('points', room.points.map(p => `${p.x},${p.y}`).join(' '));
                const zoneName = zoneNames[idx % zoneNames.length];
                const zoneColor = zoneColors[idx % zoneColors.length];
                poly.setAttribute('fill', zoneColor);
                poly.setAttribute('stroke', 'var(--accent)');
                poly.setAttribute('stroke-dasharray', '4 4');
                poly.setAttribute('pointer-events', 'none');
                poly.dataset.zone = zoneName;
                analysisLayer?.appendChild(poly);
                // вычислим ширину и высоту ограничивающего прямоугольника
                const xs = room.points.map(p => p.x);
                const ys = room.points.map(p => p.y);
                const width = Math.max(...xs) - Math.min(...xs);
                const height = Math.max(...ys) - Math.min(...ys);
                const corridor = Math.min(width, height);
                const minDim = Math.min(width, height);
                // центроид для подписи зоны
                let cx = 0, cy = 0, a2 = 0;
                for (let i = 0; i < room.points.length - 1; i++) {
                    const x0 = room.points[i].x, y0 = room.points[i].y;
                    const x1 = room.points[i + 1].x, y1 = room.points[i + 1].y;
                    const f = x0 * y1 - x1 * y0;
                    cx += (x0 + x1) * f;
                    cy += (y0 + y1) * f;
                    a2 += f;
                }
                if (a2 !== 0) {
                    cx = cx / (3 * a2);
                    cy = cy / (3 * a2);
                } else {
                    cx = xs.reduce((s, v) => s + v, 0) / xs.length;
                    cy = ys.reduce((s, v) => s + v, 0) / ys.length;
                }
                const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                lbl.setAttribute('x', cx);
                lbl.setAttribute('y', cy);
                lbl.setAttribute('fill', 'var(--accent)');
                lbl.setAttribute('font-size', '14');
                lbl.setAttribute('font-weight', 'bold');
                lbl.setAttribute('text-anchor', 'middle');
                lbl.setAttribute('dominant-baseline', 'middle');
                lbl.setAttribute('pointer-events', 'none');
                lbl.textContent = zoneName;
                analysisLayer?.appendChild(lbl);
                roomResults.push({ area: room.area, perimeter: room.perimeter, corridor, minDim, zone: zoneName });
            });
            // --- Подсчёт посадочных мест ---
            let totalSeats = 0;
            const seatsPerRoom = rooms.map(() => 0);
            const pointInPoly = (pt, poly) => {
                let inside = false;
                for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
                    const xi = poly[i].x, yi = poly[i].y;
                    const xj = poly[j].x, yj = poly[j].y;
                    const intersect = ((yi > pt.y) !== (yj > pt.y)) && (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
                    if (intersect) inside = !inside;
                }
                return inside;
            };
            const allObjects = Array.from(dom.itemsContainer.querySelectorAll('.layout-object'));
            allObjects.forEach(el => {
                const m = getModel(el);
                const tpl = m.tpl;
                const seats = ITEM_TEMPLATES[tpl]?.seats || 0;
                if (seats > 0) {
                    totalSeats += seats;
                    const pt = { x: m.x, y: m.y };
                    rooms.forEach((room, idx) => {
                        if (pointInPoly(pt, room.points)) seatsPerRoom[idx] += seats;
                    });
                }
            });
            // --- Проверка коллизий ---
            const getBoundingBox = (el) => {
                try {
                    const bbox = el.getBBox();
                    if (bbox) {
                        return { x: bbox.x, y: bbox.y, w: bbox.width, h: bbox.height };
                    }
                } catch (err) {
                    // Если getBBox недоступен, перейдём к ручному расчёту ниже
                }
                const m = getModel(el);
                const w = m.ow * m.sx;
                const h = m.oh * m.sy;
                const halfW = w / 2;
                const halfH = h / 2;
                const rad = (m.a || 0) * Math.PI / 180;
                const cos = Math.cos(rad);
                const sin = Math.sin(rad);
                const corners = [
                    { x: -halfW, y: -halfH },
                    { x: halfW, y: -halfH },
                    { x: halfW, y: halfH },
                    { x: -halfW, y: halfH }
                ].map(({ x, y }) => ({
                    x: m.x + x * cos - y * sin,
                    y: m.y + x * sin + y * cos
                }));
                const xs = corners.map(p => p.x);
                const ys = corners.map(p => p.y);
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);
                return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
            };
            const boxesOverlap = (a, b) => {
                return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
            };
            let collisionCount = 0;
            for (let i = 0; i < allObjects.length; i++) {
                for (let j = i + 1; j < allObjects.length; j++) {
                    const a = getBoundingBox(allObjects[i]);
                    const b = getBoundingBox(allObjects[j]);
                    if (boxesOverlap(a, b)) {
                        collisionCount++;
                        allObjects[i].classList.add('collision');
                        allObjects[j].classList.add('collision');
                    }
                }
            }
            const comps = Array.from(dom.wallComponentsContainer.querySelectorAll('.wall-component'));
            comps.forEach(comp => {
                // Некоторые узлы могут не быть SVG‑элементами, поэтому проверяем наличие метода getBBox
                if (typeof comp.getBBox === 'function') {
                    try {
                        const bbox = comp.getBBox();
                        const compBox = { x: bbox.x, y: bbox.y, w: bbox.width, h: bbox.height };
                        allObjects.forEach(obj => {
                            const oBox = getBoundingBox(obj);
                            if (boxesOverlap(compBox, oBox)) {
                                collisionCount++;
                                obj.classList.add('collision');
                                comp.classList.add('collision');
                            }
                        });
                    } catch (ex) {
                        // если getBBox неожиданно бросает исключение, пропускаем компонент
                    }
                }
            });
            // --- Формирование сообщений ---
            // Заполнить хранилище результатов анализа для экспорта CSV
            const analysisResult = { rooms: [], totalSeats: 0, sumArea: 0, sumPerimeter: 0, estimate: 0, collisions: 0 };

            if (rooms.length > 0) {
                messages.push(`Помещений обнаружено: ${rooms.length}`);
                // Итоги по помещениям
                let sumArea = 0;
                let sumPerimeter = 0;
                roomResults.forEach((res, idx) => {
                    const areaM2 = res.area / (pixelsPerMeter * pixelsPerMeter);
                    const perimeterM = res.perimeter / pixelsPerMeter;
                    sumArea += areaM2;
                    sumPerimeter += perimeterM;
                    const seats = seatsPerRoom[idx];
                    const corridorWidthM = (res.corridor / pixelsPerMeter).toFixed(1);
                    // нормативная ширина коридора 1 метр
                    const corridorOk = (res.corridor / pixelsPerMeter) >= state.normativeCorridorGuest ? 'норма' : 'узко';
                    // проверка радиуса разворота (минимальный размер ≥ нормативRadius м)
                    const radiusOk = (res.minDim / pixelsPerMeter) >= state.normativeRadius ? 'норма' : 'мал радиус';
                    messages.push(`Помещение #${idx + 1} (${res.zone}): площадь ${areaM2.toFixed(1)} м², периметр ${perimeterM.toFixed(1)} м, мест ${seats}, мин. ширина ${corridorWidthM} м (${corridorOk}), радиус (${radiusOk})`);
                    // Добавляем в анализ для экспорта
                    analysisResult.rooms.push({
                        index: idx + 1,
                        zone: res.zone,
                        area_m2: parseFloat(areaM2.toFixed(2)),
                        perimeter_m: parseFloat(perimeterM.toFixed(2)),
                        seats: seats,
                        corridor_m: parseFloat(corridorWidthM),
                        corridor_status: corridorOk,
                        radius_status: radiusOk
                    });
                });
                // Черновая смета
                const priceArea = 50; // условная стоимость отделки за м²
                const pricePerimeter = 10; // условная стоимость плинтуса за метр
                const estimate = sumArea * priceArea + sumPerimeter * pricePerimeter;
                messages.push(`Всего посадочных мест: ${totalSeats}`);
                messages.push(`Черновая смета: ${estimate.toFixed(0)} (площадь ${sumArea.toFixed(1)} м² × ${priceArea}/м² + периметр ${sumPerimeter.toFixed(1)} м × ${pricePerimeter}/м)`);
                // Записываем в analysisResult
                analysisResult.totalSeats = totalSeats;
                analysisResult.sumArea = parseFloat(sumArea.toFixed(2));
                analysisResult.sumPerimeter = parseFloat(sumPerimeter.toFixed(2));
                analysisResult.estimate = parseFloat(estimate.toFixed(2));
            } else {
                messages.push('Замкнутых помещений не обнаружено');
                messages.push(`Всего посадочных мест: ${totalSeats}`);
                analysisResult.totalSeats = totalSeats;
            }
            messages.push(`Обнаружено конфликтов: ${collisionCount}`);
            analysisResult.collisions = collisionCount;
            const msg = messages.join('\n');
            utils.showToast(msg, Math.max(3000, msg.length * 60));
            // Сохраняем результаты для последующего экспорта в CSV
            state.lastAnalysis = analysisResult;
        } catch (err) {
            console.error(err);
            utils.showToast('Ошибка анализа: ' + err.message, 5000);
        }
    }

    /**
     * Загружает готовый мастер‑проект кофейни (пример) на пустой холст.
     * Все текущие элементы будут удалены. Стены и мебель расставлены
     * с использованием существующих шаблонов. После загрузки
     * автоматически создаётся история для отката.
     */
    function loadMasterProject() {
        try {
            // подтверждение для перезаписи текущего проекта
            const proceed = confirm('Загрузить шаблон? Текущие изменения будут потеряны.');
            if (!proceed) return;
            // Очистка существующей сцены
            restore({ items: [], walls: [], components: [] });
            // Размер помещения: 10×8 метров (500×400 px при сетке 50)
            const roomWidth = 500;
            const roomHeight = 400;
            // Создание стен прямоугольника
            const wallPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            wallPath.setAttribute('d', `M 0 0 L ${roomWidth} 0 L ${roomWidth} ${roomHeight} L 0 ${roomHeight} Z`);
            dom.wallsContainer.appendChild(wallPath);
            // Добавление нескольких мебельных элементов
            const objects = [
                { tpl: 'bar-counter-straight', x: roomWidth / 2, y: 60 },
                { tpl: 'dining-4', x: 120, y: 150 },
                { tpl: 'dining-4', x: 380, y: 150 },
                { tpl: 'dining-4', x: 120, y: 300 },
                { tpl: 'dining-4', x: 380, y: 300 },
                { tpl: 'sofa-2', x: roomWidth / 2, y: roomHeight - 80 },
                { tpl: 'armchair', x: roomWidth / 2 - 80, y: roomHeight - 80 },
                { tpl: 'armchair', x: roomWidth / 2 + 80, y: roomHeight - 80 }
            ];
            objects.forEach(obj => {
                const el = createLayoutObject(obj.tpl, obj.x, obj.y);
                // По умолчанию createLayoutObject уже commit-ит добавление
            });
            updateLayersList();
            commit('template');
            utils.showToast('Шаблон загружен');
        } catch (err) {
            console.error(err);
            utils.showToast('Не удалось загрузить шаблон');
        }
    }

    /**
     * Экспортирует результаты анализа в CSV файл. Если анализ ещё не проводился,
     * перед экспортом инициируется вычисление. CSV включает по строке на каждое
     * помещение с указанием зоны, площади, периметра, количества мест,
     * ширины коридора и статусов нормативов, а также итоговые суммы,
     * смету и количество коллизий.
     */
    function exportCsv() {
        try {
            // Если нет результатов анализа, запустим анализ.
            if (!state.lastAnalysis || !state.lastAnalysis.rooms || state.lastAnalysis.rooms.length === 0) {
                analysisLayout();
            }
            const res = state.lastAnalysis;
            if (!res || !res.rooms) {
                utils.showToast('Нет данных для экспорта');
                return;
            }
            const lines = [];
            // Заголовок
            lines.push('Номер,Зона,Площадь (м²),Периметр (м),Места,Ширина коридора (м),Статус коридора,Статус радиуса');
            res.rooms.forEach(room => {
                lines.push([room.index, room.zone, room.area_m2, room.perimeter_m, room.seats, room.corridor_m, room.corridor_status, room.radius_status].join(','));
            });
            // Сводка
            lines.push('Сводка,,,,,,');
            lines.push(['Всего','', res.sumArea, res.sumPerimeter, res.totalSeats,'','',''].join(','));
            lines.push(['Смета','', res.estimate,'','','','',''].join(','));
            lines.push(['Коллизии','', res.collisions,'','','','',''].join(','));
            const csv = lines.join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'analysis.csv';
            link.click();
            URL.revokeObjectURL(link.href);
            utils.showToast('Смета CSV экспортирована');
        } catch (err) {
            console.error(err);
            utils.showToast('Ошибка экспорта CSV');
        }
    }

    // --- HISTORY (UNDO/REDO) ---
    function snapshot() { return { items: Array.from(dom.itemsContainer.children).filter(n => n.classList.contains('layout-object')).map(getModel), walls: Array.from(dom.wallsContainer.children).map(w => w.getAttribute('d')), components: Array.from(dom.wallComponentsContainer.children).map(c => c.outerHTML) }; }
    function restore(data) {
        state.history.lock = true;
        
        // Clear existing elements
        Array.from(dom.itemsContainer.children).slice().forEach(n => { if (n.classList.contains('layout-object')) { interact(n).unset(); n.remove(); } });
        dom.wallsContainer.innerHTML = '';
        dom.wallComponentsContainer.innerHTML = '';
        
        // Restore elements safely
        (data.items || []).forEach(m => { const el = createLayoutObject(m.tpl, m.x, m.y); setModel(el, m); el.style.display = m.visible ? '' : 'none'; });
        (data.walls || []).forEach(d => { const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', d); dom.wallsContainer.appendChild(path); });
        
        // Safer component restoration
        const tempDiv = document.createElement('div');
        (data.components || []).forEach(c => {
            tempDiv.innerHTML = c;
            dom.wallComponentsContainer.appendChild(tempDiv.firstChild);
        });
        
        clearSelections();
        state.history.lock = false;
        updateLayersList();
    }
    function commit(reason) { if (state.history.lock) return; const snap = snapshot(); state.history.stack = state.history.stack.slice(0, state.history.idx + 1); state.history.stack.push(snap); state.history.idx++; localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snap)); if (reason !== 'add_wall') { updateLayersList(); } }
    function undo() { if (state.history.idx > 0) { state.history.idx--; restore(state.history.stack[state.history.idx]); } }
    function redo() { if (state.history.idx < state.history.stack.length - 1) { state.history.idx++; restore(state.history.stack[state.history.idx]); } }
    
    // --- EVENT HANDLERS ---
    function onLayersClick(e) { const li = e.target.closest('li'); if (!li) return; const id = li.dataset.id; const el = dom.itemsContainer.querySelector(`[data-id="${id}"]`); if (!el) return; const model = getModel(el); if (e.target.classList.contains('layer-vis')) { model.visible = !model.visible; el.style.display = model.visible ? '' : 'none'; setModel(el, model); commit('visibility'); } else if (e.target.classList.contains('layer-lock')) { model.locked = !model.locked; setModel(el, model); commit('lock'); } else { if (model.locked) { utils.showToast('Объект заблокирован'); return; } selectObject(el); } }
    function handleKeyDown(e) {
        // не реагировать на ввод в полях
        if (e.target.matches('input,select')) return;

        // Escape: завершить стену
        if (e.key === 'Escape' && state.activeTool === 'wall') {
            finishCurrentWall();
            return;
        }

        // удержание Shift для шагового поворота
        if (e.key === 'Shift') state.isShiftHeld = true;

        // пробел включает панорамирование
        if (e.code === 'Space') state.isSpaceDown = true;

        // Горячие клавиши для переключения инструмента (без модификаторов)
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            switch (e.key.toLowerCase()) {
                case 'v': toggleTool('pointer'); e.preventDefault(); return;
                case 'w': toggleTool('wall'); e.preventDefault(); return;
                case 'd': toggleTool('door'); e.preventDefault(); return;
                case 'o': toggleTool('window'); e.preventDefault(); return;
                case 'm': toggleTool('measure'); e.preventDefault(); return;
            }
        }

        // Обработка сочетаний с Ctrl/Meta
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'z':
                    e.preventDefault();
                    undo();
                    return;
                case 'y':
                    e.preventDefault();
                    redo();
                    return;
                case 'd':
                    e.preventDefault();
                    if (state.selectedObject) duplicateObject(state.selectedObject);
                    return;
                case 'c':
                    if (state.selectedObject) {
                        sessionStorage.setItem('clipboard-layout', JSON.stringify(getModel(state.selectedObject)));
                        utils.showToast('Скопировано');
                    }
                    return;
                case 'v': {
                    const raw = sessionStorage.getItem('clipboard-layout');
                    if (!raw) return;
                    try {
                        const m2 = JSON.parse(raw);
                        m2.x += 12;
                        m2.y += 12;
                        const el = createLayoutObject(m2.tpl, m2.x, m2.y);
                        setModel(el, m2);
                        selectObject(el);
                        commit('paste');
                    } catch (err) {}
                    return;
                }
            }
        }

        // Фокусировка на выбранном объекте по клавише F
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            if (e.key.toLowerCase() === 'f') {
                e.preventDefault();
                focusSelected();
                return;
            }
        }

        // Удаление объектов
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (state.selectedObject) deleteObject(state.selectedObject);
            if (state.selectedWall) {
                state.selectedWall.remove();
                clearSelections();
                commit('delete_wall');
            }
            if (state.selectedComponent) {
                state.selectedComponent.remove();
                clearSelections();
                commit('delete_component');
            }
            return;
        }

        // Движение выделенного
        if (!state.selectedObject) return;
        const model = getModel(state.selectedObject);
        if (model.locked) return;
        let moved = false;
        const step = e.shiftKey ? 1 : 10;
        switch (e.key) {
            case 'ArrowLeft':
                model.x -= step;
                moved = true;
                break;
            case 'ArrowRight':
                model.x += step;
                moved = true;
                break;
            case 'ArrowUp':
                model.y -= step;
                moved = true;
                break;
            case 'ArrowDown':
                model.y += step;
                moved = true;
                break;
        }
        if (moved) {
            e.preventDefault();
            setModel(state.selectedObject, model);
        }

        // Дополнительные операции с выделенным
        switch (e.key.toLowerCase()) {
            case 'r':
                model.a = (model.a + 90) % 360;
                setModel(state.selectedObject, model);
                commit('rotate90');
                break;
            case 'f':
                dom.itemsContainer.appendChild(state.selectedObject);
                commit('front');
                break;
            case 'b':
                dom.itemsContainer.prepend(state.selectedObject);
                commit('back');
                break;
        }
    }
    function deleteObject(el) { if (!el) return; if (getModel(el).locked) { utils.showToast('Объект заблокирован'); return; } interact(el).unset(); el.remove(); selectObject(null); commit('delete'); }
    function duplicateObject(el) { if (getModel(el).locked) { utils.showToast('Объект заблокирован'); return; } const m = getModel(el); m.x += 16; m.y += 16; const copy = createLayoutObject(m.tpl, m.x, m.y); setModel(copy, m); selectObject(copy); commit('duplicate'); }
    function handleKeyUp(e) {
        if (e.key === 'Shift') state.isShiftHeld = false;
        // отпускание пробела отключает панорамирование
        if (e.code === 'Space') state.isSpaceDown = false;
        if (state.selectedObject && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            snapSelectedToGrid(state.selectedObject);
            commit('nudge');
        }
    }

    function bindEventListeners() {
        dom.svg.addEventListener('mousedown', e => {
            // Завершение стены ПКМ
            if (e.button === 2) {
                e.preventDefault();
                if (state.activeTool === 'wall') finishCurrentWall();
                return;
            }

            // Панорамирование средней кнопкой или пробелом
            if ((e.button === 1 || state.isSpaceDown) && state.activeTool === 'pointer') {
                startPan(e);
                return;
            }

            // Измерительный инструмент
            if (state.activeTool === 'measure') {
                const p = utils.toSVGPoint(e.clientX, e.clientY);
                // Если ещё не зафиксировали первую точку, запоминаем её и очищаем только визуальный слой,
                // не сбрасывая массив measurePoints. Это позволяет правильно отрисовать вторую точку.
                if (state.measurePoints.length === 0) {
                    state.measurePoints.push(p);
                    // очищаем прошлые линии, но не сбрасываем measurePoints
                    if (dom.measurementLayer) dom.measurementLayer.innerHTML = '';
                } else if (state.measurePoints.length === 1) {
                    // Завершаем измерение: добавляем вторую точку, рисуем линию и подпись, затем сбрасываем state.measurePoints
                    state.measurePoints.push(p);
                    drawMeasurementLine(state.measurePoints[0], state.measurePoints[1]);
                    finalizeMeasurement();
                }
                return;
            }

            // Рисование стены
            if (state.activeTool === 'wall') {
                const p = utils.toSVGPoint(e.clientX, e.clientY);
                const snappedP = { x: snap(p.x), y: snap(p.y) };
                state.currentWallPoints.push(snappedP);
                const pointsAttr = state.currentWallPoints.map(pt => `${pt.x},${pt.y}`).join(' ');
                dom.wallPreview.setAttribute('points', pointsAttr);
            }
            // Установка двери/окна
            else if (state.activeTool === 'door' || state.activeTool === 'window') {
                const preview = dom.previewsContainer.firstChild;
                if (preview) {
                    const transform = preview.getAttribute('transform');
                    const regex = /translate\(([^,\s]+)[\s,]*([^)]+)\)\srotate\(([^)]+)\)/;
                    const match = transform.match(regex);
                    if (match) {
                        placeWallComponent(state.activeTool, { x: parseFloat(match[1]), y: parseFloat(match[2]) }, parseFloat(match[3]));
                    }
                }
            }
            // Выбор объектов (указатель)
            else {
                if (e.button === 0) {
                    const interactive = e.target.closest('.layout-object, .wall-component, #walls path');
                    if (!interactive) {
                        e.preventDefault();
                        startPan(e);
                        return;
                    }
                }
                const t = e.target.closest('.layout-object');
                if (t) { selectObject(t); return; }
                const w = e.target.closest('#walls path');
                if (w) { selectWall(w); return; }
                const c = e.target.closest('.wall-component');
                if (c) { selectComponent(c); return; }
                clearSelections();
                dom.ctx.style.display = 'none';
            }
        });
        dom.svg.addEventListener('mousemove', utils.rafThrottle(e => {
            const tool = state.activeTool;
            const p = utils.toSVGPoint(e.clientX, e.clientY);
            // Обновление превью стены
            if (tool === 'wall' && state.currentWallPoints.length > 0) {
                const snappedP = { x: snap(p.x), y: snap(p.y) };
                const pointsAttr = [...state.currentWallPoints, snappedP].map(pt => `${pt.x},${pt.y}`).join(' ');
                dom.wallPreview.setAttribute('points', pointsAttr);
            }
            // Превью дверей/окон
            else if (tool === 'door' || tool === 'window') {
                dom.previewsContainer.innerHTML = '';
                const walls = Array.from(dom.wallsContainer.children);
                let closest = { dist: Infinity, point: null, angle: 0, wall: null };
                walls.forEach(wall => {
                    const len = wall.getTotalLength();
                    for (let i = 0; i < len; i += 5) {
                        const pt1 = wall.getPointAtLength(i);
                        const pt2 = wall.getPointAtLength(i + 5);
                        if (!pt2) continue;
                        const segPt = getClosestPointOnSegment(p, pt1, pt2);
                        const d = distance(p, segPt);
                        if (d < closest.dist) {
                            const angle = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x) * 180 / Math.PI;
                            closest = { dist: d, point: segPt, angle: angle, wall: wall };
                        }
                    }
                });
                if (closest.dist < 50) {
                    const el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    const visual = tool === 'door'
                        ? `<path d="M -40 0 A 40 40 0 0 1 0 -40" stroke="#8B4513" stroke-width="2" fill="rgba(255,228,196,0.5)"/><line x1="-40" y1="0" x2="-40" y2="-5" stroke="#8B4513" stroke-width="2"/>`
                        : `<rect x="-60" y="-5.5" width="120" height="11" fill="rgba(163,213,255,0.7)" stroke="#5b9ad4" stroke-width="2" />`;
                    el.innerHTML = visual;
                    el.setAttribute('transform', `translate(${closest.point.x}, ${closest.point.y}) rotate(${closest.angle})`);
                    dom.previewsContainer.appendChild(el);
                }
            }
            // Динамическое измерение: если одна точка выбрана, рисуем линию к курсору
            else if (tool === 'measure' && state.measurePoints.length === 1) {
                const p0 = state.measurePoints[0];
                drawMeasurementLine(p0, p);
            }
        }));
        // Контекстное меню открывается только в режиме указателя. По ПКМ выбираем объект и отображаем меню.
        dom.svg.addEventListener('contextmenu', e => {
            e.preventDefault();
            // Показываем меню только при активном инструменте "указатель"
            if (state.activeTool !== 'pointer') return;
            const t = e.target.closest('.layout-object');
            if (!t) return;
            selectObject(t);
            const r = dom.ctx.getBoundingClientRect();
            dom.ctx.style.display = 'block';
            dom.ctx.style.left = Math.min(window.innerWidth - r.width - 8, Math.max(8, e.clientX)) + 'px';
            dom.ctx.style.top = Math.min(window.innerHeight - r.height - 8, Math.max(8, e.clientY)) + 'px';
        });
        window.addEventListener('click', () => dom.ctx.style.display = 'none');
        dom.propControls.addEventListener('change', updateFromProperties);
        dom.propControls.addEventListener('keydown', e => e.stopPropagation());
        dom.layersList.addEventListener('click', onLayersClick);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        dom.toggleSidebar?.addEventListener('click', () => dom.sidebar.classList.toggle('visible'));
        dom.toggleProperties?.addEventListener('click', () => dom.properties.classList.toggle('visible'));
        dom.main.addEventListener('click', e => { if (window.innerWidth <= 1024 && !e.target.closest('.ui-bar')) { dom.sidebar.classList.remove('visible'); dom.properties.classList.remove('visible'); }});
        
        ['pointer', 'wall', 'door', 'window', 'measure'].forEach(tool => {
            const button = dom[`tool${tool.charAt(0).toUpperCase() + tool.slice(1)}`];
            if (button) button.addEventListener('click', () => toggleTool(tool));
        });

        dom.gridSelect.addEventListener('change', updateGridSize);
        dom.btnExport.addEventListener('click', () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(snapshot(), null, 2)], { type: 'application/json' })); a.download = 'layout.json'; a.click(); URL.revokeObjectURL(a.href); });
        dom.btnImport.addEventListener('click', () => dom.fileImport.click());
        dom.fileImport.addEventListener('change', e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const data = JSON.parse(r.result); restore(data); commit('import'); utils.showToast('План импортирован'); } catch (err) { utils.showToast('Ошибка импорта'); } }; r.readAsText(f); });

        // Запуск анализа планировки по нажатию кнопки "Анализ"
        if (dom.btnAnalysis) {
            dom.btnAnalysis.addEventListener('click', () => {
                analysisLayout();
            });
        }

        // Загрузка мастер‑проекта по нажатию кнопки "Шаблон"
        if (dom.btnTemplate) {
            dom.btnTemplate.addEventListener('click', () => {
                loadMasterProject();
            });
        }

        // Экспорт сметы в CSV
        if (dom.btnCsv) {
            dom.btnCsv.addEventListener('click', () => {
                exportCsv();
            });
        }

        // Фокусировка на выбранном объекте через пункт контекстного меню
        if (dom.ctxFocus) {
            dom.ctxFocus.addEventListener('click', () => {
                focusSelected();
                dom.ctx.style.display = 'none';
            });
        }

        // Масштабирование колесом мыши
        dom.svg.addEventListener('wheel', e => {
            // Если пользователь прокручивает внутри SVG, увеличиваем или уменьшаем масштаб
            // Отменяем стандартное поведение прокрутки страницы
            e.preventDefault();
            // Количество «щелчков» колеса определяет масштаб
            const delta = e.deltaY;
            const factor = Math.pow(1.1, delta > 0 ? 1 : -1);
            const p = utils.toSVGPoint(e.clientX, e.clientY);
            zoomAt(p, factor);
        }, { passive: false });

        // Панорамирование перемещением мыши
        window.addEventListener('mousemove', panMove);
        window.addEventListener('mouseup', endPan);
    }
    
    function init() {
        // Populate sidebar
        const fragment = document.createDocumentFragment();
        FURNITURE_CATEGORIES.forEach(cat => {
            const h3 = document.createElement('h3'); h3.textContent = cat.name; fragment.appendChild(h3);
            cat.items.forEach(item => {
                const div = document.createElement('div'); div.className = 'draggable-item'; div.dataset.template = item.id; div.textContent = item.label; fragment.appendChild(div);
            });
        });
        dom.sidebar.insertBefore(fragment, dom.layersPanel);

        // Setup interact.js
        interact('.draggable-item').draggable({ inertia: true, autoScroll: true, listeners: { start(e) { const g = e.target.cloneNode(true); Object.assign(g.style, { position: 'absolute', opacity: .7, pointerEvents: 'none', zIndex: 1000 }); document.body.appendChild(g); e.interaction.ghost = g; }, move(e) { const g = e.interaction.ghost; if (!g) return; g.style.left = `${e.clientX - e.rect.width / 2}px`; g.style.top = `${e.clientY - e.rect.height / 2}px`; }, end(e) { e.interaction.ghost?.remove(); } } });
        interact(dom.svg).dropzone({ accept: '.draggable-item', listeners: { drop(e) { const tpl = e.relatedTarget.dataset.template; const viewBox = dom.svg.viewBox.baseVal; const centerX = viewBox.x + viewBox.width / 2; const centerY = viewBox.y + viewBox.height / 2; const obj = createLayoutObject(tpl, centerX, centerY); selectObject(obj); }, dragenter: e => e.target.style.outline = '2px dashed var(--accent)', dragleave: e => e.target.style.outline = 'none', dropdeactivate: e => e.target.style.outline = 'none' } });
        interact(dom.trash).dropzone({ accept: '.layout-object', ondragenter: e => e.target.classList.add('drag-enter'), ondragleave: e => e.target.classList.remove('drag-enter'), ondrop: e => { deleteObject(e.relatedTarget); e.target.classList.remove('drag-enter'); } });
        
        // Bind all event listeners
        bindEventListeners();

        // Final setup
        toggleTool('pointer');
        updateGridSize();

        // Инициализация ViewBox для поддержания масштабирования и панорамирования
        state.viewBox = {
            x: dom.svg.viewBox.baseVal.x,
            y: dom.svg.viewBox.baseVal.y,
            width: dom.svg.viewBox.baseVal.width,
            height: dom.svg.viewBox.baseVal.height
        };
        
        // Load saved data robustly
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) { 
                restore(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load or restore layout, starting fresh.", e);
            // If restoring fails, we still have a working app, just empty.
        }
        
        commit('init');
    }

    init();
})();

