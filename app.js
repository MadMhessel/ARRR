"use strict";
(() => {
    // --- CONSTANTS & STATE ---
    const LOCAL_STORAGE_KEY = 'layout-v10-pro'; // Incremented version to avoid loading old potentially corrupt data
    const dom = {
        svg: document.getElementById('svg'),
        itemsContainer: document.getElementById('items-layer'),
        wallsContainer: document.getElementById('walls-layer'),
        wallComponentsContainer: document.getElementById('openings-layer'),
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
        wallTypePanel: document.getElementById('wall-properties'),
        wallTypeOptions: document.getElementById('wall-type-options'),
        wallTypeCaption: document.getElementById('wall-type-caption'),
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
        measurementLayer: document.getElementById('measurement-layer'),
        // слой для результатов анализа
        analysisLayer: document.getElementById('analysis-layer'),
        wallLengthLabel: document.getElementById('wall-length-label'),
        // контекстное меню: фокусировка на объекте
        ctxFocus: document.getElementById('ctx-focus'),
        measureTableBody: document.getElementById('measure-table-body'),
        measureClear: document.getElementById('measure-clear'),
        analysisSummary: document.getElementById('analysis-summary'),
        analysisRoomsBody: document.getElementById('analysis-rooms-body'),
        analysisRefresh: document.getElementById('analysis-refresh'),
        normativeCorridorGuest: document.getElementById('normative-corridor-guest'),
        normativeCorridorStaff: document.getElementById('normative-corridor-staff'),
        normativeRadius: document.getElementById('normative-radius'),
        pricingPreset: document.getElementById('pricing-preset'),
        rateFinish: document.getElementById('rate-finish'),
        ratePerimeter: document.getElementById('rate-perimeter'),
        rateEngineering: document.getElementById('rate-engineering'),
    };
    const state = {
        selectedObject: null,
        selectedWall: null,
        selectedComponent: null,
        objectCounter: 0,
        isShiftHeld: false,
        gridSize: 50,
        pixelsPerMeter: 50,
        gridStepMeters: 1,
        history: { stack: [], idx: -1, lock: false },
        activeTool: 'pointer',
        currentWallPoints: [],
        defaultWallType: 'structural',
        // Хранилище для измерительного инструмента
        measurePoints: [],
        measurements: [],
        measureCounter: 0,
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
        lastAnalysis: null,
        // Хранилище выбранного узла стены для редактирования
        selectedWallHandle: null,
        wallCounter: 0,
        componentCounter: 0,
        estimatePreset: 'standard',
        estimateRates: { finish: 50, perimeter: 10, engineering: 35 },
        pendingComponentPlacement: null
    };
    const wallStore = new Map();
    const wallIdMap = new Map();
    const componentStore = new Map();
    const componentIdMap = new Map();
    const WALL_TYPES = [
        { id: 'structural', label: 'Капитальная', description: 'Несущая стена, толщина ~250 мм' },
        { id: 'partition', label: 'Перегородка', description: 'Лёгкая перегородка, толщина ~100 мм' },
        { id: 'glass', label: 'Стеклянная', description: 'Витраж или стеклянная перегородка' },
        { id: 'half', label: 'Полустена', description: 'Парапет, барная стойка или ограждение' }
    ];
    const ESTIMATE_PRESETS = {
        standard: { finish: 50, perimeter: 12, engineering: 35 },
        economy: { finish: 35, perimeter: 8, engineering: 20 },
        premium: { finish: 85, perimeter: 18, engineering: 55 }
    };
    const GRID_MIN_METERS = 0.05;
    const GRID_MAX_METERS = 20;
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
    function polygonArea(pts) {
        let area = 0;
        for (let i = 0; i < pts.length; i++) {
            const j = (i + 1) % pts.length;
            area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
        }
        return area / 2;
    }
    function polygonPerimeter(pts) {
        let peri = 0;
        for (let i = 0; i < pts.length; i++) {
            const j = (i + 1) % pts.length;
            peri += distance(pts[i], pts[j]);
        }
        return peri;
    }
    function pointInPolygon(pt, poly) {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const xi = poly[i].x, yi = poly[i].y;
            const xj = poly[j].x, yj = poly[j].y;
            const intersect = ((yi > pt.y) !== (yj > pt.y)) && (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi + 0.0000001) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
    function polygonCentroid(pts) {
        let cx = 0, cy = 0, area = 0;
        for (let i = 0; i < pts.length; i++) {
            const j = (i + 1) % pts.length;
            const f = pts[i].x * pts[j].y - pts[j].x * pts[i].y;
            cx += (pts[i].x + pts[j].x) * f;
            cy += (pts[i].y + pts[j].y) * f;
            area += f;
        }
        area *= 0.5;
        if (Math.abs(area) < 1e-6) {
            const avgX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
            const avgY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
            return { x: avgX, y: avgY };
        }
        const factor = 1 / (6 * area);
        return { x: cx * factor, y: cy * factor };
    }

    // --- WALL TYPE HELPERS & UI ---
    function ensureWallType(value) {
        if (typeof value === 'string') {
            const trimmed = value.trim().toLowerCase();
            const direct = WALL_TYPES.find(t => t.id === trimmed);
            if (direct) return direct.id;
            if (trimmed.includes('капит')) return 'structural';
            if (trimmed.includes('перегор') || trimmed.includes('partition')) return 'partition';
            if (trimmed.includes('glass') || trimmed.includes('стек')) return 'glass';
            if (trimmed.includes('half') || trimmed.includes('парап') || trimmed.includes('бар')) return 'half';
        }
        return WALL_TYPES[0].id;
    }

    function getWallTypeMeta(id) {
        const resolved = ensureWallType(id);
        return WALL_TYPES.find(t => t.id === resolved) || WALL_TYPES[0];
    }

    function highlightWallType(typeId) {
        if (!dom.wallTypeOptions) return;
        const resolved = ensureWallType(typeId);
        dom.wallTypeOptions.querySelectorAll('button[data-type]').forEach(btn => {
            const isActive = btn.dataset.type === resolved;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
    }

    function updateWallTypeCaption(mode = 'default', typeId = state.defaultWallType) {
        if (!dom.wallTypeCaption) return;
        const meta = getWallTypeMeta(typeId);
        const prefix = mode === 'selected' ? 'Выбранная стена:' : 'Новые стены:';
        dom.wallTypeCaption.textContent = `${prefix} ${meta.label}`;
    }

    function initWallTypeOptions() {
        if (!dom.wallTypeOptions) return;
        dom.wallTypeOptions.innerHTML = '';
        WALL_TYPES.forEach(type => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'wall-type-option';
            btn.dataset.type = type.id;
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-checked', 'false');
            btn.title = type.description;
            btn.innerHTML = `<svg viewBox="0 0 48 18" aria-hidden="true" focusable="false"><line x1="4" y1="9" x2="44" y2="9"></line></svg><span>${type.label}</span>`;
            dom.wallTypeOptions.appendChild(btn);
        });
        dom.wallTypeOptions.addEventListener('click', e => {
            const btn = e.target.closest('button[data-type]');
            if (!btn) return;
            handleWallTypeOptionClick(btn.dataset.type);
        });
        dom.wallTypeOptions.addEventListener('keydown', e => {
            const btn = e.target.closest('button[data-type]');
            if (!btn) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleWallTypeOptionClick(btn.dataset.type);
            }
        });
    }

    function handleWallTypeOptionClick(typeId) {
        const resolved = ensureWallType(typeId);
        state.defaultWallType = resolved;
        highlightWallType(resolved);
        if (state.selectedWall) {
            const model = getWallModel(state.selectedWall);
            if (model) {
                if (model.type !== resolved) {
                    model.type = resolved;
                    state.selectedWall.dataset.type = resolved;
                    updateWallElementGeometry(state.selectedWall);
                    commit('wall_type');
                }
                updateWallTypeCaption('selected', resolved);
            }
        } else {
            updateWallTypeCaption('default', resolved);
            const meta = getWallTypeMeta(resolved);
            utils.showToast(`Тип стен по умолчанию: ${meta.label}`);
        }
    }

    // --- WALL LENGTH PREVIEW ---
    function hideWallLengthPreview() {
        if (!dom.wallLengthLabel) return;
        dom.wallLengthLabel.setAttribute('visibility', 'hidden');
        dom.wallLengthLabel.removeAttribute('transform');
    }

    function updateWallLengthPreview(a, b) {
        if (!dom.wallLengthLabel || !a || !b) return;
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 0.5) {
            hideWallLengthPreview();
            return;
        }
        const pxPerMeter = state.pixelsPerMeter || state.gridSize || 1;
        const meters = pxPerMeter ? len / pxPerMeter : len;
        const angleRaw = Math.atan2(dy, dx) * 180 / Math.PI;
        const angle = angleRaw > 90 || angleRaw < -90 ? angleRaw + 180 : angleRaw;
        dom.wallLengthLabel.textContent = `${meters.toFixed(2)} м`;
        dom.wallLengthLabel.setAttribute('x', midX);
        dom.wallLengthLabel.setAttribute('y', midY);
        dom.wallLengthLabel.setAttribute('transform', `rotate(${angle} ${midX} ${midY})`);
        dom.wallLengthLabel.setAttribute('visibility', 'visible');
    }

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
    function clearSelections() {
        if (state.selectedObject) { state.selectedObject.classList.remove('selected'); state.selectedObject = null; }
        if (state.selectedWall) { state.selectedWall.classList.remove('selected'); state.selectedWall = null; }
        if (state.selectedComponent) { state.selectedComponent.classList.remove('selected'); state.selectedComponent = null; }
        state.selectedWallHandle = null;
        dom.layersList.querySelector('.selected')?.classList.remove('selected');
        updatePropertiesPanel(null);
        highlightWallType(state.defaultWallType);
        updateWallTypeCaption('default', state.defaultWallType);
    }

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
    function selectWall(wallEl) {
        if (state.activeTool !== 'pointer') return;
        const wall = ensureWallElement(wallEl);
        if (!wall) return;
        clearSelections();
        state.selectedWall = wall;
        state.selectedWall.classList.add('selected');
        const model = getWallModel(wall);
        if (model) {
            const resolved = ensureWallType(model.type || state.defaultWallType);
            model.type = resolved;
            wall.dataset.type = resolved;
            state.defaultWallType = resolved;
            highlightWallType(resolved);
            updateWallTypeCaption('selected', resolved);
        }
        updateWallHandles(wall);
    }
    function selectComponent(compEl) { if (state.activeTool !== 'pointer') return; clearSelections(); state.selectedComponent = compEl; if (state.selectedComponent) { state.selectedComponent.classList.add('selected'); } }

    // --- WALL DATA MODEL & EDITING ---
    let wallHandleDrag = null;

    function ensureWallElement(el) {
        if (!el) return null;
        return el.classList.contains('wall') ? el : el.closest('.wall');
    }

    function getWallModel(el) {
        const wallEl = ensureWallElement(el);
        return wallEl ? wallStore.get(wallEl) || null : null;
    }

    function setWallModel(el, model) {
        const wallEl = ensureWallElement(el);
        if (!wallEl || !model) return;
        wallStore.set(wallEl, model);
        wallIdMap.set(model.id, wallEl);
        updateWallElementGeometry(wallEl);
    }

    function registerWall(wallEl, model) {
        wallStore.set(wallEl, model);
        wallIdMap.set(model.id, wallEl);
        updateWallElementGeometry(wallEl);
        makeWallInteractive(wallEl);
    }

    function getWallSegments(model) {
        const pts = model.points;
        const count = pts.length;
        const limit = model.closed ? count : count - 1;
        const segments = [];
        let accumulated = 0;
        for (let i = 0; i < limit; i++) {
            const a = pts[i];
            const b = pts[(i + 1) % count];
            const len = distance(a, b);
            segments.push({ a, b, length: len, start: accumulated, end: accumulated + len });
            accumulated += len;
        }
        return { segments, total: accumulated };
    }

    function pointAtWallDistance(model, dist) {
        const { segments, total } = getWallSegments(model);
        if (segments.length === 0) return { point: model.points[0] || { x: 0, y: 0 }, angle: 0 };
        const target = utils.clamp(dist, 0, total);
        for (const seg of segments) {
            if (target <= seg.end || seg === segments[segments.length - 1]) {
                const local = seg.length === 0 ? 0 : (target - seg.start) / seg.length;
                const x = seg.a.x + (seg.b.x - seg.a.x) * local;
                const y = seg.a.y + (seg.b.y - seg.a.y) * local;
                const angle = Math.atan2(seg.b.y - seg.a.y, seg.b.x - seg.a.x) * 180 / Math.PI;
                return { point: { x, y }, angle };
            }
        }
        const lastSeg = segments[segments.length - 1];
        const angle = Math.atan2(lastSeg.b.y - lastSeg.a.y, lastSeg.b.x - lastSeg.a.x) * 180 / Math.PI;
        return { point: { x: lastSeg.b.x, y: lastSeg.b.y }, angle };
    }

    function findClosestWallPlacement(point) {
        const result = { dist: Infinity, point: null, angle: 0, wallEl: null, distance: 0 };
        if (!point) return result;
        const walls = Array.from(dom.wallsContainer.querySelectorAll('.wall'));
        walls.forEach(wall => {
            const model = getWallModel(wall);
            if (!model) return;
            const { segments } = getWallSegments(model);
            segments.forEach(seg => {
                const segPt = getClosestPointOnSegment(point, seg.a, seg.b);
                const d = distance(point, segPt);
                if (d < result.dist) {
                    const projDist = distance(seg.a, segPt);
                    const angle = Math.atan2(seg.b.y - seg.a.y, seg.b.x - seg.a.x) * 180 / Math.PI;
                    result.dist = d;
                    result.point = { x: segPt.x, y: segPt.y };
                    result.angle = angle;
                    result.wallEl = wall;
                    result.distance = seg.start + projDist;
                }
            });
        });
        return result;
    }

    function updateWallComponentsPosition(wallEl) {
        const model = getWallModel(wallEl);
        if (!model || !model.components) return;
        model.components.forEach(comp => {
            const compEl = componentIdMap.get(comp.id);
            if (!compEl) return;
            const { point, angle } = pointAtWallDistance(model, comp.distance);
            const transform = `translate(${point.x}, ${point.y}) rotate(${angle})`;
            compEl.setAttribute('transform', transform);
        });
    }

    function updateWallHandles(wallEl) {
        const model = getWallModel(wallEl);
        if (!model) return;
        let handles = wallEl.querySelector('.wall-handles');
        if (!handles) {
            handles = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            handles.classList.add('wall-handles');
            handles.addEventListener('pointerdown', onWallHandlePointerDown);
            handles.addEventListener('dblclick', onWallHandleDoubleClick);
            wallEl.appendChild(handles);
        }
        handles.innerHTML = '';
        model.points.forEach((pt, idx) => {
            const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c.classList.add('wall-handle');
            c.dataset.index = String(idx);
            c.setAttribute('cx', pt.x);
            c.setAttribute('cy', pt.y);
            c.setAttribute('r', 6);
            if (state.selectedWallHandle && state.selectedWallHandle.wall === wallEl && state.selectedWallHandle.index === idx) {
                c.classList.add('active');
            }
            handles.appendChild(c);
        });
        let inserts = wallEl.querySelector('.wall-inserts');
        if (!inserts) {
            inserts = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            inserts.classList.add('wall-inserts');
            inserts.addEventListener('pointerdown', onWallInsertPointerDown);
            wallEl.appendChild(inserts);
        }
        inserts.innerHTML = '';
        const pts = model.points;
        const count = pts.length;
        const limit = model.closed ? count : count - 1;
        for (let i = 0; i < limit; i++) {
            const a = pts[i];
            const b = pts[(i + 1) % count];
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            const insert = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            insert.classList.add('wall-segment-insert');
            insert.dataset.index = String((i + 1) % count);
            insert.setAttribute('cx', mid.x);
            insert.setAttribute('cy', mid.y);
            insert.setAttribute('r', 5);
            inserts.appendChild(insert);
        }
    }

    function updateWallElementGeometry(wallEl) {
        const model = getWallModel(wallEl);
        if (!model) return;
        const resolvedType = ensureWallType(model.type || state.defaultWallType);
        model.type = resolvedType;
        wallEl.dataset.type = resolvedType;
        const path = wallEl.querySelector('path') || document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (!path.parentNode) wallEl.appendChild(path);
        const pts = model.points;
        if (!pts || pts.length === 0) {
            path.removeAttribute('d');
            return;
        }
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            d += ` L ${pts[i].x} ${pts[i].y}`;
        }
        if (model.closed && pts.length > 2) d += ' Z';
        path.setAttribute('d', d);
        updateWallHandles(wallEl);
        updateWallComponentsPosition(wallEl);
    }

    function createWall(points, closed = false) {
        if (!points || points.length < 2) return null;
        const wallEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        wallEl.classList.add('wall');
        const id = `wall-${++state.wallCounter}`;
        wallEl.dataset.id = id;
        const type = ensureWallType(state.defaultWallType);
        const model = { id, points: points.map(p => ({ x: p.x, y: p.y })), closed, components: [], type };
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        wallEl.appendChild(path);
        wallEl.dataset.type = type;
        dom.wallsContainer.appendChild(wallEl);
        registerWall(wallEl, model);
        return wallEl;
    }

    function insertWallVertex(wallEl, index, point) {
        const model = getWallModel(wallEl);
        if (!model) return;
        model.points.splice(index, 0, { x: point.x, y: point.y });
        updateWallElementGeometry(wallEl);
    }

    function removeWallVertex(wallEl, index) {
        const model = getWallModel(wallEl);
        if (!model) return false;
        const minPoints = model.closed ? 3 : 2;
        if (model.points.length <= minPoints) {
            utils.showToast('Нельзя удалить точку стены');
            return false;
        }
        model.points.splice(index, 1);
        updateWallElementGeometry(wallEl);
        return true;
    }

    function deleteWall(wallEl) {
        const model = getWallModel(wallEl);
        if (!model) return;
        if (model.components) {
            model.components.forEach(comp => {
                const compEl = componentIdMap.get(comp.id);
                if (compEl) {
                    componentStore.delete(compEl);
                    componentIdMap.delete(comp.id);
                    compEl.remove();
                }
            });
        }
        wallStore.delete(wallEl);
        wallIdMap.delete(model.id);
        wallEl.remove();
        if (state.selectedWall === wallEl) {
            state.selectedWall = null;
        }
        commit('wall_delete');
    }

    function onWallHandlePointerDown(e) {
        const target = e.target;
        if (!target.classList.contains('wall-handle')) return;
        const wallEl = ensureWallElement(target);
        if (state.activeTool !== 'pointer') return;
        e.preventDefault();
        const index = parseInt(target.dataset.index, 10);
        state.selectedWallHandle = { wall: wallEl, index };
        updateWallHandles(wallEl);
        if (e.altKey) {
            if (removeWallVertex(wallEl, index)) {
                commit('wall_vertex_remove');
            }
            return;
        }
        wallHandleDrag = { wall: wallEl, index };
        window.addEventListener('pointermove', onWallHandlePointerMove);
        window.addEventListener('pointerup', onWallHandlePointerUp, { once: true });
    }

    function onWallHandlePointerMove(e) {
        if (!wallHandleDrag) return;
        const wallEl = wallHandleDrag.wall;
        const model = getWallModel(wallEl);
        if (!model) return;
        const p = utils.toSVGPoint(e.clientX, e.clientY);
        const snapped = { x: snap(p.x), y: snap(p.y) };
        model.points[wallHandleDrag.index] = snapped;
        updateWallElementGeometry(wallEl);
    }

    function onWallHandlePointerUp() {
        if (!wallHandleDrag) return;
        updateWallElementGeometry(wallHandleDrag.wall);
        commit('wall_vertex_move');
        wallHandleDrag = null;
    }

    function onWallHandleDoubleClick(e) {
        const target = e.target;
        if (!target.classList.contains('wall-handle')) return;
        const wallEl = ensureWallElement(target);
        const index = parseInt(target.dataset.index, 10);
        if (removeWallVertex(wallEl, index)) {
            commit('wall_vertex_remove');
        }
    }

    function onWallInsertPointerDown(e) {
        const target = e.target;
        if (!target.classList.contains('wall-segment-insert')) return;
        if (state.activeTool !== 'pointer') return;
        e.preventDefault();
        const wallEl = ensureWallElement(target);
        const model = getWallModel(wallEl);
        if (!model) return;
        const index = parseInt(target.dataset.index, 10);
        const p = utils.toSVGPoint(e.clientX, e.clientY);
        const snapped = { x: snap(p.x), y: snap(p.y) };
        insertWallVertex(wallEl, index, snapped);
        state.selectedWallHandle = { wall: wallEl, index };
        updateWallHandles(wallEl);
        commit('wall_vertex_add');
    }

    function makeWallInteractive(wallEl) {
        if (wallEl.dataset.interactive === 'true') return;
        wallEl.dataset.interactive = 'true';
        const path = wallEl.querySelector('path');
        if (path) {
            path.addEventListener('dblclick', e => {
                if (state.activeTool !== 'pointer') return;
                const model = getWallModel(wallEl);
                if (!model) return;
                const p = utils.toSVGPoint(e.clientX, e.clientY);
                const snapped = { x: snap(p.x), y: snap(p.y) };
                // Найдём ближайший сегмент для вставки
                const pts = model.points;
                const count = pts.length;
                let bestIdx = 1;
                let bestDist = Infinity;
                const limit = model.closed ? count : count - 1;
                for (let i = 0; i < limit; i++) {
                    const a = pts[i];
                    const b = pts[(i + 1) % count];
                    const proj = getClosestPointOnSegment(snapped, a, b);
                    const d = distance(snapped, proj);
                    if (d < bestDist) {
                        bestDist = d;
                        bestIdx = (i + 1) % count;
                    }
                }
                insertWallVertex(wallEl, bestIdx, snapped);
                state.selectedWallHandle = { wall: wallEl, index: bestIdx };
                updateWallHandles(wallEl);
                commit('wall_vertex_add');
            });
        }
        updateWallHandles(wallEl);
    }

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
        state.pendingComponentPlacement = null;
        hideWallLengthPreview();
        // Покидая режим измерения — сохраняем линии, но убираем предпросмотр
        if (state.activeTool !== 'measure') {
            resetMeasurementPreview();
        }
    }
    function finishCurrentWall(forceClose = false) {
        if (state.currentWallPoints.length > 1) {
            const points = state.currentWallPoints.map(p => ({ x: p.x, y: p.y }));
            let closed = false;
            if (points.length > 2) {
                const first = points[0];
                const last = points[points.length - 1];
                const distToFirst = distance(first, last);
                if (distToFirst < Math.max(1, state.gridSize * 0.2)) {
                    points[points.length - 1] = { x: first.x, y: first.y };
                    closed = true;
                } else if (forceClose) {
                    points.push({ x: first.x, y: first.y });
                    closed = true;
                }
            }
            createWall(points, closed);
            commit('add_wall');
        }
        state.currentWallPoints = [];
        dom.wallPreview.setAttribute('points', '');
        hideWallLengthPreview();
    }
    function placeWallComponent(type, placement) {
        const wallEl = ensureWallElement(placement?.wallEl || (state.pendingComponentPlacement?.wallEl));
        const wallModel = getWallModel(wallEl);
        if (!wallEl || !wallModel) {
            utils.showToast('Не удалось определить стену для проёма');
            return null;
        }
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        el.classList.add('wall-component');
        const id = `comp-${++state.componentCounter}`;
        el.dataset.id = id;
        el.dataset.type = type;
        el.dataset.wallId = wallModel.id;
        const width = type === 'door' ? 80 : 120;
        const mask = `<rect x="-${width / 2}" y="-11" width="${width}" height="22" fill="#fdfdfd" />`;
        const visual = type === 'door'
            ? `<path d="M -40 0 A 40 40 0 0 1 0 -40" stroke="#8B4513" stroke-width="2" fill="none"/><line x1="-40" y1="0" x2="-40" y2="-5" stroke="#8B4513" stroke-width="2"/>`
            : `<rect x="-60" y="-5.5" width="120" height="11" fill="#a3d5ff" stroke="#5b9ad4" stroke-width="2" />`;
        el.innerHTML = mask + visual;
        dom.wallComponentsContainer.appendChild(el);
        const distanceAlong = placement?.distance ?? state.pendingComponentPlacement?.distance ?? 0;
        const initialPoint = placement?.point || state.pendingComponentPlacement?.point;
        const initialAngle = placement?.angle ?? state.pendingComponentPlacement?.angle;
        if (initialPoint) {
            const ang = initialAngle ?? 0;
            el.setAttribute('transform', `translate(${initialPoint.x}, ${initialPoint.y}) rotate(${ang})`);
        }
        const compModel = { id, type, wallId: wallModel.id, distance: distanceAlong, offset: 0 };
        componentStore.set(el, compModel);
        componentIdMap.set(id, el);
        if (!Array.isArray(wallModel.components)) wallModel.components = [];
        wallModel.components.push(compModel);
        updateWallComponentsPosition(wallEl);
        commit('add_component');
        return el;
    }
    
    // --- GRID & GUIDES ---
    function snap(v) { return Math.round(v / state.gridSize) * state.gridSize; }
    function snapSelectedToGrid(el, sizeToo = false) { const m = getModel(el); m.x = snap(m.x); m.y = snap(m.y); if (sizeToo) { m.sx = Math.max(0.1, (snap(m.ow * m.sx)) / m.ow); m.sy = Math.max(0.1, (snap(m.oh * m.sy)) / m.oh); } setModel(el, m); }
    function formatGridMeters(value) { return (Math.round(value * 1000) / 1000).toString(); }
    function applyGridPatternSize(sizePx) {
        if (!Number.isFinite(sizePx) || sizePx <= 0) return;
        const normalized = Math.round(sizePx * 1000) / 1000;
        state.gridSize = normalized;
        if (!dom.gridPattern) return;
        const w = normalized.toString();
        dom.gridPattern.setAttribute('width', w);
        dom.gridPattern.setAttribute('height', w);
        const path = dom.gridPattern.querySelector('path');
        path?.setAttribute('d', `M ${w} 0 L 0 0 0 ${w}`);
    }
    function updateGridSize({ silent = false, deferInvalid = false } = {}) {
        if (!dom.gridSelect) return;

        let pxPerMeter = state.pixelsPerMeter;
        if (!Number.isFinite(pxPerMeter) || pxPerMeter <= 0) {
            pxPerMeter = 50;
            state.pixelsPerMeter = pxPerMeter;
        }

        let fallbackMeters = state.gridStepMeters;
        if (!Number.isFinite(fallbackMeters) || fallbackMeters <= 0) {
            const derived = pxPerMeter ? state.gridSize / pxPerMeter : 0;
            fallbackMeters = Number.isFinite(derived) && derived > 0 ? derived : 1;
        }
        fallbackMeters = Math.round(fallbackMeters * 1000) / 1000;

        const rawValue = (dom.gridSelect.value ?? '').trim();
        let commitMeters = null;
        let effectiveMeters = null;
        let inputValueAfter = null;

        if (!rawValue) {
            if (deferInvalid) return;
            commitMeters = fallbackMeters;
            effectiveMeters = fallbackMeters;
            inputValueAfter = fallbackMeters;
        } else if (deferInvalid && /[.,]$/.test(rawValue)) {
            return;
        } else {
            const normalizedValue = rawValue.replace(/,/g, '.');
            const rawMeters = parseFloat(normalizedValue);
            if (!Number.isFinite(rawMeters) || rawMeters <= 0) {
                if (deferInvalid) return;
                commitMeters = fallbackMeters;
                effectiveMeters = fallbackMeters;
                inputValueAfter = fallbackMeters;
            } else {
                const processedMeters = deferInvalid ? rawMeters : utils.clamp(rawMeters, GRID_MIN_METERS, GRID_MAX_METERS);
                const roundedMeters = Math.round(processedMeters * 1000) / 1000;
                effectiveMeters = deferInvalid ? processedMeters : roundedMeters;
                if (!deferInvalid) {
                    commitMeters = roundedMeters;
                    inputValueAfter = roundedMeters;
                }
            }
        }

        if (!Number.isFinite(effectiveMeters) || effectiveMeters <= 0) {
            return;
        }

        if (!deferInvalid && inputValueAfter != null) {
            dom.gridSelect.value = formatGridMeters(inputValueAfter);
        }

        applyGridPatternSize(effectiveMeters * pxPerMeter);
        state.pixelsPerMeter = pxPerMeter;

        let changed = false;
        if (commitMeters != null) {
            const prevMeters = Number.isFinite(state.gridStepMeters) && state.gridStepMeters > 0 ? state.gridStepMeters : fallbackMeters;
            changed = Math.abs(prevMeters - commitMeters) > 1e-6;
            state.gridStepMeters = commitMeters;
        }

        if (!silent && !deferInvalid) {
            const messageMeters = state.gridStepMeters;
            const formatted = messageMeters.toLocaleString('ru-RU', {
                maximumFractionDigits: messageMeters < 1 ? 2 : 1
            });
            utils.showToast(`Сетка ${formatted} м`);
            if (changed) commit('grid_step');
        }
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
    function resetMeasurementPreview() {
        state.measurePoints = [];
        renderMeasurementOverlay();
    }
    function renderMeasurementOverlay(preview) {
        const layer = dom.measurementLayer;
        if (!layer) return;
        layer.innerHTML = '';
        const pixelsPerMeter = state.pixelsPerMeter || state.gridSize || 1;
        const draw = (measurement, isPreview = false) => {
            if (!measurement) return;
            const p0 = measurement.p0;
            const p1 = measurement.p1;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', p0.x);
            line.setAttribute('y1', p0.y);
            line.setAttribute('x2', p1.x);
            line.setAttribute('y2', p1.y);
            line.setAttribute('stroke', getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#0d6efd');
            line.setAttribute('stroke-width', 3);
            line.setAttribute('marker-start', 'url(#dim-arrow)');
            line.setAttribute('marker-end', 'url(#dim-arrow)');
            if (isPreview) line.setAttribute('stroke-dasharray', '6 4');
            layer.appendChild(line);
            const dist = distance(p0, p1);
            const meters = (measurement.meters ?? (dist / pixelsPerMeter)).toFixed(2);
            const angleDeg = Math.round((measurement.angle ?? ((Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI) + 360)) % 360);
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
            text.textContent = `${meters} м • ${angleDeg}°`;
            if (isPreview) text.setAttribute('opacity', '0.6');
            layer.appendChild(text);
        };
        state.measurements.forEach(m => draw(m, false));
        if (preview) draw(preview, true);
    }
    function addMeasurement(p0, p1) {
        const pixels = distance(p0, p1);
        if (pixels < 1) return;
        const pixelsPerMeter = state.pixelsPerMeter || state.gridSize || 1;
        const meters = pixels / pixelsPerMeter;
        const angle = (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI + 360) % 360;
        const measurement = {
            id: `measure-${++state.measureCounter}`,
            p0: { x: p0.x, y: p0.y },
            p1: { x: p1.x, y: p1.y },
            pixels,
            meters,
            angle
        };
        state.measurements.push(measurement);
        renderMeasurementOverlay();
        renderMeasurementTable();
        commit('measure_add');
    }
    function removeMeasurement(id) {
        const idx = state.measurements.findIndex(m => m.id === id);
        if (idx >= 0) {
            state.measurements.splice(idx, 1);
            renderMeasurementOverlay();
            renderMeasurementTable();
            commit('measure_remove');
        }
    }
    function renderMeasurementTable() {
        const body = dom.measureTableBody;
        if (!body) return;
        body.innerHTML = '';
        state.measurements.forEach((m, idx) => {
            const tr = document.createElement('tr');
            const angleDeg = Math.round(m.angle);
            tr.innerHTML = `<td>${idx + 1}</td><td>${m.meters.toFixed(2)} м</td><td>${angleDeg}°</td><td><button type="button" data-id="${m.id}">✕</button></td>`;
            body.appendChild(tr);
        });
    }
    function clearAllMeasurements() {
        if (!state.measurements.length) return;
        state.measurements = [];
        state.measureCounter = 0;
        renderMeasurementTable();
        renderMeasurementOverlay();
        commit('measure_clear');
    }

    function syncNormativeControls() {
        if (dom.normativeCorridorGuest) dom.normativeCorridorGuest.value = state.normativeCorridorGuest;
        if (dom.normativeCorridorStaff) dom.normativeCorridorStaff.value = state.normativeCorridorStaff;
        if (dom.normativeRadius) dom.normativeRadius.value = state.normativeRadius;
    }

    function updateNormativesFromInputs() {
        const guest = parseFloat(dom.normativeCorridorGuest?.value);
        const staff = parseFloat(dom.normativeCorridorStaff?.value);
        const radius = parseFloat(dom.normativeRadius?.value);
        let changed = false;
        if (!Number.isNaN(guest) && guest >= 0) { state.normativeCorridorGuest = guest; changed = true; }
        if (!Number.isNaN(staff) && staff >= 0) { state.normativeCorridorStaff = staff; changed = true; }
        if (!Number.isNaN(radius) && radius >= 0) { state.normativeRadius = radius; changed = true; }
        if (changed) {
            commit('normative_update');
        }
    }

    function syncPricingControls() {
        if (dom.pricingPreset) dom.pricingPreset.value = state.estimatePreset;
        if (dom.rateFinish) dom.rateFinish.value = state.estimateRates.finish;
        if (dom.ratePerimeter) dom.ratePerimeter.value = state.estimateRates.perimeter;
        if (dom.rateEngineering) dom.rateEngineering.value = state.estimateRates.engineering;
    }

    function applyEstimatePreset(preset) {
        if (!ESTIMATE_PRESETS[preset]) return;
        state.estimatePreset = preset;
        state.estimateRates = { ...ESTIMATE_PRESETS[preset] };
        syncPricingControls();
        commit('estimate_preset');
    }

    function updateRatesFromInputs() {
        const finish = parseFloat(dom.rateFinish?.value);
        const perimeter = parseFloat(dom.ratePerimeter?.value);
        const engineering = parseFloat(dom.rateEngineering?.value);
        const rates = { ...state.estimateRates };
        let changed = false;
        if (!Number.isNaN(finish) && finish >= 0) { rates.finish = finish; changed = true; }
        if (!Number.isNaN(perimeter) && perimeter >= 0) { rates.perimeter = perimeter; changed = true; }
        if (!Number.isNaN(engineering) && engineering >= 0) { rates.engineering = engineering; changed = true; }
        if (changed) {
            state.estimatePreset = 'custom';
            state.estimateRates = rates;
            syncPricingControls();
            commit('estimate_update');
        }
    }

    // --- ANALYSIS TOOL ---
    /**
     * Выполняет анализ текущей планировки: обнаруживает замкнутые помещения,
     * вычисляет их площадь/периметр, подсчитывает количество посадочных мест,
     * оценивает минимальную ширину прохода, а также отмечает коллизии между
     * объектами и дверями/окнами. Итоги выводятся в тост сообщениях,
     * а графические наложения добавляются в слой #analysis-layer.
     */
    function analysisLayout({ silent = false } = {}) {
        try {
            const analysisLayer = dom.analysisLayer;
            if (analysisLayer) analysisLayer.innerHTML = '';
            dom.itemsContainer.querySelectorAll('.layout-object').forEach(el => el.classList.remove('collision'));
            dom.wallComponentsContainer.querySelectorAll('.wall-component').forEach(el => el.classList.remove('collision'));
            const pixelsPerMeter = state.pixelsPerMeter || state.gridSize || 1;
            const zoneNames = ['Гости', 'Бар', 'Кухня', 'Склад', 'Персонал'];
            const zoneColors = ['rgba(0,123,255,0.15)', 'rgba(40,167,69,0.15)', 'rgba(255,193,7,0.15)', 'rgba(108,117,125,0.15)', 'rgba(23,162,184,0.15)'];
            const result = {
                rooms: [],
                totalSeats: 0,
                sumArea: 0,
                sumPerimeter: 0,
                estimate: { finish: 0, perimeter: 0, engineering: 0, total: 0 },
                rates: { ...state.estimateRates },
                collisions: 0,
                normatives: {
                    corridorGuest: state.normativeCorridorGuest,
                    corridorStaff: state.normativeCorridorStaff,
                    radius: state.normativeRadius
                }
            };

            const roomsData = [];
            Array.from(wallStore.values()).forEach(model => {
                if (!model.closed || model.points.length < 3) return;
                const pts = model.points.map(p => ({ x: p.x, y: p.y }));
                if (pts[0].x !== pts[pts.length - 1].x || pts[0].y !== pts[pts.length - 1].y) {
                    pts.push({ x: pts[0].x, y: pts[0].y });
                }
                const areaPx = polygonArea(pts);
                if (Math.abs(areaPx) < 1) return;
                const perimeterPx = polygonPerimeter(pts);
                const xs = pts.map(p => p.x);
                const ys = pts.map(p => p.y);
                const widthPx = Math.max(...xs) - Math.min(...xs);
                const heightPx = Math.max(...ys) - Math.min(...ys);
                roomsData.push({
                    model,
                    points: pts,
                    areaPx: Math.abs(areaPx),
                    perimeterPx,
                    widthPx,
                    heightPx
                });
            });

            roomsData.forEach((room, idx) => {
                const zoneName = zoneNames[idx % zoneNames.length];
                const zoneColor = zoneColors[idx % zoneColors.length];
                const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                poly.setAttribute('points', room.points.map(p => `${p.x},${p.y}`).join(' '));
                poly.setAttribute('fill', zoneColor);
                poly.setAttribute('stroke', 'var(--accent)');
                poly.setAttribute('stroke-dasharray', '4 4');
                poly.setAttribute('pointer-events', 'none');
                poly.dataset.zone = zoneName;
                analysisLayer?.appendChild(poly);

                const centroid = polygonCentroid(room.points);
                const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                lbl.setAttribute('x', centroid.x);
                lbl.setAttribute('y', centroid.y);
                lbl.setAttribute('fill', 'var(--accent)');
                lbl.setAttribute('font-size', '14');
                lbl.setAttribute('font-weight', 'bold');
                lbl.setAttribute('text-anchor', 'middle');
                lbl.setAttribute('dominant-baseline', 'middle');
                lbl.setAttribute('pointer-events', 'none');
                lbl.textContent = zoneName;
                analysisLayer?.appendChild(lbl);

                const corridorPx = Math.min(room.widthPx, room.heightPx);
                const minDimPx = Math.min(room.widthPx, room.heightPx);
                const areaM2 = room.areaPx / (pixelsPerMeter * pixelsPerMeter);
                const perimeterM = room.perimeterPx / pixelsPerMeter;
                const corridorM = corridorPx / pixelsPerMeter;
                const minDimM = minDimPx / pixelsPerMeter;
                const normType = /персонал|склад|кухня/i.test(zoneName) ? 'staff' : 'guest';
                const requiredCorridor = normType === 'staff' ? state.normativeCorridorStaff : state.normativeCorridorGuest;
                const corridorStatus = corridorM >= requiredCorridor ? 'ok' : 'warn';
                const radiusStatus = minDimM >= state.normativeRadius ? 'ok' : 'warn';

                result.rooms.push({
                    index: idx + 1,
                    zone: zoneName,
                    area_m2: parseFloat(areaM2.toFixed(2)),
                    perimeter_m: parseFloat(perimeterM.toFixed(2)),
                    seats: 0,
                    corridor_m: parseFloat(corridorM.toFixed(2)),
                    corridor_required: requiredCorridor,
                    corridor_status: corridorStatus,
                    radius_status: radiusStatus,
                    min_dim_m: parseFloat(minDimM.toFixed(2))
                });
                room.zoneName = zoneName;
                result.sumArea += areaM2;
                result.sumPerimeter += perimeterM;
            });

            const allObjects = Array.from(dom.itemsContainer.querySelectorAll('.layout-object'));
            allObjects.forEach(el => {
                const m = getModel(el);
                const seats = ITEM_TEMPLATES[m.tpl]?.seats || 0;
                if (seats > 0) {
                    result.totalSeats += seats;
                    const pt = { x: m.x, y: m.y };
                    roomsData.forEach((room, idx) => {
                        if (pointInPolygon(pt, room.points)) {
                            result.rooms[idx].seats += seats;
                        }
                    });
                }
            });

            const getBoundingBox = (el) => {
                const target = el.querySelector?.('.core') || el;
                try {
                    const bbox = target.getBBox();
                    if (!bbox) return null;
                    return { x: bbox.x, y: bbox.y, w: bbox.width, h: bbox.height };
                } catch (e) {
                    const m = getModel(el);
                    if (!m) return null;
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
                }
            };
            const boxesOverlap = (a, b) => a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
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
                const compBox = getBoundingBox(comp);
                if (!compBox) return;
                allObjects.forEach(obj => {
                    const oBox = getBoundingBox(obj);
                    if (boxesOverlap(compBox, oBox)) {
                        collisionCount++;
                        obj.classList.add('collision');
                        comp.classList.add('collision');
                    }
                });
            });
            result.collisions = collisionCount;

            const rates = state.estimateRates;
            result.estimate.finish = parseFloat((result.sumArea * rates.finish).toFixed(2));
            result.estimate.perimeter = parseFloat((result.sumPerimeter * rates.perimeter).toFixed(2));
            result.estimate.engineering = parseFloat((result.sumArea * rates.engineering).toFixed(2));
            result.estimate.total = parseFloat((result.estimate.finish + result.estimate.perimeter + result.estimate.engineering).toFixed(2));

            result.sumArea = parseFloat(result.sumArea.toFixed(2));
            result.sumPerimeter = parseFloat(result.sumPerimeter.toFixed(2));

            state.lastAnalysis = result;
            renderAnalysisPanel(result);

            if (!silent) {
                const summary = `Помещений: ${result.rooms.length}, площадь ${result.sumArea.toFixed(1)} м², мест ${result.totalSeats}, коллизий ${result.collisions}`;
                utils.showToast(summary, Math.max(3000, summary.length * 60));
            }
        } catch (err) {
            console.error(err);
            utils.showToast('Ошибка анализа: ' + err.message, 5000);
        }
    }

    function renderAnalysisPanel(result) {
        if (dom.analysisSummary) {
            dom.analysisSummary.innerHTML = '';
            const nf = typeof Intl !== 'undefined' ? new Intl.NumberFormat('ru-RU') : { format: v => v };
            const cards = [
                { label: 'Помещения', value: result.rooms.length },
                { label: 'Площадь', value: `${result.sumArea.toFixed(1)} м²` },
                { label: 'Периметр', value: `${result.sumPerimeter.toFixed(1)} м` },
                { label: 'Места', value: result.totalSeats },
                { label: 'Коллизии', value: result.collisions },
                { label: 'Смета', value: `${nf.format(result.estimate.total)} ₽` }
            ];
            cards.forEach(card => {
                const cardEl = document.createElement('div');
                cardEl.className = 'summary-card';
                const title = document.createElement('h4');
                title.textContent = card.label;
                const span = document.createElement('span');
                span.textContent = card.value;
                cardEl.appendChild(title);
                cardEl.appendChild(span);
                dom.analysisSummary.appendChild(cardEl);
            });
            const breakdown = document.createElement('div');
            breakdown.className = 'summary-card';
            breakdown.innerHTML = `<h4>Ставки</h4><span>${result.rates.finish} ₽/м² • ${result.rates.perimeter} ₽/м • ${result.rates.engineering} ₽/м² (инж.)</span>`;
            dom.analysisSummary.appendChild(breakdown);
        }

        if (dom.analysisRoomsBody) {
            dom.analysisRoomsBody.innerHTML = '';
            if (!result.rooms.length) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 8;
                td.textContent = 'Замкнутые помещения не найдены';
                tr.appendChild(td);
                dom.analysisRoomsBody.appendChild(tr);
            } else {
                result.rooms.forEach(room => {
                    const tr = document.createElement('tr');
                    const corridorClass = room.corridor_status === 'ok' ? 'status-ok' : 'status-warn';
                    const radiusClass = room.radius_status === 'ok' ? 'status-ok' : 'status-warn';
                    tr.innerHTML = `
                        <td>${room.index}</td>
                        <td>${room.zone}</td>
                        <td>${room.area_m2.toFixed(2)} м²</td>
                        <td>${room.perimeter_m.toFixed(2)} м</td>
                        <td>${room.seats}</td>
                        <td>${room.min_dim_m.toFixed(2)} м</td>
                        <td><span class="${corridorClass}">${room.corridor_m.toFixed(2)} м / ≥ ${room.corridor_required} м</span></td>
                        <td><span class="${radiusClass}">${room.radius_status === 'ok' ? 'норма' : 'меньше нормы'}</span></td>`;
                    dom.analysisRoomsBody.appendChild(tr);
                });
            }
        }
    }
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
            // Создание стен прямоугольника через новую систему стен
            const wallPoints = [
                { x: 0, y: 0 },
                { x: roomWidth, y: 0 },
                { x: roomWidth, y: roomHeight },
                { x: 0, y: roomHeight }
            ];
            const wallEl = createWall(wallPoints, true);
            if (!wallEl) {
                throw new Error('Не удалось создать стены шаблона');
            }
            const wallModel = getWallModel(wallEl);
            if (wallModel) {
                wallModel.closed = true;
                setWallModel(wallEl, wallModel);
            }
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
            if (!state.lastAnalysis || !state.lastAnalysis.rooms || state.lastAnalysis.rooms.length === 0) {
                analysisLayout({ silent: true });
            }
            const res = state.lastAnalysis;
            if (!res || !res.rooms) {
                utils.showToast('Нет данных для экспорта');
                return;
            }
            const lines = [];
            lines.push('Номер,Зона,Площадь (м²),Периметр (м),Места,Мин. габарит (м),Коридор (м),Норма коридора,Статус коридора,Статус радиуса');
            res.rooms.forEach(room => {
                lines.push([
                    room.index,
                    room.zone,
                    room.area_m2.toFixed(2),
                    room.perimeter_m.toFixed(2),
                    room.seats,
                    room.min_dim_m.toFixed(2),
                    room.corridor_m.toFixed(2),
                    room.corridor_required,
                    room.corridor_status,
                    room.radius_status
                ].join(','));
            });
            lines.push('');
            lines.push('Сводка');
            lines.push(`Всего помещений,${res.rooms.length}`);
            lines.push(`Суммарная площадь (м²),${res.sumArea.toFixed(2)}`);
            lines.push(`Суммарный периметр (м),${res.sumPerimeter.toFixed(2)}`);
            lines.push(`Всего мест,${res.totalSeats}`);
            lines.push(`Коллизии,${res.collisions}`);
            lines.push('');
            lines.push('Смета');
            lines.push(`Отделка (₽),${res.estimate.finish}`);
            lines.push(`Плинтус (₽),${res.estimate.perimeter}`);
            lines.push(`Инженерия (₽),${res.estimate.engineering}`);
            lines.push(`Итого (₽),${res.estimate.total}`);
            lines.push('');
            lines.push('Нормативы');
            lines.push(`Коридор гости (м),${res.normatives?.corridorGuest ?? state.normativeCorridorGuest}`);
            lines.push(`Коридор персонал (м),${res.normatives?.corridorStaff ?? state.normativeCorridorStaff}`);
            lines.push(`Радиус (м),${res.normatives?.radius ?? state.normativeRadius}`);
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
    function snapshot() {
        return {
            items: Array.from(dom.itemsContainer.children).filter(n => n.classList.contains('layout-object')).map(getModel),
            walls: Array.from(wallStore.values()).map(model => ({
                id: model.id,
                points: model.points.map(p => ({ x: p.x, y: p.y })),
                closed: model.closed,
                type: ensureWallType(model.type || state.defaultWallType)
            })),
            components: Array.from(componentStore.values()).map(comp => ({
                id: comp.id,
                type: comp.type,
                wallId: comp.wallId,
                distance: comp.distance,
                offset: comp.offset || 0
            })),
            wallDefaults: { type: state.defaultWallType },
            grid: {
                stepMeters: Number.isFinite(state.gridStepMeters) && state.gridStepMeters > 0 ? state.gridStepMeters : 1,
                pixelsPerMeter: Number.isFinite(state.pixelsPerMeter) && state.pixelsPerMeter > 0 ? state.pixelsPerMeter : 50
            },
            measurements: state.measurements.map(m => ({ ...m })),
            normatives: {
                corridorGuest: state.normativeCorridorGuest,
                corridorStaff: state.normativeCorridorStaff,
                radius: state.normativeRadius
            },
            estimate: {
                preset: state.estimatePreset,
                rates: { ...state.estimateRates }
            }
        };
    }
    function restore(data) {
        state.history.lock = true;

        Array.from(dom.itemsContainer.children).slice().forEach(n => {
            if (n.classList.contains('layout-object')) {
                interact(n).unset();
                n.remove();
            }
        });

        dom.wallsContainer.innerHTML = '';
        wallStore.clear();
        wallIdMap.clear();
        state.wallCounter = 0;

        dom.wallComponentsContainer.innerHTML = '';
        componentStore.clear();
        componentIdMap.clear();
        state.componentCounter = 0;
        state.pendingComponentPlacement = null;

        const savedGrid = data?.grid;
        if (savedGrid) {
            const pxPerMeter = parseFloat(savedGrid.pixelsPerMeter);
            if (Number.isFinite(pxPerMeter) && pxPerMeter > 0) {
                state.pixelsPerMeter = pxPerMeter;
            }
            const stepMeters = parseFloat(savedGrid.stepMeters ?? savedGrid.step ?? savedGrid.meters);
            if (Number.isFinite(stepMeters) && stepMeters > 0) {
                state.gridStepMeters = Math.round(stepMeters * 1000) / 1000;
            }
        }
        if (!Number.isFinite(state.pixelsPerMeter) || state.pixelsPerMeter <= 0) {
            state.pixelsPerMeter = 50;
        }
        if (!Number.isFinite(state.gridStepMeters) || state.gridStepMeters <= 0) {
            state.gridStepMeters = 1;
        }
        if (dom.gridSelect) {
            dom.gridSelect.value = formatGridMeters(state.gridStepMeters);
            updateGridSize({ silent: true });
        }

        state.defaultWallType = ensureWallType(data?.wallDefaults?.type || state.defaultWallType);
        highlightWallType(state.defaultWallType);
        updateWallTypeCaption('default', state.defaultWallType);
        hideWallLengthPreview();

        (data.items || []).forEach(m => {
            const el = createLayoutObject(m.tpl, m.x, m.y);
            setModel(el, m);
            el.style.display = m.visible ? '' : 'none';
        });

        const parseLegacyWall = (raw) => {
            if (typeof raw !== 'string') return null;
            const nums = raw.match(/[-+]?\d*\.?\d+/g)?.map(Number) || [];
            const pts = [];
            for (let i = 0; i < nums.length; i += 2) {
                if (Number.isFinite(nums[i]) && Number.isFinite(nums[i + 1])) {
                    pts.push({ x: nums[i], y: nums[i + 1] });
                }
            }
            if (pts.length < 2) return null;
            const first = pts[0];
            const last = pts[pts.length - 1];
            const closed = Math.abs(first.x - last.x) < 1e-2 && Math.abs(first.y - last.y) < 1e-2;
            return { points: pts, closed };
        };

        const parseLegacyComponent = (raw) => {
            if (typeof raw !== 'string') return null;
            const transformMatch = raw.match(/transform="([^"]+)"/i);
            if (!transformMatch) return null;
            const translateMatch = transformMatch[1].match(/translate\(([-+\d.]+)[ ,]([-+\d.]+)\)/i);
            if (!translateMatch) return null;
            const rotateMatch = transformMatch[1].match(/rotate\(([-+\d.]+)\)/i);
            const x = parseFloat(translateMatch[1]);
            const y = parseFloat(translateMatch[2]);
            const angle = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
            if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
            const type = /<path/i.test(raw) ? 'door' : 'window';
            return { type, x, y, angle };
        };

        const restoreLegacyComponent = (raw) => {
            const legacy = parseLegacyComponent(raw);
            if (!legacy) return;
            const placement = findClosestWallPlacement({ x: legacy.x, y: legacy.y });
            if (!placement.wallEl) return;
            const compEl = placeWallComponent(legacy.type, {
                wallEl: placement.wallEl,
                distance: placement.distance,
                point: { x: legacy.x, y: legacy.y },
                angle: legacy.angle
            });
            if (!compEl) return;
            const compModel = componentStore.get(compEl);
            if (compModel) {
                compModel.offset = 0;
                componentStore.set(compEl, compModel);
            }
        };

        (data.walls || []).forEach(w => {
            let wallData = w;
            if (!wallData || typeof wallData !== 'object' || !Array.isArray(wallData.points)) {
                wallData = parseLegacyWall(w);
                if (!wallData) return;
            }
            const wallEl = createWall(wallData.points || [], !!wallData.closed);
            const model = getWallModel(wallEl);
            if (!model) return;
            const originalId = model.id;
            if (w?.id) {
                model.id = w.id;
                wallEl.dataset.id = w.id;
            }
            const resolvedType = ensureWallType(wallData?.type || wallData?.material || model.type);
            model.type = resolvedType;
            wallEl.dataset.type = resolvedType;
            model.closed = !!wallData.closed;
            model.components = [];
            wallStore.set(wallEl, model);
            if (originalId && originalId !== model.id) {
                wallIdMap.delete(originalId);
            }
            wallIdMap.set(model.id, wallEl);
            const num = parseInt(String(model.id).replace(/[^0-9]/g, ''), 10);
            if (!Number.isNaN(num)) state.wallCounter = Math.max(state.wallCounter, num);
        });

        (data.components || []).forEach(c => {
            if (typeof c === 'string') {
                restoreLegacyComponent(c);
                return;
            }
            const wallEl = wallIdMap.get(c.wallId);
            if (!wallEl) return;
            const compEl = placeWallComponent(c.type, { wallEl, distance: c.distance || 0 });
            const compModel = componentStore.get(compEl);
            if (!compModel) return;
            const originalId = compModel.id;
            if (c.id) {
                compModel.id = c.id;
                compEl.dataset.id = c.id;
            }
            compModel.offset = c.offset || 0;
            componentStore.set(compEl, compModel);
            if (originalId && originalId !== compModel.id) {
                componentIdMap.delete(originalId);
            }
            componentIdMap.set(compModel.id, compEl);
            const wallModel = getWallModel(wallEl);
            if (wallModel) {
                wallModel.components = wallModel.components || [];
                if (!wallModel.components.includes(compModel)) wallModel.components.push(compModel);
            }
            const num = parseInt(String(compModel.id).replace(/[^0-9]/g, ''), 10);
            if (!Number.isNaN(num)) state.componentCounter = Math.max(state.componentCounter, num);
        });

        state.measurements = Array.isArray(data.measurements) ? data.measurements.map(m => ({ ...m })) : [];
        if (state.measurements.length) {
            const maxMeasureId = state.measurements.reduce((max, m) => {
                const num = parseInt(String(m.id).replace(/[^0-9]/g, ''), 10);
                return Number.isNaN(num) ? max : Math.max(max, num);
            }, 0);
            state.measureCounter = maxMeasureId;
        } else {
            state.measureCounter = 0;
        }
        renderMeasurementOverlay();
        renderMeasurementTable();

        if (data.normatives) {
            if (typeof data.normatives.corridorGuest === 'number') state.normativeCorridorGuest = data.normatives.corridorGuest;
            if (typeof data.normatives.corridorStaff === 'number') state.normativeCorridorStaff = data.normatives.corridorStaff;
            if (typeof data.normatives.radius === 'number') state.normativeRadius = data.normatives.radius;
            syncNormativeControls();
        }

        if (data.estimate) {
            state.estimatePreset = data.estimate.preset || 'custom';
            state.estimateRates = { ...state.estimateRates, ...(data.estimate.rates || {}) };
            syncPricingControls();
        }

        clearSelections();
        state.history.lock = false;
        updateLayersList();
        analysisLayout({ silent: true });
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
            if (state.selectedObject) { deleteObject(state.selectedObject); return; }
            if (state.selectedComponent) { const comp = state.selectedComponent; clearSelections(); deleteComponent(comp); return; }
            if (state.selectedWall) { const wall = state.selectedWall; clearSelections(); deleteWall(wall); return; }
            if (state.selectedWallHandle) {
                const { wall, index } = state.selectedWallHandle;
                if (removeWallVertex(wall, index)) {
                    state.selectedWallHandle = null;
                    commit('wall_vertex_remove');
                }
                return;
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
    function deleteComponent(compEl) {
        if (!compEl) return;
        const compModel = componentStore.get(compEl);
        if (compModel) {
            const wallEl = wallIdMap.get(compModel.wallId);
            const wallModel = getWallModel(wallEl);
            if (wallModel && Array.isArray(wallModel.components)) {
                wallModel.components = wallModel.components.filter(c => c.id !== compModel.id);
            }
            componentStore.delete(compEl);
            componentIdMap.delete(compModel.id);
            if (wallEl) updateWallComponentsPosition(wallEl);
        }
        compEl.remove();
        if (state.selectedComponent === compEl) state.selectedComponent = null;
        commit('delete_component');
    }
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
                if (state.measurePoints.length === 0) {
                    state.measurePoints.push({ x: p.x, y: p.y });
                    renderMeasurementOverlay();
                } else if (state.measurePoints.length === 1) {
                    const start = state.measurePoints[0];
                    addMeasurement(start, { x: p.x, y: p.y });
                    state.measurePoints = [];
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
                if (state.pendingComponentPlacement && state.pendingComponentPlacement.wallEl) {
                    placeWallComponent(state.activeTool, state.pendingComponentPlacement);
                    state.pendingComponentPlacement = null;
                    dom.previewsContainer.innerHTML = '';
                } else {
                    utils.showToast('Нет стены рядом для установки');
                }
            }
            // Выбор объектов (указатель)
            else {
                if (e.button === 0) {
                    const interactive = e.target.closest('.layout-object, .wall-component, .wall');
                    if (!interactive) {
                        e.preventDefault();
                        startPan(e);
                        return;
                    }
                }
                const t = e.target.closest('.layout-object');
                if (t) { selectObject(t); return; }
                const w = ensureWallElement(e.target.closest('.wall path, .wall'));
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
            // Обновление превью стены и длины сегмента
            if (tool === 'wall') {
                if (state.currentWallPoints.length > 0) {
                    const snappedP = { x: snap(p.x), y: snap(p.y) };
                    const pointsAttr = [...state.currentWallPoints, snappedP].map(pt => `${pt.x},${pt.y}`).join(' ');
                    dom.wallPreview.setAttribute('points', pointsAttr);
                    const lastPoint = state.currentWallPoints[state.currentWallPoints.length - 1];
                    updateWallLengthPreview(lastPoint, snappedP);
                } else {
                    hideWallLengthPreview();
                }
            }
            // Превью дверей/окон
            else if (tool === 'door' || tool === 'window') {
                hideWallLengthPreview();
                dom.previewsContainer.innerHTML = '';
                state.pendingComponentPlacement = null;
                const closest = findClosestWallPlacement(p);
                if (closest.wallEl && closest.dist < 60) {
                    const el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    const visual = tool === 'door'
                        ? `<path d="M -40 0 A 40 40 0 0 1 0 -40" stroke="#8B4513" stroke-width="2" fill="rgba(255,228,196,0.5)"/><line x1="-40" y1="0" x2="-40" y2="-5" stroke="#8B4513" stroke-width="2"/>`
                        : `<rect x="-60" y="-5.5" width="120" height="11" fill="rgba(163,213,255,0.7)" stroke="#5b9ad4" stroke-width="2" />`;
                    el.innerHTML = visual;
                    el.setAttribute('transform', `translate(${closest.point.x}, ${closest.point.y}) rotate(${closest.angle})`);
                    dom.previewsContainer.appendChild(el);
                    state.pendingComponentPlacement = closest;
                }
            }
            // Динамическое измерение: если одна точка выбрана, рисуем линию к курсору
            else if (tool === 'measure' && state.measurePoints.length === 1) {
                hideWallLengthPreview();
                const p0 = state.measurePoints[0];
                const preview = {
                    p0,
                    p1: { x: p.x, y: p.y },
                    meters: distance(p0, p) / (state.pixelsPerMeter || state.gridSize || 1),
                    angle: (Math.atan2(p.y - p0.y, p.x - p0.x) * 180 / Math.PI + 360) % 360
                };
                renderMeasurementOverlay(preview);
            } else {
                hideWallLengthPreview();
            }
        }));
        dom.svg.addEventListener('mouseleave', hideWallLengthPreview);
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
        dom.measureTableBody?.addEventListener('click', e => {
            const btn = e.target.closest('button[data-id]');
            if (!btn) return;
            removeMeasurement(btn.dataset.id);
        });
        dom.measureClear?.addEventListener('click', clearAllMeasurements);
        dom.normativeCorridorGuest?.addEventListener('change', () => { updateNormativesFromInputs(); analysisLayout({ silent: true }); });
        dom.normativeCorridorStaff?.addEventListener('change', () => { updateNormativesFromInputs(); analysisLayout({ silent: true }); });
        dom.normativeRadius?.addEventListener('change', () => { updateNormativesFromInputs(); analysisLayout({ silent: true }); });
        dom.pricingPreset?.addEventListener('change', e => {
            const value = e.target.value;
            if (value === 'custom') {
                state.estimatePreset = 'custom';
                commit('estimate_preset');
                return;
            }
            applyEstimatePreset(value);
            analysisLayout({ silent: true });
        });
        const rateInputs = [dom.rateFinish, dom.ratePerimeter, dom.rateEngineering];
        rateInputs.forEach(input => input?.addEventListener('change', () => { updateRatesFromInputs(); analysisLayout({ silent: true }); }));
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        dom.toggleSidebar?.addEventListener('click', () => dom.sidebar.classList.toggle('visible'));
        dom.toggleProperties?.addEventListener('click', () => dom.properties.classList.toggle('visible'));
        dom.main.addEventListener('click', e => { if (window.innerWidth <= 1024 && !e.target.closest('.ui-bar')) { dom.sidebar.classList.remove('visible'); dom.properties.classList.remove('visible'); }});
        
        ['pointer', 'wall', 'door', 'window', 'measure'].forEach(tool => {
            const button = dom[`tool${tool.charAt(0).toUpperCase() + tool.slice(1)}`];
            if (button) button.addEventListener('click', () => toggleTool(tool));
        });

        if (dom.gridSelect) {
            dom.gridSelect.addEventListener('input', () => updateGridSize({ silent: true, deferInvalid: true }));
            dom.gridSelect.addEventListener('change', () => updateGridSize());
        }
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

        initWallTypeOptions();
        highlightWallType(state.defaultWallType);
        updateWallTypeCaption('default', state.defaultWallType);
        hideWallLengthPreview();

        // Setup interact.js
        interact('.draggable-item').draggable({ inertia: true, autoScroll: true, listeners: { start(e) { const g = e.target.cloneNode(true); Object.assign(g.style, { position: 'absolute', opacity: .7, pointerEvents: 'none', zIndex: 1000 }); document.body.appendChild(g); e.interaction.ghost = g; }, move(e) { const g = e.interaction.ghost; if (!g) return; g.style.left = `${e.clientX - e.rect.width / 2}px`; g.style.top = `${e.clientY - e.rect.height / 2}px`; }, end(e) { e.interaction.ghost?.remove(); } } });
        interact(dom.svg).dropzone({ accept: '.draggable-item', listeners: { drop(e) { const tpl = e.relatedTarget.dataset.template; const viewBox = dom.svg.viewBox.baseVal; const centerX = viewBox.x + viewBox.width / 2; const centerY = viewBox.y + viewBox.height / 2; const obj = createLayoutObject(tpl, centerX, centerY); selectObject(obj); }, dragenter: e => e.target.style.outline = '2px dashed var(--accent)', dragleave: e => e.target.style.outline = 'none', dropdeactivate: e => e.target.style.outline = 'none' } });
        interact(dom.trash).dropzone({ accept: '.layout-object', ondragenter: e => e.target.classList.add('drag-enter'), ondragleave: e => e.target.classList.remove('drag-enter'), ondrop: e => { deleteObject(e.relatedTarget); e.target.classList.remove('drag-enter'); } });
        
        // Bind all event listeners
        bindEventListeners();

        // Final setup
        toggleTool('pointer');
        updateGridSize({ silent: true });
        renderMeasurementOverlay();
        renderMeasurementTable();
        syncNormativeControls();
        syncPricingControls();

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

        analysisLayout({ silent: true });
        commit('init');
    }

    init();
})();

