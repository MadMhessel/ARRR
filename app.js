"use strict";
(() => {
    // --- CONSTANTS & STATE ---
    const CONST = {
        GRID: 0.1,                 // базовый шаг сетки в метрах
        SNAP_EPS_PX: 8,            // радиус привязки в экранных пикселях
        WALL: { THICK_DEFAULT: 0.2 },
        OPENING: { EDGE_MIN: 0.2 },
        NORMS: {
            PASSAGE_GUEST_MIN: 1.0,
            PASSAGE_STAFF_MIN: 0.9,
            TURN_RADIUS_MIN: 1.5,
        },
        COST: {
            FLOOR_PER_M2: 40,
            BASEBOARD_PER_M: 5,
            OPENING_UNIT: 50,
        },
    };
    const LOCAL_STORAGE_KEY = 'layout-v10-pro'; // Incremented version to avoid loading old potentially corrupt data
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const PLAN_SCALE = 50; // 1:50 чертёжный масштаб
    const EDGE_WIDTH_MM = 0.6; // толщина верхнего штриха в мм на листе
    const MM_PER_METER = 1000;
    const SHEET_MM_PER_METER = MM_PER_METER / PLAN_SCALE; // 20 мм на листе на каждый метр в реальности
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
        gridRect: document.getElementById('grid-surface'),
        gridLinesGroup: document.getElementById('grid-lines'),
        floorBackground: document.getElementById('floor-background'),
        floorUnderlay: document.getElementById('floor-underlay'),
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
        componentPanel: document.getElementById('component-panel'),
        componentType: document.getElementById('component-type'),
        componentWidth: document.getElementById('component-width'),
        componentHingeGroup: document.getElementById('component-hinge-group'),
        componentSwingGroup: document.getElementById('component-swing-group'),
        componentHingeLeft: document.getElementById('component-hinge-left'),
        componentHingeRight: document.getElementById('component-hinge-right'),
        componentSwingIn: document.getElementById('component-swing-in'),
        componentSwingOut: document.getElementById('component-swing-out'),
        wallTypePanel: document.getElementById('wall-properties'),
        wallTypeOptions: document.getElementById('wall-type-options'),
        wallTypeCaption: document.getElementById('wall-type-caption'),
        btnExport: document.getElementById('btnExport'),
        btnImport: document.getElementById('btnImport'),
        fileImport: document.getElementById('fileImport'),
        renderModeToggle: document.getElementById('toggle-render-mode'),
        btnAnalysis: document.getElementById('btnAnalysis'),
        btnCsv: document.getElementById('btnCsv'),
        btnTemplate: document.getElementById('btnTemplate'),
        btnClearHost: document.getElementById('btnClearHost'),
        gridSelect: document.getElementById('gridStep'),
        snapGuidesEl: document.getElementById('snapGuides'),
        toolPointer: document.getElementById('tool-pointer'),
        toolWall: document.getElementById('tool-wall'),
        toolDoor: document.getElementById('tool-door'),
        toolWindow: document.getElementById('tool-window'),
        toolMeasure: document.getElementById('tool-measure'),
        snapMarkers: document.getElementById('snap-markers'),
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
        normativeCorridorGuest: document.getElementById('normative-corridor-guest'),
        normativeCorridorStaff: document.getElementById('normative-corridor-staff'),
        normativeRadius: document.getElementById('normative-radius'),
        pricingPreset: document.getElementById('pricing-preset'),
        rateFinish: document.getElementById('rate-finish'),
        ratePerimeter: document.getElementById('rate-perimeter'),
        rateEngineering: document.getElementById('rate-engineering'),
        defs: document.querySelector('#svg defs'),
        wallMaskTemplate: document.getElementById('wallOpeningsMask'),
    };
    const state = {
        selectedObject: null,
        selectedWall: null,
        selectedComponent: null,
        objectCounter: 0,
        isShiftHeld: false,
        pixelsPerMeter: 50,
        gridStepMeters: CONST.GRID,
        gridSize: 50 * CONST.GRID,
        history: { stack: [], idx: -1, lock: false },
        renderMode: 'schematic',
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
        isAltDown: false,
        // Хранилище для наложений анализа (для будущих расширений)
        analysisOverlays: [],
        // Нормативы. Все значения в метрах.
        normativeCorridorGuest: CONST.NORMS.PASSAGE_GUEST_MIN,
        normativeCorridorStaff: CONST.NORMS.PASSAGE_STAFF_MIN,
        normativeRadius: CONST.NORMS.TURN_RADIUS_MIN,
        doorDefaults: { variant: 'single', hinge: 'left', swing: 'in', width: 0.9 },
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
    const wallMaskMap = new Map();
    const TEMPLATE_ID_MAP = (typeof globalThis !== 'undefined' && globalThis.TEMPLATE_MIGRATION_MAP) ? globalThis.TEMPLATE_MIGRATION_MAP : {};
    const TEMPLATE_RULES = (typeof globalThis !== 'undefined' && globalThis.TEMPLATE_MIGRATION_RULES) ? globalThis.TEMPLATE_MIGRATION_RULES : [];
    const WALL_TYPES = [
        { id: 'structural', label: 'Капитальная', description: 'Несущая стена, толщина ~250 мм' },
        { id: 'partition', label: 'Перегородка', description: 'Лёгкая перегородка, толщина ~100 мм' },
        { id: 'glass', label: 'Стеклянная', description: 'Витраж или стеклянная перегородка' },
        { id: 'half', label: 'Полустена', description: 'Парапет, барная стойка или ограждение' }
    ];
    const WALL_RENDER_PRESETS = {
        structural: {
            thickness: 0.25,
            bodyStroke: '#111111',
            edgeStroke: '#111111',
            bodyDashMm: null,
            edgeDashMm: null,
        },
        partition: {
            thickness: 0.16,
            bodyStroke: '#111111',
            edgeStroke: '#111111',
            bodyDashMm: null,
            edgeDashMm: [6, 3],
        },
        glass: {
            thickness: 0.1,
            bodyStroke: '#676D72',
            edgeStroke: '#676D72',
            bodyDashMm: null,
            edgeDashMm: [5, 3],
        },
        half: {
            thickness: 0.1,
            bodyStroke: '#111111',
            edgeStroke: '#676D72',
            bodyDashMm: [4, 3],
            edgeDashMm: [4, 4],
        },
    };
    const OPENING_SPECS = {
        door: { widthMeters: 0.9, stroke: '#676D72' },
        window: { widthMeters: 1.2, stroke: '#1E6AD6', fill: 'rgba(30,106,214,0.2)' },
    };
    const DOOR_VARIANTS = {
        single: { label: 'Одинарная дверь 90', widthMeters: 0.9, minCm: 70, maxCm: 110, stepCm: 5, allowHinge: true, allowSwing: true },
        double: { label: 'Двустворчатая дверь 160', widthMeters: 1.6, minCm: 140, maxCm: 220, stepCm: 10, allowHinge: false, allowSwing: true },
        sliding: { label: 'Раздвижная дверь 140', widthMeters: 1.4, minCm: 120, maxCm: 240, stepCm: 5, allowHinge: false, allowSwing: false },
        glass: { label: 'Стеклянная перегородка 100', widthMeters: 1.0, minCm: 80, maxCm: 240, stepCm: 5, allowHinge: false, allowSwing: false }
    };
    const ESTIMATE_PRESETS = {
        standard: { finish: 50, perimeter: 12, engineering: 35 },
        economy: { finish: 35, perimeter: 8, engineering: 20 },
        premium: { finish: 85, perimeter: 18, engineering: 55 }
    };
    const GRID_MIN_METERS = 0.05;
    const GRID_MAX_METERS = 20;
    const utils = {
        showToast(msg, ms = 1500) { dom.toast.textContent = msg; dom.toast.classList.add('show'); clearTimeout(this.showToast.t); this.showToast.t = setTimeout(() => dom.toast.classList.remove('show'), ms); },
        toSVGPoint(x, y) {
            const svg = dom.svg;
            const safePoint = {
                x: Number.isFinite(x) ? x : 0,
                y: Number.isFinite(y) ? y : 0,
            };
            if (!svg) return { ...safePoint };

            const getMatrix = () => {
                try {
                    return typeof svg.getScreenCTM === 'function' ? svg.getScreenCTM() : null;
                } catch {
                    return null;
                }
            };

            const ctm = getMatrix();
            const invertMatrix = matrix => {
                if (!matrix || typeof matrix.inverse !== 'function') return null;
                try {
                    return matrix.inverse();
                } catch {
                    return null;
                }
            };

            const transformWithMatrix = (matrix, point) => {
                if (!matrix) return null;
                const resultX = matrix.a * point.x + matrix.c * point.y + matrix.e;
                const resultY = matrix.b * point.x + matrix.d * point.y + matrix.f;
                if (!Number.isFinite(resultX) || !Number.isFinite(resultY)) return null;
                return { x: resultX, y: resultY };
            };

            const inverted = invertMatrix(ctm);

            if (typeof svg.createSVGPoint === 'function' && inverted) {
                try {
                    const p = svg.createSVGPoint();
                    p.x = safePoint.x;
                    p.y = safePoint.y;
                    const res = p.matrixTransform(inverted);
                    if (res && Number.isFinite(res.x) && Number.isFinite(res.y)) {
                        return { x: res.x, y: res.y };
                    }
                } catch {
                    // Fallback to manual matrix multiplication below.
                }
            }

            const manual = transformWithMatrix(inverted, safePoint);
            if (manual) return manual;

            if (typeof DOMPoint === 'function' && inverted) {
                try {
                    const domPoint = new DOMPoint(safePoint.x, safePoint.y);
                    const transformed = domPoint.matrixTransform(inverted);
                    if (transformed && Number.isFinite(transformed.x) && Number.isFinite(transformed.y)) {
                        return { x: transformed.x, y: transformed.y };
                    }
                } catch {
                    // Ignore DOMPoint failures.
                }
            }

            const view = state.viewBox || svg.viewBox?.baseVal;
            const rect = svg.getBoundingClientRect?.();
            if (view && rect && rect.width > 0 && rect.height > 0) {
                const nx = (safePoint.x - rect.left) / rect.width;
                const ny = (safePoint.y - rect.top) / rect.height;
                if (Number.isFinite(nx) && Number.isFinite(ny)) {
                    return {
                        x: view.x + nx * view.width,
                        y: view.y + ny * view.height,
                    };
                }
            }

            return { ...safePoint };
        },
        screenDeltaToSVG(dx, dy) { const p0 = this.toSVGPoint(0, 0); const p1 = this.toSVGPoint(dx, dy); return { dx: p1.x - p0.x, dy: p1.y - p0.y }; },
        clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
        rafThrottle(fn) { let r = null, lastArgs = null; return function (...args) { lastArgs = args; if (r) return; r = requestAnimationFrame(() => { fn(...lastArgs); r = null; }); } }
    };
    const KEY_CODE_MAP = {
        v: 'KeyV',
        w: 'KeyW',
        d: 'KeyD',
        o: 'KeyO',
        m: 'KeyM',
        z: 'KeyZ',
        y: 'KeyY',
        c: 'KeyC',
        r: 'KeyR',
        f: 'KeyF',
        b: 'KeyB'
    };
    function matchesKey(e, letter) {
        if (!letter) return false;
        const lower = typeof e.key === 'string' ? e.key.toLowerCase() : '';
        if (lower === letter) return true;
        const expected = KEY_CODE_MAP[letter];
        return expected ? e.code === expected : false;
    }

    // === ИКОНКИ ДЛЯ КНОПОК ПАНЕЛЕЙ ===
    function attachPanelIcons(root = document) {
        const nodes = root.querySelectorAll('[data-icon]');
        nodes.forEach(btn => {
            if (btn.dataset.iconMounted === '1') return;

            const iconId = btn.getAttribute('data-icon');
            const iconOnly = btn.hasAttribute('data-icon-only');
            const labelAttr = btn.getAttribute('data-icon-label');
            const labelText = labelAttr != null ? labelAttr : btn.textContent.trim();

            btn.textContent = '';
            const iconSpan = document.createElement('span');
            iconSpan.className = 'icon';
            iconSpan.setAttribute('aria-hidden', 'true');
            iconSpan.innerHTML = `<svg viewBox="0 0 24 24" focusable="false"><use href="#${iconId}"></use></svg>`;

            if (iconOnly) {
                btn.classList.add('icon-only');
                btn.appendChild(iconSpan);
                if (!btn.hasAttribute('aria-label') && labelText) {
                    btn.setAttribute('aria-label', labelText);
                }
            } else {
                btn.prepend(iconSpan);
                const labelSpan = document.createElement('span');
                labelSpan.className = 'label';
                labelSpan.textContent = labelText;
                btn.appendChild(labelSpan);
            }

            btn.dataset.iconMounted = '1';
        });
    }

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

    const snapState = {
        markerPool: [],
    };

    const gridRenderState = {
        majorStrideBase: Math.max(1, Math.round(1 / CONST.GRID)),
        minorPath: null,
        majorPath: null,
    };

    function getSnapRadiusSvg() {
        const delta = utils.screenDeltaToSVG(CONST.SNAP_EPS_PX, 0);
        const radius = Math.hypot(delta.dx, delta.dy);
        return Number.isFinite(radius) && radius > 0 ? radius : CONST.SNAP_EPS_PX;
    }

    function addSnapCandidate(list, seen, pt) {
        if (!pt || !Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return;
        const key = `${Math.round(pt.x * 1000) / 1000}_${Math.round(pt.y * 1000) / 1000}`;
        if (seen.has(key)) return;
        seen.add(key);
        list.push({ x: pt.x, y: pt.y });
    }

    function segmentIntersection(a1, a2, b1, b2) {
        const d = (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x);
        if (Math.abs(d) < 1e-9) return null;
        const ua = ((b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x)) / d;
        const ub = ((a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x)) / d;
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;
        return {
            x: a1.x + ua * (a2.x - a1.x),
            y: a1.y + ua * (a2.y - a1.y),
        };
    }

    function gatherSnapCandidates(point) {
        const candidates = [];
        const seen = new Set();
        if (!point) return candidates;

        const step = state.gridSize;
        if (Number.isFinite(step) && step > 0) {
            const gx = point.x / step;
            const gy = point.y / step;
            const ix = Math.floor(gx);
            const iy = Math.floor(gy);
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    addSnapCandidate(candidates, seen, {
                        x: (ix + dx) * step,
                        y: (iy + dy) * step,
                    });
                }
            }
        }

        const segments = [];
        wallStore.forEach(model => {
            const pts = Array.isArray(model.points) ? model.points : [];
            pts.forEach(pt => addSnapCandidate(candidates, seen, pt));
            const { segments: segs } = getWallSegments(model);
            segs.forEach(seg => {
                segments.push(seg);
                addSnapCandidate(candidates, seen, {
                    x: (seg.a.x + seg.b.x) / 2,
                    y: (seg.a.y + seg.b.y) / 2,
                });
            });
        });

        if (Array.isArray(state.currentWallPoints)) {
            state.currentWallPoints.forEach(pt => addSnapCandidate(candidates, seen, pt));
        }

        for (let i = 0; i < segments.length; i++) {
            for (let j = i + 1; j < segments.length; j++) {
                const inter = segmentIntersection(segments[i].a, segments[i].b, segments[j].a, segments[j].b);
                if (inter) addSnapCandidate(candidates, seen, inter);
            }
        }

        if (dom.itemsContainer) {
            const items = Array.from(dom.itemsContainer.querySelectorAll('.layout-object'));
            items.forEach(el => {
                if (el.dataset.visible === 'false' || el.style.display === 'none') return;
                const model = getModel(el);
                if (!model) return;
                const halfW = Math.abs(model.ow || 0) * Math.abs(model.sx || 0) / 2;
                const halfH = Math.abs(model.oh || 0) * Math.abs(model.sy || 0) / 2;
                const rad = (model.a || 0) * Math.PI / 180;
                const cos = Math.cos(rad);
                const sin = Math.sin(rad);
                const corners = [
                    { x: -halfW, y: -halfH },
                    { x: halfW, y: -halfH },
                    { x: halfW, y: halfH },
                    { x: -halfW, y: halfH },
                ];
                corners.forEach(c => {
                    const rx = c.x * cos - c.y * sin + model.x;
                    const ry = c.x * sin + c.y * cos + model.y;
                    addSnapCandidate(candidates, seen, { x: rx, y: ry });
                });
                addSnapCandidate(candidates, seen, { x: model.x, y: model.y });
            });
        }

        return candidates;
    }

    function setSnapMarkers(points, primaryPoint) {
        const group = dom.snapMarkers;
        if (!group) return;
        const snapRadius = Math.max(2, getSnapRadiusSvg() * 0.45);
        for (let i = snapState.markerPool.length; i < points.length; i++) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', snapRadius);
            group.appendChild(circle);
            snapState.markerPool.push(circle);
        }
        snapState.markerPool.forEach((marker, idx) => {
            if (idx < points.length) {
                const pt = points[idx];
                marker.setAttribute('display', '');
                marker.setAttribute('cx', pt.x);
                marker.setAttribute('cy', pt.y);
                marker.setAttribute('r', snapRadius);
                if (primaryPoint && Math.abs(primaryPoint.x - pt.x) < 1e-6 && Math.abs(primaryPoint.y - pt.y) < 1e-6) {
                    marker.setAttribute('data-primary', 'true');
                } else {
                    marker.removeAttribute('data-primary');
                }
                marker.removeAttribute('opacity');
            } else {
                marker.setAttribute('display', 'none');
                marker.removeAttribute('data-primary');
            }
        });
    }

    function clearSnapMarkers() {
        snapState.markerPool.forEach(marker => {
            marker.setAttribute('display', 'none');
            marker.removeAttribute('data-primary');
        });
    }

    function snapSvgPoint(point, { preview = true, altKey = false } = {}) {
        if (!point) return { point: point ?? { x: 0, y: 0 }, snapped: false };
        if (altKey || state.isAltDown) {
            if (preview) clearSnapMarkers();
            return { point: { x: point.x, y: point.y }, snapped: false };
        }
        const candidates = gatherSnapCandidates(point);
        const radius = getSnapRadiusSvg();
        let best = null;
        const nearby = [];
        candidates.forEach(pt => {
            const d = distance(point, pt);
            if (d <= radius) {
                nearby.push({ pt, dist: d });
                if (!best || d < best.dist) best = { pt, dist: d };
            }
        });
        if (preview) {
            if (nearby.length) {
                nearby.sort((a, b) => a.dist - b.dist);
                setSnapMarkers(nearby.map(n => n.pt), best?.pt);
            } else {
                clearSnapMarkers();
            }
        }
        if (best) {
            return { point: { x: best.pt.x, y: best.pt.y }, snapped: true };
        }
        return { point: { x: point.x, y: point.y }, snapped: false };
    }

    function snapValueToGrid(value) {
        const step = state.gridSize;
        if (!Number.isFinite(step) || step <= 0) return value;
        return Math.round(value / step) * step;
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
    function resolveTemplateId(raw) {
        if (typeof raw !== 'string') return 'zone';
        const key = raw.trim();
        if (!key) return 'zone';
        if (ITEM_TEMPLATES[key]) return key;
        if (TEMPLATE_ID_MAP[key]) {
            const mapped = TEMPLATE_ID_MAP[key];
            if (ITEM_TEMPLATES[mapped]) return mapped;
        }
        for (const rule of TEMPLATE_RULES) {
            if (!rule || !rule.test) continue;
            const match = key.match(rule.test);
            if (!match) continue;
            const target = typeof rule.target === 'function' ? rule.target(match, key) : rule.target;
            if (target && ITEM_TEMPLATES[target]) {
                TEMPLATE_ID_MAP[key] = target;
                return target;
            }
        }
        return ITEM_TEMPLATES[key] ? key : 'zone';
    }
    function setModel(el, model) { for (const k in model) { if (model[k] !== undefined) el.dataset[k] = model[k]; } applyTransformFromDataset(el); updatePropertiesPanel(model); updateLayerItem(model); }
    function applyTransformFromDataset(el) {
        const m = getModel(el);
        // позиция и поворот всего объекта (контейнер)
        el.setAttribute('transform', `translate(${m.x}, ${m.y}) rotate(${m.a})`);

        const core = el.querySelector('.core');
        if (core) {
            if (!core.dataset.baseTransform) {
                const init = core.getAttribute('transform') || '';
                core.dataset.baseTransform = init.trim();
            }
            const base = core.dataset.baseTransform;
            const dyn = `translate(${-m.cx}, ${-m.cy}) scale(${m.sx}, ${m.sy})`.trim();
            const compose = (...parts) => parts.filter(part => part && part.trim()).join(' ').trim();
            const dynFirst = compose(dyn, base);
            const baseFirst = compose(base, dyn);

            const setTransformForOrder = order => {
                const value = order === 'base-first' ? baseFirst : dynFirst;
                core.setAttribute('transform', value);
                return value;
            };

            const measureCenterDistance = () => {
                try {
                    const bbox = core.getBBox();
                    if (bbox && Number.isFinite(bbox.x) && Number.isFinite(bbox.y)) {
                        const cx = bbox.x + bbox.width / 2;
                        const cy = bbox.y + bbox.height / 2;
                        return Math.hypot(cx, cy);
                    }
                } catch {
                    // getBBox может выбросить, например, если элемент скрыт
                }
                return Number.POSITIVE_INFINITY;
            };

            const savedOrder = core.dataset.transformOrder;
            if (savedOrder === 'base-first' || savedOrder === 'dyn-first') {
                setTransformForOrder(savedOrder);
            } else {
                const candidates = [
                    { order: 'dyn-first', value: dynFirst },
                    { order: 'base-first', value: baseFirst },
                ];
                let best = candidates[0];
                let bestDistance = Number.POSITIVE_INFINITY;

                for (const candidate of candidates) {
                    core.setAttribute('transform', candidate.value);
                    const distance = measureCenterDistance();
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        best = candidate;
                    }
                }

                core.dataset.transformOrder = best.order;
                core.setAttribute('transform', best.value);
            }
        }

        updateSelectionUI(el);
    }

    // --- UI & SELECTION ---
    function updateSelectionUI(el) { if (!el) return; const m = getModel(el); const w = m.ow * m.sx, h = m.oh * m.sy; const sel = el.querySelector('.selection-box'); if (sel) { sel.setAttribute('x', -w / 2 - 5); sel.setAttribute('y', -h / 2 - 5); sel.setAttribute('width', w + 10); sel.setAttribute('height', h + 10); } const rs = el.querySelector('.resize-handle'); if (rs) { rs.setAttribute('x', w / 2 - 6); rs.setAttribute('y', h / 2 - 6); } const ro = el.querySelector('.rotate-handle'); if (ro) { ro.setAttribute('cx', 0); ro.setAttribute('cy', -h / 2 - 20); } }
    function updatePropertiesPanel(model) { if (model && state.selectedObject) { dom.propControls.classList.remove('hidden'); dom.propPlaceholder.classList.add('hidden'); dom.propX.value = Math.round(model.x); dom.propY.value = Math.round(model.y); dom.propW.value = Math.round(model.ow * model.sx); dom.propH.value = Math.round(model.oh * model.sy); dom.propA.value = Math.round(model.a); } else { dom.propControls.classList.add('hidden'); dom.propPlaceholder.classList.remove('hidden'); } }
    function updateComponentPanel(target) {
        if (!dom.componentPanel) return;
        const compEl = target ? target.closest('.wall-component') : null;
        if (!compEl) {
            dom.componentPanel.classList.add('hidden');
            return;
        }
        const compModel = componentStore.get(compEl);
        if (!compModel || (compModel.type !== 'door' && compModel.type !== 'window')) {
            dom.componentPanel.classList.add('hidden');
            return;
        }
        dom.componentPanel.classList.remove('hidden');
        if (compModel.type === 'door') {
            const variant = normaliseDoorComponent(compModel);
            const selectValue = `door-${compModel.variant}`;
            dom.componentType.value = selectValue;
            const widthCm = clampDoorWidthCm(compModel.variant, compModel.width * 100);
            dom.componentWidth.min = variant.minCm || 50;
            dom.componentWidth.max = variant.maxCm || 400;
            dom.componentWidth.step = variant.stepCm || 5;
            dom.componentWidth.value = widthCm;
            dom.componentHingeGroup.classList.toggle('hidden', !variant.allowHinge);
            dom.componentSwingGroup.classList.toggle('hidden', !variant.allowSwing);
            if (variant.allowHinge) {
                if (compModel.hinge === 'right') dom.componentHingeRight.checked = true;
                else dom.componentHingeLeft.checked = true;
            }
            if (variant.allowSwing) {
                if (compModel.swing === 'out') dom.componentSwingOut.checked = true;
                else dom.componentSwingIn.checked = true;
            }
            if (!variant.allowHinge) {
                dom.componentHingeLeft.checked = true;
                dom.componentHingeRight.checked = false;
            }
            if (!variant.allowSwing) {
                dom.componentSwingIn.checked = true;
                dom.componentSwingOut.checked = false;
            }
            state.doorDefaults = {
                variant: compModel.variant,
                hinge: compModel.hinge,
                swing: compModel.swing,
                width: compModel.width
            };
        } else {
            const windowSpec = OPENING_SPECS.window;
            dom.componentType.value = 'window';
            const widthMeters = Number.isFinite(compModel.width) && compModel.width > 0 ? compModel.width : windowSpec.widthMeters;
            dom.componentWidth.min = 40;
            dom.componentWidth.max = 400;
            dom.componentWidth.step = 5;
            dom.componentWidth.value = Math.round(widthMeters * 100);
            dom.componentHingeGroup.classList.add('hidden');
            dom.componentSwingGroup.classList.add('hidden');
        }
    }

    function getActiveComponentModel() {
        if (!state.selectedComponent) return null;
        return componentStore.get(state.selectedComponent) || null;
    }

    function refreshComponentVisual(compModel) {
        if (!compModel) return;
        const wallEl = wallIdMap.get(compModel.wallId);
        if (wallEl) {
            updateWallComponentsPosition(wallEl);
        }
    }

    function applyComponentType(value) {
        const compModel = getActiveComponentModel();
        if (!compModel) return;
        if (value === 'window') {
            compModel.type = 'window';
            delete compModel.variant;
            delete compModel.hinge;
            delete compModel.swing;
            const widthCm = utils.clamp(Math.round((Number.isFinite(compModel.width) && compModel.width > 0 ? compModel.width : OPENING_SPECS.window.widthMeters) * 100), 40, 400);
            compModel.width = widthCm / 100;
            delete state.selectedComponent.dataset.variant;
            delete state.selectedComponent.dataset.hinge;
            delete state.selectedComponent.dataset.swing;
        } else {
            const variantKey = (value && value.startsWith('door-')) ? value.slice(5) : 'single';
            compModel.type = 'door';
            compModel.variant = DOOR_VARIANTS[variantKey] ? variantKey : 'single';
            normaliseDoorComponent(compModel);
            const widthCm = clampDoorWidthCm(compModel.variant, compModel.width * 100);
            compModel.width = widthCm / 100;
            state.doorDefaults = {
                variant: compModel.variant,
                hinge: compModel.hinge,
                swing: compModel.swing,
                width: compModel.width
            };
            state.selectedComponent.dataset.variant = compModel.variant;
            state.selectedComponent.dataset.hinge = compModel.hinge;
            state.selectedComponent.dataset.swing = compModel.swing;
        }
        componentStore.set(state.selectedComponent, compModel);
        state.selectedComponent.dataset.type = compModel.type;
        state.selectedComponent.dataset.width = compModel.width.toFixed(3);
        refreshComponentVisual(compModel);
        updateComponentPanel(state.selectedComponent);
        commit('component_update');
    }

    function handleComponentWidthChange() {
        const compModel = getActiveComponentModel();
        if (!compModel) return;
        let valueCm = parseFloat(dom.componentWidth.value);
        if (!Number.isFinite(valueCm)) {
            valueCm = compModel.width * 100;
        }
        if (compModel.type === 'door') {
            const snapped = clampDoorWidthCm(compModel.variant, valueCm);
            dom.componentWidth.value = snapped;
            compModel.width = snapped / 100;
            state.doorDefaults = {
                variant: compModel.variant,
                hinge: compModel.hinge,
                swing: compModel.swing,
                width: compModel.width
            };
        } else {
            const snapped = utils.clamp(Math.round(valueCm / 5) * 5, 40, 400);
            dom.componentWidth.value = snapped;
            compModel.width = snapped / 100;
        }
        componentStore.set(state.selectedComponent, compModel);
        state.selectedComponent.dataset.width = compModel.width.toFixed(3);
        refreshComponentVisual(compModel);
        updateComponentPanel(state.selectedComponent);
        commit('component_update');
    }

    function applyComponentHinge(value) {
        const compModel = getActiveComponentModel();
        if (!compModel || compModel.type !== 'door') return;
        const variant = normaliseDoorComponent(compModel);
        if (!variant.allowHinge) return;
        compModel.hinge = value === 'right' ? 'right' : 'left';
        componentStore.set(state.selectedComponent, compModel);
        state.selectedComponent.dataset.hinge = compModel.hinge;
        state.doorDefaults = {
            variant: compModel.variant,
            hinge: compModel.hinge,
            swing: compModel.swing,
            width: compModel.width
        };
        refreshComponentVisual(compModel);
        updateComponentPanel(state.selectedComponent);
        commit('component_update');
    }

    function applyComponentSwing(value) {
        const compModel = getActiveComponentModel();
        if (!compModel || compModel.type !== 'door') return;
        const variant = normaliseDoorComponent(compModel);
        if (!variant.allowSwing) return;
        compModel.swing = value === 'out' ? 'out' : 'in';
        componentStore.set(state.selectedComponent, compModel);
        state.selectedComponent.dataset.swing = compModel.swing;
        state.doorDefaults = {
            variant: compModel.variant,
            hinge: compModel.hinge,
            swing: compModel.swing,
            width: compModel.width
        };
        refreshComponentVisual(compModel);
        updateComponentPanel(state.selectedComponent);
        commit('component_update');
    }
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
        updateComponentPanel(null);
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
        } catch {
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
    function selectObject(el) { if (state.activeTool !== 'pointer') return; clearSelections(); state.selectedObject = el ? el.closest('.layout-object') : null; if (state.selectedObject) { state.selectedObject.classList.add('selected'); dom.itemsContainer.appendChild(state.selectedObject); const model = getModel(state.selectedObject); updatePropertiesPanel(model); updateComponentPanel(null); const li = dom.layersList.querySelector(`[data-id="${model.id}"]`); if (li) li.classList.add('selected'); } }
    function selectWall(wallEl) {
        if (state.activeTool !== 'pointer') return;
        const wall = ensureWallElement(wallEl);
        if (!wall) return;
        clearSelections();
        updateComponentPanel(null);
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
    function selectComponent(compEl) { if (state.activeTool !== 'pointer') return; clearSelections(); state.selectedComponent = compEl; if (state.selectedComponent) { state.selectedComponent.classList.add('selected'); updateComponentPanel(state.selectedComponent); } }

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
        if (!model) return;
        const comps = Array.isArray(model.components) ? model.components : [];
        comps.forEach(comp => {
            const compEl = componentIdMap.get(comp.id);
            if (!compEl) return;
            compEl.innerHTML = renderWallComponentMarkup(comp, model);
            if (Number.isFinite(comp.width)) {
                compEl.dataset.width = comp.width.toFixed(3);
            }
            if (comp.variant) compEl.dataset.variant = comp.variant;
            else delete compEl.dataset.variant;
            if (comp.hinge) compEl.dataset.hinge = comp.hinge;
            else delete compEl.dataset.hinge;
            if (comp.swing) compEl.dataset.swing = comp.swing;
            else delete compEl.dataset.swing;
            const { point, angle } = pointAtWallDistance(model, comp.distance);
            const transform = `translate(${point.x}, ${point.y}) rotate(${angle})`;
            compEl.setAttribute('transform', transform);
        });
        updateWallMaskOpenings(wallEl);
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

    function getSvgDisplayScale() {
        if (!dom.svg) return null;
        const view = state.viewBox || dom.svg.viewBox?.baseVal;
        if (!view) return null;
        const rect = dom.svg.getBoundingClientRect();
        const scaleX = rect.width ? rect.width / view.width : null;
        const scaleY = rect.height ? rect.height / view.height : null;
        const candidates = [scaleX, scaleY].filter(v => Number.isFinite(v) && v > 0);
        if (!candidates.length) return null;
        return Math.min(...candidates);
    }

    function getPixelsPerMeter() {
        const ppm = Number.isFinite(state.pixelsPerMeter) && state.pixelsPerMeter > 0 ? state.pixelsPerMeter : 50;
        return ppm;
    }

    function sheetMmToUnits(mm) {
        if (!Number.isFinite(mm)) return 0;
        const ppm = getPixelsPerMeter();
        return (mm * ppm) / SHEET_MM_PER_METER;
    }

    function getDoorVariant(key) {
        return DOOR_VARIANTS[key] || DOOR_VARIANTS.single;
    }

    function normaliseDoorComponent(compModel) {
        if (!compModel) return getDoorVariant('single');
        const variantKey = (typeof compModel.variant === 'string' && DOOR_VARIANTS[compModel.variant]) ? compModel.variant : 'single';
        compModel.variant = variantKey;
        const variant = DOOR_VARIANTS[variantKey];
        if (variant.allowHinge) {
            compModel.hinge = compModel.hinge === 'right' ? 'right' : 'left';
        } else {
            compModel.hinge = 'left';
        }
        if (variant.allowSwing) {
            compModel.swing = compModel.swing === 'out' ? 'out' : 'in';
        } else {
            compModel.swing = 'in';
        }
        if (!Number.isFinite(compModel.width) || compModel.width <= 0) {
            compModel.width = variant.widthMeters;
        }
        return variant;
    }

    function clampDoorWidthCm(variantKey, widthCm) {
        const variant = getDoorVariant(variantKey);
        const step = variant.stepCm || 5;
        const min = variant.minCm || 50;
        const max = variant.maxCm || 400;
        if (!Number.isFinite(widthCm)) {
            widthCm = variant.widthMeters * 100;
        }
        const snapped = Math.round(widthCm / step) * step;
        return utils.clamp(snapped, min, max);
    }

    function renderDoorLeaf({ widthUnits, hingeOffset, swingSign, stroke, detailWidth, leafThickness, mirror }) {
        if (!(widthUnits > 0)) return '';
        const transforms = [`translate(${hingeOffset.toFixed(3)}, 0)`];
        if (mirror) transforms.push('scale(-1,1)');
        const sweepFlag = swingSign > 0 ? 1 : 0;
        const lineAttrs = `stroke="${stroke}" stroke-width="${detailWidth.toFixed(3)}" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" pointer-events="stroke"`;
        const dash = `${sheetMmToUnits(6).toFixed(3)} ${sheetMmToUnits(4).toFixed(3)}`;
        const hingeLine = `<line x1="0" y1="${(-leafThickness / 2).toFixed(3)}" x2="0" y2="${(leafThickness / 2).toFixed(3)}" ${lineAttrs}/>`;
        const leafLine = `<line x1="0" y1="0" x2="0" y2="${(swingSign * widthUnits).toFixed(3)}" ${lineAttrs} stroke-dasharray="${dash}"/>`;
        const arc = `<path d="M ${widthUnits.toFixed(3)} 0 A ${widthUnits.toFixed(3)} ${widthUnits.toFixed(3)} 0 0 ${sweepFlag} 0 ${(swingSign * widthUnits).toFixed(3)}" fill="none" ${lineAttrs}/>`;
        return `<g transform="${transforms.join(' ')}">${hingeLine}${leafLine}${arc}</g>`;
    }

    function renderDoorVariantMarkup(compModel, variant, { widthUnits, leafThickness, detailWidth, stroke }) {
        if (!(widthUnits > 0)) return '';
        const attrs = `stroke="${stroke}" stroke-width="${detailWidth.toFixed(3)}" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" pointer-events="stroke"`;
        const dash = `${sheetMmToUnits(6).toFixed(3)} ${sheetMmToUnits(4).toFixed(3)}`;
        const swingSign = compModel.swing === 'out' ? -1 : 1;
        const variantKey = compModel.variant || 'single';
        if (variantKey === 'double') {
            const half = widthUnits / 2;
            if (!(half > 0)) return '';
            const left = renderDoorLeaf({ widthUnits: half, hingeOffset: -widthUnits / 2, swingSign, stroke, detailWidth, leafThickness, mirror: false });
            const right = renderDoorLeaf({ widthUnits: half, hingeOffset: widthUnits / 2, swingSign, stroke, detailWidth, leafThickness, mirror: true });
            const center = `<line x1="0" y1="${(-leafThickness / 2).toFixed(3)}" x2="0" y2="${(leafThickness / 2).toFixed(3)}" ${attrs} stroke-dasharray="${dash}"/>`;
            return `<g>${left}${right}${center}</g>`;
        }
        if (variantKey === 'sliding') {
            const x0 = -widthUnits / 2;
            const x1 = widthUnits / 2;
            const guideOffset = sheetMmToUnits(6);
            const dash = `${sheetMmToUnits(10).toFixed(3)} ${sheetMmToUnits(6).toFixed(3)}`;
            const panelWidth = Math.min(widthUnits * 0.6, widthUnits - sheetMmToUnits(20));
            const panelEnd = Math.min(x1, x0 + Math.max(panelWidth, widthUnits * 0.4));
            return `<g>
                <line x1="${x0.toFixed(3)}" y1="0" x2="${x1.toFixed(3)}" y2="0" ${attrs}/>
                <line x1="${x0.toFixed(3)}" y1="${guideOffset.toFixed(3)}" x2="${x1.toFixed(3)}" y2="${guideOffset.toFixed(3)}" ${attrs} stroke-dasharray="${dash}"/>
                <line x1="${x0.toFixed(3)}" y1="${(-guideOffset).toFixed(3)}" x2="${panelEnd.toFixed(3)}" y2="${(-guideOffset).toFixed(3)}" ${attrs}/>
                <line x1="${panelEnd.toFixed(3)}" y1="${(-guideOffset).toFixed(3)}" x2="${panelEnd.toFixed(3)}" y2="${guideOffset.toFixed(3)}" ${attrs}/>
            </g>`;
        }
        if (variantKey === 'glass') {
            const gap = sheetMmToUnits(6);
            const x0 = -widthUnits / 2;
            const x1 = widthUnits / 2;
            const dash = `${sheetMmToUnits(8).toFixed(3)} ${sheetMmToUnits(6).toFixed(3)}`;
            return `<g>
                <line x1="${x0.toFixed(3)}" y1="${gap.toFixed(3)}" x2="${x1.toFixed(3)}" y2="${gap.toFixed(3)}" ${attrs} stroke-dasharray="${dash}"/>
                <line x1="${x0.toFixed(3)}" y1="${(-gap).toFixed(3)}" x2="${x1.toFixed(3)}" y2="${(-gap).toFixed(3)}" ${attrs}/>
            </g>`;
        }
        const hingeOffset = compModel.hinge === 'right' ? widthUnits / 2 : -widthUnits / 2;
        return `<g>${renderDoorLeaf({ widthUnits, hingeOffset, swingSign, stroke, detailWidth, leafThickness, mirror: compModel.hinge === 'right' })}</g>`;
    }

    function getWallPreset(type) {
        const resolved = ensureWallType(type);
        return WALL_RENDER_PRESETS[resolved] || WALL_RENDER_PRESETS.structural;
    }

    function resolveWallThickness(model, preset) {
        const resolvedPreset = preset || getWallPreset(model?.type);
        const customThickness = model?.thickness;
        const thicknessMeters = Number.isFinite(customThickness) && customThickness > 0
            ? customThickness
            : resolvedPreset.thickness;
        const thicknessSheetMm = thicknessMeters * SHEET_MM_PER_METER;
        const thicknessUnits = sheetMmToUnits(thicknessSheetMm);
        return {
            thicknessMeters,
            thicknessSheetMm,
            thicknessUnits,
            preset: resolvedPreset,
        };
    }

    function ensureWallMask(wallEl) {
        if (!wallEl) return null;
        const baseId = wallEl.dataset.id ? `wall-mask-${wallEl.dataset.id}` : `wall-mask-${wallMaskMap.size + 1}`;
        let entry = wallMaskMap.get(wallEl);
        if (entry) {
            if (entry.id !== baseId) {
                entry.id = baseId;
                entry.mask.setAttribute('id', baseId);
            }
            return entry;
        }
        let maskEl;
        let openingsGroup;
        if (dom.wallMaskTemplate) {
            maskEl = dom.wallMaskTemplate.cloneNode(true);
            maskEl.removeAttribute('id');
            openingsGroup = maskEl.querySelector('[data-role="wall-mask-openings"]');
            if (openingsGroup) {
                openingsGroup.innerHTML = '';
            }
        }
        if (!maskEl) {
            maskEl = document.createElementNS(SVG_NS, 'mask');
            const rect = document.createElementNS(SVG_NS, 'rect');
            rect.setAttribute('x', '-10000');
            rect.setAttribute('y', '-10000');
            rect.setAttribute('width', '20000');
            rect.setAttribute('height', '20000');
            rect.setAttribute('fill', 'white');
            maskEl.appendChild(rect);
        }
        if (!openingsGroup) {
            openingsGroup = document.createElementNS(SVG_NS, 'g');
            openingsGroup.dataset.role = 'wall-mask-openings';
            maskEl.appendChild(openingsGroup);
        }
        maskEl.setAttribute('id', baseId);
        maskEl.setAttribute('maskUnits', 'userSpaceOnUse');
        maskEl.setAttribute('maskContentUnits', 'userSpaceOnUse');
        maskEl.setAttribute('mask-type', 'alpha');
        dom.defs?.appendChild(maskEl);
        entry = { id: baseId, mask: maskEl, openingsGroup };
        wallMaskMap.set(wallEl, entry);
        return entry;
    }

    function ensureWallPath(wallEl, className) {
        if (!wallEl) return null;
        let path = wallEl.querySelector(`.${className}`);
        if (path) return path;
        path = document.createElementNS(SVG_NS, 'path');
        path.classList.add(className);
        if (className === 'wall-body') {
            wallEl.insertBefore(path, wallEl.firstChild || null);
        } else if (className === 'wall-edge') {
            const handles = wallEl.querySelector('.wall-handles');
            if (handles) {
                wallEl.insertBefore(path, handles);
            } else {
                const inserts = wallEl.querySelector('.wall-inserts');
                if (inserts) {
                    wallEl.insertBefore(path, inserts);
                } else {
                    wallEl.appendChild(path);
                }
            }
        } else {
            wallEl.appendChild(path);
        }
        return path;
    }

    function setStrokeDash(path, dashMm) {
        if (!path) return;
        if (Array.isArray(dashMm) && dashMm.length) {
            const values = dashMm.map(v => sheetMmToUnits(v)).filter(v => Number.isFinite(v) && v > 0);
            if (values.length) {
                path.setAttribute('stroke-dasharray', values.map(v => v.toFixed(3)).join(' '));
                return;
            }
        }
        path.removeAttribute('stroke-dasharray');
    }

    function updateWallVisualStyle(wallEl, model = getWallModel(wallEl)) {
        if (!wallEl || !model) return;
        const preset = getWallPreset(model.type);
        const thickness = resolveWallThickness(model, preset);
        model.thickness = thickness.thicknessMeters;
        const body = wallEl.querySelector('.wall-body');
        const edge = wallEl.querySelector('.wall-edge');
        if (body) {
            body.setAttribute('stroke', preset.bodyStroke);
            if (thickness.thicknessUnits > 0) {
                body.setAttribute('stroke-width', thickness.thicknessUnits.toFixed(3));
                body.dataset.sheetThicknessMm = thickness.thicknessSheetMm.toFixed(2);
            } else {
                body.removeAttribute('stroke-width');
                delete body.dataset.sheetThicknessMm;
            }
            body.setAttribute('stroke-linecap', 'butt');
            body.setAttribute('stroke-linejoin', 'round');
            body.setAttribute('fill', 'none');
            setStrokeDash(body, preset.bodyDashMm);
        }
        if (edge) {
            edge.setAttribute('stroke', preset.edgeStroke || '#0F2E2B');
            const edgeWidth = sheetMmToUnits(EDGE_WIDTH_MM);
            if (edgeWidth > 0) {
                edge.setAttribute('stroke-width', edgeWidth.toFixed(3));
            } else {
                edge.removeAttribute('stroke-width');
            }
            edge.setAttribute('stroke-linecap', 'butt');
            edge.setAttribute('stroke-linejoin', 'round');
            edge.setAttribute('fill', 'none');
            setStrokeDash(edge, preset.edgeDashMm);
        }
    }

    function updateWallMaskOpenings(wallEl) {
        if (!wallEl) return;
        const model = getWallModel(wallEl);
        if (!model) return;
        const entry = ensureWallMask(wallEl);
        if (!entry) return;
        entry.openingsGroup.innerHTML = '';
        const body = wallEl.querySelector('.wall-body');
        const edge = wallEl.querySelector('.wall-edge');
        if (body) {
            body.setAttribute('mask', `url(#${entry.id})`);
        }
        if (edge) {
            edge.setAttribute('mask', `url(#${entry.id})`);
        }
        if (!Array.isArray(model.components) || !model.components.length) return;
        const thickness = resolveWallThickness(model);
        const thicknessUnits = thickness.thicknessUnits;
        if (!(thicknessUnits > 0)) return;
        const halfThickness = thicknessUnits / 2;
        model.components.forEach(comp => {
            const spec = OPENING_SPECS[comp.type] || OPENING_SPECS.door;
            let widthMeters;
            if (comp.type === 'door') {
                const variant = normaliseDoorComponent(comp);
                widthMeters = Number.isFinite(comp.width) && comp.width > 0 ? comp.width : variant.widthMeters;
            } else {
                widthMeters = Number.isFinite(comp.width) && comp.width > 0 ? comp.width : spec.widthMeters;
            }
            if (!Number.isFinite(widthMeters) || widthMeters <= 0) {
                widthMeters = spec.widthMeters;
            }
            const widthSheetMm = widthMeters * SHEET_MM_PER_METER;
            const widthUnits = sheetMmToUnits(widthSheetMm);
            if (!(widthUnits > 0)) return;
            const { point, angle } = pointAtWallDistance(model, comp.distance);
            const openingRect = document.createElementNS(SVG_NS, 'rect');
            openingRect.setAttribute('x', (-widthUnits / 2).toFixed(3));
            openingRect.setAttribute('y', (-halfThickness).toFixed(3));
            openingRect.setAttribute('width', widthUnits.toFixed(3));
            openingRect.setAttribute('height', thicknessUnits.toFixed(3));
            openingRect.setAttribute('fill', 'black');
            openingRect.setAttribute('transform', `translate(${point.x}, ${point.y}) rotate(${angle})`);
            entry.openingsGroup.appendChild(openingRect);
        });
    }

    function refreshWallStrokeWidths() {
        const walls = dom.wallsContainer?.querySelectorAll('.wall');
        if (!walls) return;
        walls.forEach(wall => {
            const model = getWallModel(wall);
            if (!model) return;
            updateWallVisualStyle(wall, model);
            if (Array.isArray(model.components)) {
                model.components.forEach(comp => {
                    const compEl = componentIdMap.get(comp.id);
                    if (compEl) {
                        compEl.innerHTML = renderWallComponentMarkup(comp, model);
                    }
                });
            }
            updateWallMaskOpenings(wall);
        });
    }

    function updateWallElementGeometry(wallEl) {
        const model = getWallModel(wallEl);
        if (!model) return;
        const resolvedType = ensureWallType(model.type || state.defaultWallType);
        model.type = resolvedType;
        wallEl.dataset.type = resolvedType;
        const bodyPath = ensureWallPath(wallEl, 'wall-body');
        const edgePath = ensureWallPath(wallEl, 'wall-edge');
        const maskEntry = ensureWallMask(wallEl);
        if (maskEntry) {
            if (bodyPath) {
                bodyPath.setAttribute('mask', `url(#${maskEntry.id})`);
            }
            if (edgePath) {
                edgePath.setAttribute('mask', `url(#${maskEntry.id})`);
            }
        }
        const pts = model.points;
        if (!pts || pts.length === 0) {
            bodyPath?.removeAttribute('d');
            edgePath?.removeAttribute('d');
            return;
        }
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            d += ` L ${pts[i].x} ${pts[i].y}`;
        }
        if (model.closed && pts.length > 2) d += ' Z';
        if (bodyPath) bodyPath.setAttribute('d', d);
        if (edgePath) edgePath.setAttribute('d', d);
        updateWallVisualStyle(wallEl, model);
        updateWallHandles(wallEl);
        updateWallComponentsPosition(wallEl);
    }

    function createWall(points, closed = false) {
        if (!points || points.length < 2) return null;
        const wallEl = document.createElementNS(SVG_NS, 'g');
        wallEl.classList.add('wall');
        const id = `wall-${++state.wallCounter}`;
        wallEl.dataset.id = id;
        const type = ensureWallType(state.defaultWallType);
        const model = { id, points: points.map(p => ({ x: p.x, y: p.y })), closed, components: [], type };
        const body = document.createElementNS(SVG_NS, 'path');
        body.classList.add('wall-body');
        const edge = document.createElementNS(SVG_NS, 'path');
        edge.classList.add('wall-edge');
        wallEl.appendChild(body);
        wallEl.appendChild(edge);
        wallEl.dataset.type = type;
        dom.wallsContainer.appendChild(wallEl);
        ensureWallMask(wallEl);
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
        const maskEntry = wallMaskMap.get(wallEl);
        if (maskEntry) {
            maskEntry.mask.remove();
            wallMaskMap.delete(wallEl);
        }
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
        const { point: snapped } = snapSvgPoint(p, { altKey: e.altKey });
        model.points[wallHandleDrag.index] = snapped;
        updateWallElementGeometry(wallEl);
    }

    function onWallHandlePointerUp() {
        if (!wallHandleDrag) return;
        updateWallElementGeometry(wallHandleDrag.wall);
        commit('wall_vertex_move');
        wallHandleDrag = null;
        clearSnapMarkers();
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
        const { point: snapped } = snapSvgPoint(p, { altKey: e.altKey });
        insertWallVertex(wallEl, index, snapped);
        state.selectedWallHandle = { wall: wallEl, index };
        updateWallHandles(wallEl);
        commit('wall_vertex_add');
        clearSnapMarkers();
    }

    function makeWallInteractive(wallEl) {
        if (wallEl.dataset.interactive === 'true') return;
        wallEl.dataset.interactive = 'true';
        const path = wallEl.querySelector('.wall-edge') || wallEl.querySelector('.wall-body');
        if (path) {
            path.addEventListener('dblclick', e => {
                if (state.activeTool !== 'pointer') return;
                const model = getWallModel(wallEl);
                if (!model) return;
                const p = utils.toSVGPoint(e.clientX, e.clientY);
                const { point: snapped } = snapSvgPoint(p, { altKey: e.altKey });
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
                clearSnapMarkers();
            });
        }
        updateWallHandles(wallEl);
    }

    // --- OBJECT & WALL CREATION / MANIPULATION ---
    function buildAttributeString(attrs, extraClasses = []) {
        const attrMap = new Map();
        (attrs || []).forEach(attr => {
            if (!attr || !attr.name) return;
            attrMap.set(attr.name, attr.value ?? '');
        });
        const classNames = new Set((attrMap.get('class') || '').split(/\s+/).filter(Boolean));
        extraClasses.forEach(cls => classNames.add(cls));
        if (classNames.size) {
            attrMap.set('class', Array.from(classNames).join(' '));
        } else if (extraClasses.length) {
            attrMap.set('class', extraClasses.join(' '));
        }
        return Array.from(attrMap.entries()).map(([name, value]) => `${name}="${value}"`).join(' ');
    }

    function renderItemTemplate(id, mode = state.renderMode || 'schematic') {
        const tpl = ITEM_TEMPLATES?.[id];
        if (!tpl) return '';
        const variant = mode === 'rich' ? 'rich' : 'schematic';
        if (variant === 'schematic' && typeof tpl.schematicSvg === 'function') {
            if (tpl.__schematicSymbolId && tpl.__schematicAttrs) {
                const attrString = buildAttributeString(tpl.__schematicAttrs, ['core', 'schematic-only']);
                const symbolId = tpl.__schematicSymbolId;
                return `<g ${attrString}><use href="#${symbolId}" xlink:href="#${symbolId}"></use></g>`;
            }
            const markup = tpl.schematicSvg();
            if (markup) return markup;
        }
        return typeof tpl.svg === 'function' ? tpl.svg() : '';
    }

    function rerenderLayoutObject(el) {
        if (!el) return;
        const tplId = el.dataset?.template;
        if (!tplId) return;
        const markup = renderItemTemplate(tplId, state.renderMode);
        if (!markup) return;
        const currentCore = el.querySelector('.core');
        if (currentCore) {
            currentCore.outerHTML = markup;
        } else {
            el.insertAdjacentHTML('afterbegin', markup);
        }
        const newCore = el.querySelector('.core');
        if (!newCore) return;
        const bbox = newCore.getBBox();
        const model = getModel(el);
        model.cx = bbox.x + bbox.width / 2;
        model.cy = bbox.y + bbox.height / 2;
        model.ow = bbox.width;
        model.oh = bbox.height;
        setModel(el, model);
    }

    function rerenderAllLayoutObjects() {
        if (!dom.itemsContainer) return;
        dom.itemsContainer.querySelectorAll('.layout-object').forEach(rerenderLayoutObject);
    }

    function updateSvgModeClass(mode) {
        if (!dom.svg) return;
        dom.svg.classList.remove('svg-mode--schematic', 'svg-mode--rich');
        dom.svg.classList.add(mode === 'rich' ? 'svg-mode--rich' : 'svg-mode--schematic');
    }

    function updateRenderModeToggle(mode = state.renderMode) {
        if (!dom.renderModeToggle) return;
        const normalized = mode === 'rich' ? 'rich' : 'schematic';
        const text = normalized === 'rich' ? 'Режим: Детально' : 'Режим: План';
        const labelNode = dom.renderModeToggle.querySelector('.label');
        if (labelNode) {
            labelNode.textContent = text;
        } else {
            dom.renderModeToggle.textContent = text;
        }
        dom.renderModeToggle.setAttribute('aria-pressed', normalized === 'rich' ? 'true' : 'false');
        dom.renderModeToggle.dataset.mode = normalized;
    }

    function setRenderMode(mode, { rerender = true } = {}) {
        const next = mode === 'rich' ? 'rich' : 'schematic';
        const prev = state.renderMode;
        state.renderMode = next;
        updateSvgModeClass(next);
        updateRenderModeToggle(next);
        if (rerender && prev !== next) {
            rerenderAllLayoutObjects();
            commit('render_mode_change');
        }
        return next;
    }

    function buildSymbolsFromSchematic() {
        if (!dom.svg || typeof ITEM_TEMPLATES !== 'object') return;
        let defsHost = dom.svg.querySelector('defs[data-generated="schematic-symbols"]');
        if (!defsHost) {
            defsHost = document.createElementNS(SVG_NS, 'defs');
            defsHost.dataset.generated = 'schematic-symbols';
            dom.svg.prepend(defsHost);
        } else {
            while (defsHost.firstChild) defsHost.removeChild(defsHost.firstChild);
        }
        Object.entries(ITEM_TEMPLATES).forEach(([id, tpl]) => {
            if (!tpl) return;
            delete tpl.__schematicSymbolId;
            delete tpl.__schematicAttrs;
            if (typeof tpl.schematicSvg !== 'function') return;
            const raw = tpl.schematicSvg();
            if (typeof raw !== 'string' || !raw.trim()) return;
            const temp = document.createElementNS(SVG_NS, 'svg');
            temp.innerHTML = raw.trim();
            const coreEl = temp.querySelector('.core');
            if (!coreEl) return;
            const attrs = Array.from(coreEl.attributes).map(attr => ({ name: attr.name, value: attr.value }));
            const symbol = document.createElementNS(SVG_NS, 'symbol');
            const symbolId = `sym-${id}`;
            symbol.setAttribute('id', symbolId);
            Array.from(coreEl.childNodes).forEach(node => {
                symbol.appendChild(node.cloneNode(true));
            });
            defsHost.appendChild(symbol);
            tpl.__schematicSymbolId = symbolId;
            tpl.__schematicAttrs = attrs;
        });
    }

    function createLayoutObject(tpl, x, y) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        el.classList.add('layout-object');
        el.dataset.id = `el-${state.objectCounter++}`;
        const safeTpl = resolveTemplateId(tpl);
        el.dataset.template = safeTpl;
        let coreMarkup = renderItemTemplate(safeTpl, state.renderMode);
        if (!coreMarkup && typeof ITEM_TEMPLATES[safeTpl]?.svg === 'function') {
            coreMarkup = ITEM_TEMPLATES[safeTpl].svg();
        }
        if (!coreMarkup) {
            coreMarkup = `<g class="core" data-id="${safeTpl}"></g>`;
        }
        el.innerHTML = `${coreMarkup}<rect class="selection-box"></rect><rect class="resize-handle" width="12" height="12"></rect><circle class="rotate-handle" r="8"></circle>`;
        dom.itemsContainer.appendChild(el);
        const core = el.querySelector('.core');
        const bbox = core ? core.getBBox() : { x: 0, y: 0, width: 0, height: 0 };
        const model = {
            x,
            y,
            a: 0,
            sx: 1,
            sy: 1,
            cx: bbox.x + bbox.width / 2,
            cy: bbox.y + bbox.height / 2,
            ow: bbox.width,
            oh: bbox.height,
            locked: false,
            visible: true
        };
        setModel(el, model);
        makeInteractive(el);
        commit('add');
        return el;
    }
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
        clearSnapMarkers();
        // Покидая режим измерения — сохраняем линии, но убираем предпросмотр
        if (state.activeTool !== 'measure') {
            resetMeasurementPreview();
        }
    }
    function finishCurrentWall(forceClose = false) {
        if (state.currentWallPoints.length > 1) {
            const dedupeThreshold = Math.max(1e-3, (state.gridSize || 0) * 0.002);
            const points = [];
            state.currentWallPoints.forEach(p => {
                const copy = { x: p.x, y: p.y };
                const prev = points[points.length - 1];
                if (!prev || distance(prev, copy) > dedupeThreshold) {
                    points.push(copy);
                }
            });
            if (points.length > 1) {
                let closed = false;
                if (points.length > 2) {
                    const first = points[0];
                    const last = points[points.length - 1];
                    const distToFirst = distance(first, last);
                    if (distToFirst < Math.max(1, (state.gridSize || 0) * 0.2)) {
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
        }
        state.currentWallPoints = [];
        dom.wallPreview.setAttribute('points', '');
        hideWallLengthPreview();
        clearSnapMarkers();
    }
    function renderWallComponentMarkup(compModel, wallModel) {
        if (!compModel) return '';
        const spec = OPENING_SPECS[compModel.type] || OPENING_SPECS.door;
        const wallPreset = getWallPreset(wallModel?.type || state.defaultWallType);
        const thickness = resolveWallThickness(wallModel, wallPreset);
        let thicknessUnits = thickness.thicknessUnits;
        if (!(thicknessUnits > 0)) {
            thicknessUnits = sheetMmToUnits(wallPreset.thickness * SHEET_MM_PER_METER);
        }
        let widthMeters = Number.isFinite(compModel.width) && compModel.width > 0 ? compModel.width : spec.widthMeters;
        if (!Number.isFinite(widthMeters) || widthMeters <= 0) {
            widthMeters = spec.widthMeters;
        }
        const widthSheetMm = widthMeters * SHEET_MM_PER_METER;
        const widthUnits = sheetMmToUnits(widthSheetMm);
        const strokeWidth = Math.max(sheetMmToUnits(0.35), 0.8);
        if (compModel.type === 'door') {
            const variant = normaliseDoorComponent(compModel);
            const widthMeters = Number.isFinite(compModel.width) && compModel.width > 0 ? compModel.width : variant.widthMeters;
            const widthUnits = sheetMmToUnits(widthMeters * SHEET_MM_PER_METER);
            if (!(widthUnits > 0)) return '';
            const stroke = spec.stroke || '#1A1D1A';
            const detailWidth = Math.max(sheetMmToUnits(0.3), 0.8);
            const leafThickness = Math.max(sheetMmToUnits(0.35), thicknessUnits * 0.45 || sheetMmToUnits(1.2));
            return renderDoorVariantMarkup(compModel, variant, { widthUnits, leafThickness, detailWidth, stroke });
        }
        const stroke = spec.stroke || '#2F7EBB';
        const fill = spec.fill || 'rgba(163,213,255,0.55)';
        const barHeight = Math.max(sheetMmToUnits(1.2), thicknessUnits * 0.6 || sheetMmToUnits(1.2));
        return `
            <rect x="${(-widthUnits / 2).toFixed(3)}" y="${(-barHeight / 2).toFixed(3)}" width="${widthUnits.toFixed(3)}" height="${barHeight.toFixed(3)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth.toFixed(3)}" vector-effect="non-scaling-stroke" rx="${sheetMmToUnits(0.5).toFixed(3)}" />
            <line x1="${(-widthUnits / 2).toFixed(3)}" y1="0" x2="${(widthUnits / 2).toFixed(3)}" y2="0" stroke="${stroke}" stroke-width="${strokeWidth.toFixed(3)}" vector-effect="non-scaling-stroke" />
        `;
    }
    function placeWallComponent(type, placement) {
        const wallEl = ensureWallElement(placement?.wallEl || (state.pendingComponentPlacement?.wallEl));
        const wallModel = getWallModel(wallEl);
        if (!wallEl || !wallModel) {
            utils.showToast('Не удалось определить стену для проёма');
            return null;
        }
        const el = document.createElementNS(SVG_NS, 'g');
        el.classList.add('wall-component');
        const id = `comp-${++state.componentCounter}`;
        el.dataset.id = id;
        el.dataset.type = type;
        el.dataset.wallId = wallModel.id;
        const spec = OPENING_SPECS[type] || OPENING_SPECS.door;
        let widthMeters = placement?.width;
        if (typeof widthMeters === 'string') {
            widthMeters = parseFloat(widthMeters.replace(/,/g, '.'));
        }
        widthMeters = Number.isFinite(widthMeters) ? widthMeters : spec.widthMeters;
        if (Number.isFinite(widthMeters) && widthMeters > 10) {
            widthMeters = widthMeters / getPixelsPerMeter();
        }
        if (!Number.isFinite(widthMeters) || widthMeters <= 0) {
            widthMeters = spec.widthMeters;
        }
        dom.wallComponentsContainer.appendChild(el);
        const distanceAlong = placement?.distance ?? state.pendingComponentPlacement?.distance ?? 0;
        const initialPoint = placement?.point || state.pendingComponentPlacement?.point;
        const initialAngle = placement?.angle ?? state.pendingComponentPlacement?.angle;
        if (initialPoint) {
            const ang = initialAngle ?? 0;
            el.setAttribute('transform', `translate(${initialPoint.x}, ${initialPoint.y}) rotate(${ang})`);
        }
        const compModel = { id, type, wallId: wallModel.id, distance: distanceAlong, offset: 0, width: widthMeters };
        if (type === 'door') {
            compModel.variant = state.doorDefaults.variant;
            compModel.hinge = state.doorDefaults.hinge;
            compModel.swing = state.doorDefaults.swing;
            if (Number.isFinite(state.doorDefaults.width) && state.doorDefaults.width > 0) {
                compModel.width = state.doorDefaults.width;
            }
            const variant = normaliseDoorComponent(compModel);
            compModel.width = Number.isFinite(compModel.width) && compModel.width > 0 ? compModel.width : variant.widthMeters;
            state.doorDefaults = {
                variant: compModel.variant,
                hinge: compModel.hinge,
                swing: compModel.swing,
                width: compModel.width
            };
        } else if (type === 'window') {
            if (!Number.isFinite(compModel.width) || compModel.width <= 0) {
                compModel.width = spec.widthMeters;
            }
        }
        el.innerHTML = renderWallComponentMarkup(compModel, wallModel);
        if (Number.isFinite(compModel.width)) {
            el.dataset.width = compModel.width.toFixed(3);
        }
        if (compModel.variant) el.dataset.variant = compModel.variant;
        if (compModel.hinge) el.dataset.hinge = compModel.hinge;
        if (compModel.swing) el.dataset.swing = compModel.swing;
        componentStore.set(el, compModel);
        componentIdMap.set(id, el);
        if (!Array.isArray(wallModel.components)) wallModel.components = [];
        wallModel.components.push(compModel);
        updateWallComponentsPosition(wallEl);
        commit('add_component');
        return el;
    }
    
    // --- GRID & GUIDES ---
    function snapSelectedToGrid(el, sizeToo = false) {
        const m = getModel(el);
        const { point } = snapSvgPoint({ x: m.x, y: m.y }, { preview: false });
        m.x = point.x;
        m.y = point.y;
        if (sizeToo) {
            const snappedW = snapValueToGrid(m.ow * m.sx);
            const snappedH = snapValueToGrid(m.oh * m.sy);
            if (Number.isFinite(snappedW) && m.ow) {
                m.sx = Math.max(0.1, snappedW / m.ow);
            }
            if (Number.isFinite(snappedH) && m.oh) {
                m.sy = Math.max(0.1, snappedH / m.oh);
            }
        }
        setModel(el, m);
    }
    function formatGridMeters(value) { return (Math.round(value * 1000) / 1000).toString(); }
    function ensureGridRect() {
        if (dom.gridRect && dom.gridRect.ownerSVGElement) {
            return dom.gridRect;
        }
        const rect = document.getElementById('grid-surface');
        dom.gridRect = rect;
        return rect;
    }
    function ensureGridLines() {
        if (!dom.gridLinesGroup || !dom.gridLinesGroup.ownerSVGElement) {
            const layer = document.getElementById('grid-layer');
            if (!layer) return null;
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.id = 'grid-lines';
            group.setAttribute('pointer-events', 'none');
            layer.appendChild(group);
            dom.gridLinesGroup = group;
            gridRenderState.minorPath = null;
            gridRenderState.majorPath = null;
        }
        const group = dom.gridLinesGroup;
        if (!gridRenderState.minorPath || gridRenderState.minorPath.parentNode !== group) {
            const minor = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            minor.dataset.role = 'grid-minor';
            minor.setAttribute('fill', 'none');
            minor.setAttribute('stroke', '#e7ebf2');
            minor.setAttribute('stroke-width', '0.6');
            minor.setAttribute('vector-effect', 'non-scaling-stroke');
            minor.setAttribute('shape-rendering', 'crispEdges');
            group.appendChild(minor);
            gridRenderState.minorPath = minor;
        }
        if (!gridRenderState.majorPath || gridRenderState.majorPath.parentNode !== group) {
            const major = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            major.dataset.role = 'grid-major';
            major.setAttribute('fill', 'none');
            major.setAttribute('stroke', '#c7d0dd');
            major.setAttribute('stroke-width', '1.1');
            major.setAttribute('vector-effect', 'non-scaling-stroke');
            major.setAttribute('shape-rendering', 'crispEdges');
            group.appendChild(major);
            gridRenderState.majorPath = major;
        }
        return group;
    }
    function roundTo(value, digits = 3) {
        const factor = 10 ** digits;
        return Math.round(value * factor) / factor;
    }
    function renderGridLines() {
        const view = state.viewBox;
        const step = state.gridSize;
        if (!view || !Number.isFinite(step) || step <= 0) return;
        const group = ensureGridLines();
        if (!group || !gridRenderState.minorPath || !gridRenderState.majorPath) return;

        const margin = Math.max(step * 4, Math.min(view.width, view.height) * 0.25);
        const startCol = Math.floor((view.x - margin) / step);
        const endCol = Math.ceil((view.x + view.width + margin) / step);
        const startRow = Math.floor((view.y - margin) / step);
        const endRow = Math.ceil((view.y + view.height + margin) / step);

        const x0 = roundTo(view.x - margin, 3);
        const x1 = roundTo(view.x + view.width + margin, 3);
        const y0 = roundTo(view.y - margin, 3);
        const y1 = roundTo(view.y + view.height + margin, 3);

        let minorSegments = '';
        let majorSegments = '';

        const baseMajorStride = Math.max(1, Math.round(gridRenderState.majorStrideBase || 1));
        const displayScale = getSvgDisplayScale();
        const stepPx = Number.isFinite(displayScale) ? step * displayScale : null;
        const MIN_MAJOR_PX = 60;
        const MAX_MAJOR_PX = 220;
        const TARGET_MAJOR_PX = (MIN_MAJOR_PX + MAX_MAJOR_PX) / 2;
        const MIN_MINOR_PX = 14;
        const MAX_MINOR_PX = 80;
        const TARGET_MINOR_PX = 28;

        let majorStride = baseMajorStride;
        let minorEvery = 1;

        if (Number.isFinite(stepPx) && stepPx > 0) {
            const candidateSet = new Set([baseMajorStride]);
            const multipliers = [2, 3, 4, 5, 10, 20, 50, 100];
            multipliers.forEach(mult => candidateSet.add(baseMajorStride * mult));
            const divisors = [2, 4, 5, 10];
            divisors.forEach(div => {
                if (baseMajorStride % div === 0) {
                    candidateSet.add(Math.max(1, Math.round(baseMajorStride / div)));
                }
            });

            const candidates = Array.from(candidateSet)
                .filter(v => Number.isFinite(v) && v >= 1 && v <= 5000)
                .sort((a, b) => a - b);

            let bestMajorScore = Number.POSITIVE_INFINITY;
            let fallbackMajor = majorStride;
            let fallbackDelta = Number.POSITIVE_INFINITY;

            candidates.forEach(candidate => {
                const spacing = stepPx * candidate;
                if (!Number.isFinite(spacing)) return;
                const delta = Math.abs(spacing - TARGET_MAJOR_PX);
                if (spacing >= MIN_MAJOR_PX && spacing <= MAX_MAJOR_PX) {
                    if (delta < bestMajorScore) {
                        bestMajorScore = delta;
                        majorStride = candidate;
                    }
                }
                const rangeDelta = spacing < MIN_MAJOR_PX
                    ? MIN_MAJOR_PX - spacing
                    : spacing > MAX_MAJOR_PX
                        ? spacing - MAX_MAJOR_PX
                        : 0;
                if (rangeDelta < fallbackDelta) {
                    fallbackDelta = rangeDelta;
                    fallbackMajor = candidate;
                }
            });

            if (bestMajorScore === Number.POSITIVE_INFINITY) {
                majorStride = fallbackMajor;
            }

            const minorCandidates = [];
            for (let d = 1; d <= majorStride; d++) {
                if (majorStride % d === 0) {
                    minorCandidates.push(d);
                }
            }
            let bestMinorScore = Number.POSITIVE_INFINITY;
            let fallbackMinor = minorEvery;
            let fallbackMinorDelta = Number.POSITIVE_INFINITY;

            minorCandidates.forEach(candidate => {
                const spacing = stepPx * candidate;
                if (!Number.isFinite(spacing)) return;
                const delta = Math.abs(spacing - TARGET_MINOR_PX);
                if (spacing >= MIN_MINOR_PX && spacing <= MAX_MINOR_PX) {
                    if (delta < bestMinorScore) {
                        bestMinorScore = delta;
                        minorEvery = candidate;
                    }
                }
                const rangeDelta = spacing < MIN_MINOR_PX
                    ? MIN_MINOR_PX - spacing
                    : spacing > MAX_MINOR_PX
                        ? spacing - MAX_MINOR_PX
                        : 0;
                if (rangeDelta < fallbackMinorDelta) {
                    fallbackMinorDelta = rangeDelta;
                    fallbackMinor = candidate;
                }
            });

            if (bestMinorScore === Number.POSITIVE_INFINITY) {
                minorEvery = fallbackMinor;
            }
        }

        for (let col = startCol; col <= endCol; col++) {
            const x = roundTo(col * step, 3);
            const majorHit = ((col % majorStride) + majorStride) % majorStride === 0;
            const minorHit = !majorHit && ((col % minorEvery) + minorEvery) % minorEvery === 0;
            if (!majorHit && !minorHit) continue;
            const segment = `M ${x} ${y0} V ${y1}`;
            if (majorHit) {
                majorSegments += segment;
            } else {
                minorSegments += segment;
            }
        }
        for (let row = startRow; row <= endRow; row++) {
            const y = roundTo(row * step, 3);
            const majorHit = ((row % majorStride) + majorStride) % majorStride === 0;
            const minorHit = !majorHit && ((row % minorEvery) + minorEvery) % minorEvery === 0;
            if (!majorHit && !minorHit) continue;
            const segment = `M ${x0} ${y} H ${x1}`;
            if (majorHit) {
                majorSegments += segment;
            } else {
                minorSegments += segment;
            }
        }

        gridRenderState.minorPath.setAttribute('d', minorSegments || 'M 0 0');
        gridRenderState.majorPath.setAttribute('d', majorSegments || 'M 0 0');
    }
    function updateGridMajorStride() {
        const meters = Number.isFinite(state.gridStepMeters) && state.gridStepMeters > 0
            ? state.gridStepMeters
            : CONST.GRID;
        const stride = Math.max(1, Math.round(1 / meters));
        gridRenderState.majorStrideBase = Math.min(500, stride);
    }
    function updateGridViewport() {
        if (!state.viewBox) return;
        const rect = ensureGridRect();
        if (rect) {
            const { x, y, width, height } = state.viewBox;
            const padding = Math.max(state.gridSize || 0, Math.min(width, height) * 0.1);
            rect.setAttribute('x', roundTo(x - padding, 3).toString());
            rect.setAttribute('y', roundTo(y - padding, 3).toString());
            rect.setAttribute('width', roundTo(width + padding * 2, 3).toString());
            rect.setAttribute('height', roundTo(height + padding * 2, 3).toString());
        }
        renderGridLines();
    }

    function updateFloorBackground() {
        if (!state.viewBox || !dom.floorBackground) return;
        const { x, y, width, height } = state.viewBox;
        dom.floorBackground.setAttribute('x', roundTo(x, 3));
        dom.floorBackground.setAttribute('y', roundTo(y, 3));
        dom.floorBackground.setAttribute('width', roundTo(width, 3));
        dom.floorBackground.setAttribute('height', roundTo(height, 3));
    }

    function updateFloorUnderlay() {
        if (!state.viewBox || !dom.floorUnderlay) return;
        const { x, y, width, height } = state.viewBox;
        const margin = Math.max(state.gridSize || 0, Math.min(width, height) * 0.15);
        dom.floorUnderlay.setAttribute('x', roundTo(x - margin, 3));
        dom.floorUnderlay.setAttribute('y', roundTo(y - margin, 3));
        dom.floorUnderlay.setAttribute('width', roundTo(width + margin * 2, 3));
        dom.floorUnderlay.setAttribute('height', roundTo(height + margin * 2, 3));
    }
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
        updateGridViewport();
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
            fallbackMeters = Number.isFinite(derived) && derived > 0 ? derived : CONST.GRID;
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

        updateGridMajorStride();

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
        updateFloorBackground();
        updateGridViewport();
        updateFloorUnderlay();
        refreshWallStrokeWidths();
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
    const measurementRenderState = {
        staticGroup: null,
        previewGroup: null,
        previewLine: null,
        previewText: null,
        entries: new Map(),
    };

    function resetMeasurementPreview() {
        state.measurePoints = [];
        renderMeasurementOverlay();
        clearSnapMarkers();
    }
    function ensureMeasurementGroups() {
        const layer = dom.measurementLayer;
        if (!layer) return null;
        if (!measurementRenderState.staticGroup || measurementRenderState.staticGroup.parentNode !== layer) {
            measurementRenderState.staticGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            measurementRenderState.staticGroup.dataset.role = 'measurement-static';
            layer.appendChild(measurementRenderState.staticGroup);
        }
        if (!measurementRenderState.previewGroup || measurementRenderState.previewGroup.parentNode !== layer) {
            measurementRenderState.previewGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            measurementRenderState.previewGroup.dataset.role = 'measurement-preview';
            layer.appendChild(measurementRenderState.previewGroup);
            measurementRenderState.previewLine = null;
            measurementRenderState.previewText = null;
        }
        if (!measurementRenderState.previewLine) {
            measurementRenderState.previewLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            measurementRenderState.previewLine.setAttribute('stroke-dasharray', '6 4');
            measurementRenderState.previewLine.setAttribute('opacity', '0');
            measurementRenderState.previewLine.setAttribute('marker-start', 'url(#dim-arrow)');
            measurementRenderState.previewLine.setAttribute('marker-end', 'url(#dim-arrow)');
            measurementRenderState.previewGroup.appendChild(measurementRenderState.previewLine);
        }
        if (!measurementRenderState.previewText) {
            measurementRenderState.previewText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            measurementRenderState.previewText.setAttribute('opacity', '0');
            measurementRenderState.previewText.setAttribute('paint-order', 'stroke');
            measurementRenderState.previewText.setAttribute('stroke', 'white');
            measurementRenderState.previewText.setAttribute('stroke-width', '0.5');
            measurementRenderState.previewText.setAttribute('font-size', '14');
            measurementRenderState.previewText.setAttribute('font-weight', 'bold');
            measurementRenderState.previewGroup.appendChild(measurementRenderState.previewText);
        }
        return layer;
    }

    function updateMeasurementGraphics(line, text, measurement, pixelsPerMeter, isPreview = false) {
        const p0 = measurement.p0;
        const p1 = measurement.p1;
        line.setAttribute('x1', p0.x);
        line.setAttribute('y1', p0.y);
        line.setAttribute('x2', p1.x);
        line.setAttribute('y2', p1.y);
        if (isPreview) {
            line.setAttribute('stroke-dasharray', '6 4');
            line.setAttribute('opacity', '0.7');
        } else {
            line.removeAttribute('stroke-dasharray');
            line.setAttribute('opacity', '1');
        }
        const dist = distance(p0, p1);
        const meters = measurement.meters ?? (dist / pixelsPerMeter);
        const angleDeg = Math.round((measurement.angle ?? ((Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI) + 360)) % 360);
        const midx = (p0.x + p1.x) / 2;
        const midy = (p0.y + p1.y) / 2;
        text.setAttribute('x', midx + 4);
        text.setAttribute('y', midy - 4);
        text.textContent = `${meters.toFixed(2)} м • ${angleDeg}°`;
        if (isPreview) {
            text.setAttribute('opacity', '0.6');
        } else {
            text.removeAttribute('opacity');
        }
    }

    function renderMeasurementOverlay(preview) {
        const layer = ensureMeasurementGroups();
        if (!layer) return;
        const pixelsPerMeter = state.pixelsPerMeter || state.gridSize || 1;
        const active = new Set();

        state.measurements.forEach(measurement => {
            let entry = measurementRenderState.entries.get(measurement.id);
            if (!entry) {
                const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('marker-start', 'url(#dim-arrow)');
                line.setAttribute('marker-end', 'url(#dim-arrow)');
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('paint-order', 'stroke');
                text.setAttribute('stroke', 'white');
                text.setAttribute('stroke-width', '0.5');
                text.setAttribute('font-size', '14');
                text.setAttribute('font-weight', 'bold');
                group.appendChild(line);
                group.appendChild(text);
                measurementRenderState.staticGroup.appendChild(group);
                entry = { group, line, text };
                measurementRenderState.entries.set(measurement.id, entry);
            }
            updateMeasurementGraphics(entry.line, entry.text, measurement, pixelsPerMeter, false);
            active.add(measurement.id);
        });

        Array.from(measurementRenderState.entries.keys()).forEach(id => {
            if (!active.has(id)) {
                const entry = measurementRenderState.entries.get(id);
                entry?.group.remove();
                measurementRenderState.entries.delete(id);
            }
        });

        if (preview && preview.p0 && preview.p1) {
            updateMeasurementGraphics(measurementRenderState.previewLine, measurementRenderState.previewText, preview, pixelsPerMeter, true);
            measurementRenderState.previewLine.setAttribute('display', '');
            measurementRenderState.previewText.setAttribute('display', '');
        } else {
            if (measurementRenderState.previewLine) measurementRenderState.previewLine.setAttribute('display', 'none');
            if (measurementRenderState.previewText) measurementRenderState.previewText.setAttribute('display', 'none');
        }
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
        clearSnapMarkers();
        commit('measure_add');
    }
    function removeMeasurement(id) {
        const idx = state.measurements.findIndex(m => m.id === id);
        if (idx >= 0) {
            state.measurements.splice(idx, 1);
            renderMeasurementOverlay();
            renderMeasurementTable();
            clearSnapMarkers();
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
        clearSnapMarkers();
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
                } catch {
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
        } catch (_err) {
            console.error(_err);
            utils.showToast('Ошибка анализа: ' + _err.message, 5000);
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
    function hasLayoutContent() {
        const hasObjects = !!dom.itemsContainer?.querySelector('.layout-object');
        const hasWalls = (dom.wallsContainer?.childElementCount || 0) > 0;
        const hasComponents = (dom.wallComponentsContainer?.childElementCount || 0) > 0;
        const hasPreviews = (dom.previewsContainer?.childElementCount || 0) > 0;
        const hasMeasurements = Array.isArray(state.measurements) && state.measurements.length > 0;
        const hasMeasureDraft = Array.isArray(state.measurePoints) && state.measurePoints.length > 0;
        return hasObjects || hasWalls || hasComponents || hasPreviews || hasMeasurements || hasMeasureDraft;
    }
    function clearHost(confirmPrompt = true) {
        if (!hasLayoutContent()) {
            return false;
        }
        const message = 'Очистить текущий план? Все стены, объекты, проёмы и измерения будут удалены.';
        if (confirmPrompt && !window.confirm(message)) {
            return false;
        }

        state.currentWallPoints = [];
        if (dom.wallPreview) {
            dom.wallPreview.setAttribute('points', '');
        }
        dom.previewsContainer.innerHTML = '';
        hideWallLengthPreview();
        state.measurePoints = [];

        restore({ items: [], walls: [], components: [], measurements: [] });
        resetMeasurementPreview();
        if (dom.ctx) {
            dom.ctx.style.display = 'none';
        }
        commit('clear_host');
        utils.showToast('План очищен');
        return true;
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
                createLayoutObject(obj.tpl, obj.x, obj.y);
                // По умолчанию createLayoutObject уже commit-ит добавление
            });
            updateLayersList();
            commit('template');
            utils.showToast('Шаблон загружен');
        } catch (_err) {
            console.error(_err);
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
        } catch (_err) {
            console.error(_err);
            utils.showToast('Ошибка экспорта CSV');
        }
    }

    // --- HISTORY (UNDO/REDO) ---
    function snapshot() {
        return {
            view: { mode: state.renderMode },
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
                offset: comp.offset || 0,
                width: comp.width,
                variant: comp.type === 'door' ? comp.variant : undefined,
                hinge: comp.type === 'door' ? comp.hinge : undefined,
                swing: comp.type === 'door' ? comp.swing : undefined
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

        setRenderMode(data?.view?.mode, { rerender: false });

        Array.from(dom.itemsContainer.children).slice().forEach(n => {
            if (n.classList.contains('layout-object')) {
                interact(n).unset();
                n.remove();
            }
        });

        wallMaskMap.forEach(entry => entry.mask.remove());
        wallMaskMap.clear();
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
            state.gridStepMeters = CONST.GRID;
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
            const tplId = resolveTemplateId(m.tpl);
            const el = createLayoutObject(tplId, m.x, m.y);
            const baseModel = getModel(el);
            const originalWidth = Number.isFinite(m.ow) && m.ow > 0 ? m.ow : baseModel.ow;
            const originalHeight = Number.isFinite(m.oh) && m.oh > 0 ? m.oh : baseModel.oh;
            const scaleX = Number.isFinite(m.sx) && m.sx ? m.sx : 1;
            const scaleY = Number.isFinite(m.sy) && m.sy ? m.sy : 1;
            const actualWidth = (originalWidth || baseModel.ow || 1) * scaleX;
            const actualHeight = (originalHeight || baseModel.oh || 1) * scaleY;
            const ow = baseModel.ow || originalWidth || 1;
            const oh = baseModel.oh || originalHeight || 1;
            const nextModel = {
                ...m,
                tpl: tplId,
                ow,
                oh,
                cx: baseModel.cx,
                cy: baseModel.cy,
                sx: ow ? actualWidth / ow : 1,
                sy: oh ? actualHeight / oh : 1
            };
            setModel(el, nextModel);
            el.style.display = nextModel.visible === false ? 'none' : '';
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
                if (compModel.type === 'door') {
                    compModel.variant = compModel.variant || 'single';
                    compModel.hinge = compModel.hinge || 'left';
                    compModel.swing = compModel.swing || 'in';
                    normaliseDoorComponent(compModel);
                }
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
            const compEl = placeWallComponent(c.type, { wallEl, distance: c.distance || 0, width: c.width });
            const compModel = componentStore.get(compEl);
            if (!compModel) return;
            const originalId = compModel.id;
            if (c.id) {
                compModel.id = c.id;
                compEl.dataset.id = c.id;
            }
            compModel.offset = c.offset || 0;
            const wallModel = getWallModel(wallEl);
            if (compModel.type === 'door') {
                if (typeof c.variant === 'string') compModel.variant = c.variant;
                if (typeof c.hinge === 'string') compModel.hinge = c.hinge;
                if (typeof c.swing === 'string') compModel.swing = c.swing;
                const variant = normaliseDoorComponent(compModel);
                if (Number.isFinite(c.width) && c.width > 0) {
                    let widthMeters = c.width;
                    if (widthMeters > 10) {
                        widthMeters = widthMeters / getPixelsPerMeter();
                    }
                    compModel.width = widthMeters;
                } else if (!Number.isFinite(compModel.width) || compModel.width <= 0) {
                    compModel.width = variant.widthMeters;
                }
                compEl.dataset.variant = compModel.variant;
                compEl.dataset.hinge = compModel.hinge;
                compEl.dataset.swing = compModel.swing;
            } else if (Number.isFinite(c.width) && c.width > 0) {
                let widthMeters = c.width;
                if (widthMeters > 10) {
                    widthMeters = widthMeters / getPixelsPerMeter();
                }
                compModel.width = widthMeters;
            }
            if (Number.isFinite(compModel.width)) {
                compEl.dataset.width = compModel.width.toFixed(3);
                if (wallModel) {
                    compEl.innerHTML = renderWallComponentMarkup(compModel, wallModel);
                }
            }
            componentStore.set(compEl, compModel);
            if (originalId && originalId !== compModel.id) {
                componentIdMap.delete(originalId);
            }
            componentIdMap.set(compModel.id, compEl);
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
        refreshWallStrokeWidths();
        analysisLayout({ silent: true });
    }
    function commit(reason) { if (state.history.lock) return; const snap = snapshot(); state.history.stack = state.history.stack.slice(0, state.history.idx + 1); state.history.stack.push(snap); state.history.idx++; localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snap)); if (reason !== 'add_wall') { updateLayersList(); } }
    function undo() { if (state.history.idx > 0) { state.history.idx--; restore(state.history.stack[state.history.idx]); } }
    function redo() { if (state.history.idx < state.history.stack.length - 1) { state.history.idx++; restore(state.history.stack[state.history.idx]); } }
    
    // --- EVENT HANDLERS ---
    function onLayersClick(e) { const li = e.target.closest('li'); if (!li) return; const id = li.dataset.id; const el = dom.itemsContainer.querySelector(`[data-id="${id}"]`); if (!el) return; const model = getModel(el); if (e.target.classList.contains('layer-vis')) { model.visible = !model.visible; el.style.display = model.visible ? '' : 'none'; setModel(el, model); commit('visibility'); } else if (e.target.classList.contains('layer-lock')) { model.locked = !model.locked; setModel(el, model); commit('lock'); } else { if (model.locked) { utils.showToast('Объект заблокирован'); return; } selectObject(el); } }
    function handleKeyDown(e) {
        if (e.key === 'Alt') {
            state.isAltDown = true;
            clearSnapMarkers();
        }

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
            if (matchesKey(e, 'v')) { toggleTool('pointer'); e.preventDefault(); return; }
            if (matchesKey(e, 'w')) { toggleTool('wall'); e.preventDefault(); return; }
            if (matchesKey(e, 'd')) { toggleTool('door'); e.preventDefault(); return; }
            if (matchesKey(e, 'o')) { toggleTool('window'); e.preventDefault(); return; }
            if (matchesKey(e, 'm')) { toggleTool('measure'); e.preventDefault(); return; }
        }

        // Обработка сочетаний с Ctrl/Meta
        if (e.ctrlKey || e.metaKey) {
            if (matchesKey(e, 'z')) {
                e.preventDefault();
                undo();
                return;
            }
            if (matchesKey(e, 'y')) {
                e.preventDefault();
                redo();
                return;
            }
            if (matchesKey(e, 'd')) {
                e.preventDefault();
                if (state.selectedObject) duplicateObject(state.selectedObject);
                return;
            }
            if (matchesKey(e, 'c')) {
                if (state.selectedObject) {
                    sessionStorage.setItem('clipboard-layout', JSON.stringify(getModel(state.selectedObject)));
                    utils.showToast('Скопировано');
                }
                return;
            }
            if (matchesKey(e, 'v')) {
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
                } catch { /* ignore clipboard parse errors */ }
                return;
            }
        }

        // Фокусировка на выбранном объекте по клавише F
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            if (matchesKey(e, 'f')) {
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
        if (matchesKey(e, 'r')) {
            model.a = (model.a + 90) % 360;
            setModel(state.selectedObject, model);
            commit('rotate90');
        } else if (matchesKey(e, 'f')) {
            dom.itemsContainer.appendChild(state.selectedObject);
            commit('front');
        } else if (matchesKey(e, 'b')) {
            dom.itemsContainer.prepend(state.selectedObject);
            commit('back');
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
        if (e.key === 'Alt') {
            state.isAltDown = false;
            clearSnapMarkers();
        }
        if (state.selectedObject && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            snapSelectedToGrid(state.selectedObject);
            commit('nudge');
        }
    }

    function bindEventListeners() {
        dom.componentType?.addEventListener('change', e => applyComponentType(e.target.value));
        if (dom.componentWidth) {
            dom.componentWidth.addEventListener('change', handleComponentWidthChange);
            dom.componentWidth.addEventListener('blur', handleComponentWidthChange);
        }
        dom.componentHingeLeft?.addEventListener('change', () => { if (dom.componentHingeLeft.checked) applyComponentHinge('left'); });
        dom.componentHingeRight?.addEventListener('change', () => { if (dom.componentHingeRight.checked) applyComponentHinge('right'); });
        dom.componentSwingIn?.addEventListener('change', () => { if (dom.componentSwingIn.checked) applyComponentSwing('in'); });
        dom.componentSwingOut?.addEventListener('change', () => { if (dom.componentSwingOut.checked) applyComponentSwing('out'); });
        dom.svg.addEventListener('mousedown', e => {
            // Завершение стены ПКМ
            if (e.button === 2) {
                e.preventDefault();
                if (state.activeTool === 'wall') finishCurrentWall();
                return;
            }

            // Панорамирование средней кнопкой или пробелом
            if ((e.button === 1 || state.isSpaceDown) && state.activeTool === 'pointer') {
                clearSnapMarkers();
                startPan(e);
                return;
            }

            // Измерительный инструмент
            if (state.activeTool === 'measure') {
                const p = utils.toSVGPoint(e.clientX, e.clientY);
                const { point: snapped } = snapSvgPoint(p, { altKey: e.altKey });
                if (state.measurePoints.length === 0) {
                    state.measurePoints.push(snapped);
                    renderMeasurementOverlay();
                } else if (state.measurePoints.length === 1) {
                    const start = state.measurePoints[0];
                    addMeasurement(start, snapped);
                    state.measurePoints = [];
                }
                return;
            }

            // Рисование стены
            if (state.activeTool === 'wall') {
                const p = utils.toSVGPoint(e.clientX, e.clientY);
                const { point: snappedP } = snapSvgPoint(p, { altKey: e.altKey });
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
                        clearSnapMarkers();
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
        dom.svg.addEventListener('dblclick', e => {
            if (state.activeTool !== 'wall') return;
            e.preventDefault();
            e.stopPropagation();
            if (!Array.isArray(state.currentWallPoints) || state.currentWallPoints.length === 0) return;
            const p = utils.toSVGPoint(e.clientX, e.clientY);
            const { point: snappedP } = snapSvgPoint(p, { altKey: e.altKey });
            const last = state.currentWallPoints[state.currentWallPoints.length - 1];
            const mergeThreshold = Math.max(1e-3, (state.gridSize || 0) * 0.002);
            if (!last || distance(last, snappedP) > mergeThreshold) {
                state.currentWallPoints.push(snappedP);
            }
            finishCurrentWall();
        });
        dom.svg.addEventListener('mousemove', utils.rafThrottle(e => {
            const tool = state.activeTool;
            const p = utils.toSVGPoint(e.clientX, e.clientY);
            // Обновление превью стены и длины сегмента
            if (tool === 'wall') {
                if (state.currentWallPoints.length > 0) {
                    const { point: snappedP } = snapSvgPoint(p, { altKey: e.altKey });
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
                    const previewModel = tool === 'door'
                        ? {
                            type: 'door',
                            variant: state.doorDefaults.variant,
                            hinge: state.doorDefaults.hinge,
                            swing: state.doorDefaults.swing,
                            width: Number.isFinite(state.doorDefaults.width) && state.doorDefaults.width > 0
                                ? state.doorDefaults.width
                                : getDoorVariant(state.doorDefaults.variant).widthMeters
                        }
                        : { type: 'window', width: OPENING_SPECS.window.widthMeters };
                    const wallModel = getWallModel(closest.wallEl);
                    el.innerHTML = renderWallComponentMarkup(previewModel, wallModel);
                    el.setAttribute('transform', `translate(${closest.point.x}, ${closest.point.y}) rotate(${closest.angle})`);
                    dom.previewsContainer.appendChild(el);
                    state.pendingComponentPlacement = closest;
                }
            }
            // Динамическое измерение: если одна точка выбрана, рисуем линию к курсору
            else if (tool === 'measure' && state.measurePoints.length === 1) {
                hideWallLengthPreview();
                const p0 = state.measurePoints[0];
                const { point: snappedP } = snapSvgPoint(p, { altKey: e.altKey });
                const preview = {
                    p0,
                    p1: snappedP,
                    meters: distance(p0, snappedP) / (state.pixelsPerMeter || state.gridSize || 1),
                    angle: (Math.atan2(snappedP.y - p0.y, snappedP.x - p0.x) * 180 / Math.PI + 360) % 360
                };
                renderMeasurementOverlay(preview);
            } else {
                hideWallLengthPreview();
                clearSnapMarkers();
            }
        }));
        dom.svg.addEventListener('mouseleave', () => {
            hideWallLengthPreview();
            clearSnapMarkers();
        });
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
        window.addEventListener('resize', utils.rafThrottle(refreshWallStrokeWidths));
        window.addEventListener('blur', () => {
            state.isSpaceDown = false;
            state.isShiftHeld = false;
            state.isAltDown = false;
            clearSnapMarkers();
            endPan();
        });
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
        dom.fileImport.addEventListener('change', e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const data = JSON.parse(r.result); restore(data); commit('import'); utils.showToast('План импортирован'); } catch { utils.showToast('Ошибка импорта'); } }; r.readAsText(f); });
        dom.renderModeToggle?.addEventListener('click', () => {
            const next = state.renderMode === 'schematic' ? 'rich' : 'schematic';
            setRenderMode(next);
        });

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

        if (dom.btnClearHost) {
            dom.btnClearHost.addEventListener('click', () => {
                if (!hasLayoutContent()) {
                    utils.showToast('План уже пуст');
                    dom.btnClearHost.blur();
                    return;
                }
                try {
                    clearHost();
                } catch (_err) {
                    console.error('Не удалось очистить план', _err);
                    utils.showToast('Не удалось очистить план');
                } finally {
                    dom.btnClearHost.blur();
                }
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
        buildSymbolsFromSchematic();
        setRenderMode(state.renderMode, { rerender: false });

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
        interact(dom.svg).dropzone({ accept: '.draggable-item', listeners: { drop(e) { const tpl = e.relatedTarget.dataset.template; const viewBox = dom.svg.viewBox.baseVal; const centerX = viewBox.x + viewBox.width / 2; const centerY = viewBox.y + viewBox.height / 2; const obj = createLayoutObject(tpl, centerX, centerY); selectObject(obj); }, dragenter: e => e.target.style.outline = '2px dashed var(--ui-accent)', dragleave: e => e.target.style.outline = 'none', dropdeactivate: e => e.target.style.outline = 'none' } });
        interact(dom.trash).dropzone({ accept: '.layout-object', ondragenter: e => e.target.classList.add('drag-enter'), ondragleave: e => e.target.classList.remove('drag-enter'), ondrop: e => { deleteObject(e.relatedTarget); e.target.classList.remove('drag-enter'); } });
        
        // Bind all event listeners
        bindEventListeners();

        attachPanelIcons(document);

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

        updateFloorBackground();
        updateFloorUnderlay();
        updateGridViewport();
        refreshWallStrokeWidths();

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

    if (typeof window !== 'undefined') {
        window.setRenderMode = (mode, options) => setRenderMode(mode, options);
        window.getRenderMode = () => state.renderMode;
        window.buildSchematicSymbols = () => { buildSymbolsFromSchematic(); return state.renderMode; };
    }

    init();
})();

