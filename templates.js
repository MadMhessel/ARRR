const FURNITURE_CATEGORIES = [
    {
        name: 'Кофейня',
        items: [
            { id: 'cafe-table-round-60', label: 'Стол круглый Ø60' },
            { id: 'cafe-table-square-70', label: 'Стол квадрат 70×70' },
            { id: 'cafe-hightop-round-70', label: 'Хай-топ Ø70' },
            { id: 'cafe-communal-240', label: 'Коммунальный 240×90' },
            { id: 'banquette-160', label: 'Банкетка 160 (3 места)' },
            { id: 'banquette-220', label: 'Банкетка 220 (4 места)' },
            { id: 'booth-2', label: 'Кабинка на 2' },
            { id: 'booth-4', label: 'Кабинка на 4' },
            { id: 'bar-counter-straight-180', label: 'Барная стойка 180' },
            { id: 'bar-counter-straight-240', label: 'Барная стойка 240' },
            { id: 'bar-counter-l-180x180', label: 'Барная стойка Г 180×180' },
            { id: 'bar-counter-island-180x90', label: 'Бар-остров 180×90' },
            { id: 'bar-back-shelf-180', label: 'Задняя барная полка 180' },
            { id: 'espresso-2g', label: 'Эспрессо-машина 2 группы' },
            { id: 'espresso-3g', label: 'Эспрессо-машина 3 группы' },
            { id: 'grinder-80mm', label: 'Кофемолка 80 мм' },
            { id: 'batch-brewer-2', label: 'Бэтч-брю (2 станции)' },
            { id: 'pour-over-3', label: 'Пуровер-станция ×3' },
            { id: 'kettle-electric', label: 'Электрочайник' },
            { id: 'water-filter', label: 'Фильтр воды под мойкой' },
            { id: 'ice-machine-60', label: 'Льдогенератор 60' },
            { id: 'undercounter-fridge-90', label: 'Холод под столеш. 90' },
            { id: 'upright-fridge-60', label: 'Холодильник 60' },
            { id: 'milk-fridge-60', label: 'Молочный холодильник 60' },
            { id: 'freezer-60', label: 'Морозильник 60' },
            { id: 'pastry-case-120', label: 'Витрина кондит. прямая 120' },
            { id: 'pastry-case-120-curved', label: 'Витрина кондит. радиус 120' },
            { id: 'pos-terminal', label: 'POS-терминал' },
            { id: 'cash-drawer', label: 'Денежный ящик' },
            { id: 'condiment-120', label: 'Станция приправ 120' },
            { id: 'syrup-rack-90', label: 'Рейл сиропов 90' },
            { id: 'trash-single', label: 'Урна одинарная' },
            { id: 'trash-double', label: 'Урна двойная' },
            { id: 'hand-sink', label: 'Раковина для рук' },
            { id: 'triple-sink', label: 'Мойка 3-секц.' },
            { id: 'dishwasher-pro', label: 'Посудомойка подстол.' },
            { id: 'drying-rack-120', label: 'Сушка посуды 120' },
            { id: 'queue-post', label: 'Стойка очереди' },
            { id: 'menu-board-120', label: 'Меню-борд 120' },
            { id: 'planter-long-120', label: 'Кашпо длинное 120' },
            { id: 'partition-120x10', label: 'Перегородка 120×10' },
        ]
    },
    {
        name: 'Сиденья',
        items: [
            { id: 'chair', label: 'Стул' },
            { id: 'armchair', label: 'Кресло' },
            { id: 'sofa-2', label: 'Диван 2-местный' },
            { id: 'sofa-3', label: 'Диван 3-местный' },
            { id: 'sectional-l', label: 'Диван угловой L' },
            { id: 'stool', label: 'Табурет' },
            { id: 'barstool', label: 'Барный стул' },
        ]
    },
    {
        name: 'Столы',
        items: [
            { id: 'coffee-round', label: 'Журнальный круглый' },
            { id: 'coffee-rect', label: 'Журнальный прямой' },
            { id: 'dining-4', label: 'Обеденный на 4' },
            { id: 'dining-6', label: 'Обеденный на 6' },
            { id: 'dining-8', label: 'Обеденный на 8' },
            { id: 'desk', label: 'Письменный стол' },
            { id: 'workstation-l', label: 'Рабочая L-станция' },
        ]
    },
    {
        name: 'Офис',
        items: [
            { id: 'office-chair', label: 'Офисное кресло' },
            { id: 'reception', label: 'Стойка-ресепшн' },
            { id: 'whiteboard', label: 'Доска' },
            { id: 'printer', label: 'Принтер' },
            { id: 'copier', label: 'Ксерокс' },
            { id: 'server-rack', label: 'Серверная стойка' },
        ]
    },
    {
        name: 'Спальня',
        items: [
            { id: 'bed-single', label: 'Кровать односпальная' },
            { id: 'bed-double', label: 'Кровать двуспальная' },
            { id: 'nightstand', label: 'Тумба' },
            { id: 'wardrobe-2d', label: 'Шкаф 2-створчатый' },
            { id: 'wardrobe-3d', label: 'Шкаф 3-створчатый' },
            { id: 'shelving', label: 'Стеллаж' },
        ]
    },
    {
        name: 'Кухня',
        items: [
            { id: 'kitchen-line', label: 'Кухонный модуль' },
            { id: 'sink', label: 'Мойка' },
            { id: 'cooktop-4', label: 'Варочная панель' },
            { id: 'fridge', label: 'Холодильник' },
            { id: 'oven', label: 'Духовка' },
            { id: 'microwave', label: 'Микроволновка' },
            { id: 'dishwasher', label: 'Посудомойка' },
            { id: 'island', label: 'Кухонный остров' },
        ]
    },
    {
        name: 'Санузел',
        items: [
            { id: 'toilet', label: 'Туалет' },
            { id: 'bath-sink', label: 'Раковина' },
            { id: 'shower', label: 'Душ' },
            { id: 'bathtub', label: 'Ванна' },
            { id: 'washer', label: 'Стиральная машина' },
            { id: 'dryer', label: 'Сушильная машина' },
            { id: 'water-cooler', label: 'Кулер для воды' },
        ]
    },
    {
        name: 'Техника и AV',
        items: [
            { id: 'tv-stand', label: 'ТВ-тумба' },
            { id: 'tv-wall', label: 'ТВ настенный' },
            { id: 'projector', label: 'Проектор' },
            { id: 'projection-screen', label: 'Экран проекционный' },
            { id: 'ac-indoor', label: 'Кондиционер' },
            { id: 'radiator', label: 'Радиатор' },
        ]
    },
    {
        name: 'Декор',
        items: [
            { id: 'plant', label: 'Растение' },
            { id: 'floor-lamp', label: 'Торшер' },
            { id: 'rug', label: 'Ковёр' },
        ]
    },
];

const ITEM_TEMPLATES = {
    'zone': { label: 'Зона', svg: () => `<g class="core"><rect x="-100" y="-75" class="shape" width="200" height="150" rx="10" fill="rgba(13,110,253,0.1)" stroke="rgba(13,110,253,0.3)"/></g>` },
    /* === КОФЕЙНЯ === */
    'cafe-table-round-60': { label: 'Стол круглый Ø60', svg: () => `<g class="core">
        <circle class="shape" r="30" fill="url(#wood-oak)" stroke="var(--stroke)"/>
        <circle r="26" fill="#ffffff" fill-opacity="0.08"/>
        <g stroke="url(#metal-steel)" stroke-width="4" stroke-linecap="round">
            <line x1="0" y1="30" x2="0" y2="42"/>
            <line x1="-10" y1="42" x2="10" y2="42"/>
        </g>
    </g>` },
    'cafe-table-square-70': { label: 'Стол квадрат 70×70', svg: () => `<g class="core">
        <rect class="shape" x="-35" y="-35" width="70" height="70" rx="8"
            fill="url(#wood-oak)" stroke="var(--stroke)"/>
        <rect x="-30" y="-30" width="60" height="60" rx="6"
            fill="#ffffff" fill-opacity="0.08"/>
        <g stroke="url(#metal-steel)" stroke-width="4" stroke-linecap="round">
            <line x1="0" y1="35" x2="0" y2="44"/><line x1="-12" y1="44" x2="12" y2="44"/>
        </g>
    </g>` },
    'cafe-hightop-round-70': { label: 'Хай-топ Ø70', svg: () => `<g class="core">
        <circle class="shape" r="35" fill="url(#wood-espresso)" stroke="var(--stroke)"/>
        <circle r="30" fill="#000" fill-opacity="0.08"/>
        <g stroke="url(#metal-steel)" stroke-width="4" stroke-linecap="round">
            <line x1="0" y1="35" x2="0" y2="48"/><line x1="-12" y1="48" x2="12" y2="48"/>
        </g>
    </g>` },
    'cafe-communal-240': { label: 'Коммунальный 240×90', svg: () => `<g class="core">
        <rect class="shape" x="-120" y="-45" width="240" height="90" rx="10"
            fill="url(#wood-oak)" stroke="var(--stroke)"/>
        <rect x="-112" y="-37" width="224" height="74" rx="8"
            fill="#ffffff" fill-opacity="0.06"/>
        <g stroke="url(#metal-steel)" stroke-width="4" stroke-linecap="round">
            <line x1="-90" y1="45" x2="-90" y2="54"/>
            <line x1="0" y1="45" x2="0" y2="54"/>
            <line x1="90" y1="45" x2="90" y2="54"/>
        </g>
    </g>` },
    'banquette-160': { label: 'Банкетка 160 (3 места)', svg: () => `<g class="core">
        <rect class="shape" x="-80" y="-25" width="160" height="50" rx="14"
            fill="url(#upholstery-cream)" stroke="#5d636b"/>
        <rect x="-80" y="-40" width="160" height="20" rx="10"
            fill="url(#upholstery-slate)" stroke="#3b4149"/>
        <g stroke="#ffffff" stroke-opacity="0.18" stroke-width="4" stroke-linecap="round">
            <line x1="-40" y1="-12" x2="-40" y2="18"/><line x1="0" y1="-12" x2="0" y2="18"/><line x1="40" y1="-12" x2="40" y2="18"/>
        </g>
    </g>` },
    'banquette-220': { label: 'Банкетка 220 (4 места)', svg: () => `<g class="core">
        <rect class="shape" x="-110" y="-25" width="220" height="50" rx="14"
            fill="url(#upholstery-cream)" stroke="#5d636b"/>
        <rect x="-110" y="-40" width="220" height="20" rx="10"
            fill="url(#upholstery-slate)" stroke="#3b4149"/>
        <g stroke="#ffffff" stroke-opacity="0.18" stroke-width="4" stroke-linecap="round">
            <line x1="-66" y1="-12" x2="-66" y2="18"/><line x1="-22" y1="-12" x2="-22" y2="18"/>
            <line x1="22" y1="-12" x2="22" y2="18"/><line x1="66" y1="-12" x2="66" y2="18"/>
        </g>
    </g>` },
    'booth-2': { label: 'Кабинка на 2', svg: () => `<g class="core">
        <rect x="-45" y="-35" width="90" height="70" rx="12"
            fill="url(#upholstery-cream)" stroke="#5d636b"/>
        <rect x="-45" y="-52" width="90" height="20" rx="10"
            fill="url(#upholstery-slate)" stroke="#3b4149"/>
        <rect x="-18" y="-10" width="36" height="20" rx="6"
            fill="url(#wood-oak)" stroke="var(--stroke)"/>
    </g>` },
    'booth-4': { label: 'Кабинка на 4', svg: () => `<g class="core">
        <rect x="-70" y="-40" width="140" height="80" rx="12"
            fill="url(#upholstery-cream)" stroke="#5d636b"/>
        <rect x="-70" y="-58" width="140" height="20" rx="10"
            fill="url(#upholstery-slate)" stroke="#3b4149"/>
        <rect x="-24" y="-12" width="48" height="24" rx="6"
            fill="url(#wood-oak)" stroke="var(--stroke)"/>
    </g>` },
    'bar-counter-straight-180': { label: 'Барная стойка 180', svg: () => `<g class="core">
        <rect class="shape" x="-90" y="-36" width="180" height="72" rx="8"
            fill="url(#counter-marble)" stroke="var(--stroke)"/>
        <rect x="-90" y="-8" width="180" height="16" rx="6"
            fill="rgba(0,0,0,0.08)"/>
        <g stroke="url(#metal-steel)" stroke-width="4" stroke-linecap="round">
            <line x1="-70" y1="36" x2="-70" y2="48"/>
            <line x1="70" y1="36" x2="70" y2="48"/>
        </g>
    </g>` },
    'bar-counter-straight-240': { label: 'Барная стойка 240', svg: () => `<g class="core">
        <rect class="shape" x="-120" y="-36" width="240" height="72" rx="8"
            fill="url(#counter-marble)" stroke="var(--stroke)"/>
        <rect x="-120" y="-8" width="240" height="16" rx="6"
            fill="rgba(0,0,0,0.08)"/>
        <g stroke="url(#metal-steel)" stroke-width="4" stroke-linecap="round">
            <line x1="-100" y1="36" x2="-100" y2="48"/>
            <line x1="0" y1="36" x2="0" y2="48"/>
            <line x1="100" y1="36" x2="100" y2="48"/>
        </g>
    </g>` },
    'bar-counter-l-180x180': { label: 'Барная стойка Г 180×180', svg: () => `<g class="core">
        <path class="shape" d="M-90 -36 H90 V36 H-36 V90 H-90 Z"
            fill="url(#counter-marble)" stroke="var(--stroke)"/>
        <rect x="-90" y="-8" width="180" height="16" rx="6" fill="rgba(0,0,0,0.08)"/>
        <rect x="-8" y="-36" width="16" height="126" rx="6" fill="rgba(0,0,0,0.08)"/>
    </g>` },
    'bar-counter-island-180x90': { label: 'Бар-остров 180×90', svg: () => `<g class="core">
        <rect class="shape" x="-90" y="-45" width="180" height="90" rx="10"
            fill="url(#counter-marble)" stroke="var(--stroke)"/>
        <rect x="-90" y="-10" width="180" height="20" rx="8" fill="rgba(0,0,0,0.08)"/>
    </g>` },
    'bar-back-shelf-180': { label: 'Задняя барная полка 180', svg: () => `<g class="core">
        <rect class="shape" x="-90" y="-8" width="180" height="16" rx="4"
            fill="url(#wood-espresso)" stroke="#2c180d"/>
        <rect x="-90" y="-28" width="180" height="12" rx="3"
            fill="url(#wood-espresso)" stroke="#2c180d"/>
        <rect x="-90" y="-48" width="180" height="12" rx="3"
            fill="url(#wood-espresso)" stroke="#2c180d"/>
    </g>` },
    'espresso-2g': { label: 'Эспрессо-машина 2 группы', svg: () => `<g class="core">
        <rect class="shape" x="-46" y="-22" width="92" height="44" rx="8"
            fill="url(#metal-chrome)" stroke="var(--stroke)"/>
        <rect x="-40" y="-30" width="80" height="10" rx="6"
            fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <g fill="url(#metal-steel)">
            <rect x="-28" y="-6" width="16" height="12" rx="2"/>
            <rect x="12"  y="-6" width="16" height="12" rx="2"/>
        </g>
        <rect x="-42" y="12" width="84" height="6" rx="3" fill="#111" fill-opacity="0.45"/>
    </g>` },
    'espresso-3g': { label: 'Эспрессо-машина 3 группы', svg: () => `<g class="core">
        <rect class="shape" x="-66" y="-22" width="132" height="44" rx="8"
            fill="url(#metal-chrome)" stroke="var(--stroke)"/>
        <rect x="-60" y="-30" width="120" height="10" rx="6"
            fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <g fill="url(#metal-steel)">
            <rect x="-40" y="-6" width="16" height="12" rx="2"/>
            <rect x="-8"  y="-6" width="16" height="12" rx="2"/>
            <rect x="24"  y="-6" width="16" height="12" rx="2"/>
        </g>
        <rect x="-62" y="12" width="124" height="6" rx="3" fill="#111" fill-opacity="0.45"/>
    </g>` },
    'grinder-80mm': { label: 'Кофемолка 80 мм', svg: () => `<g class="core">
        <rect class="shape" x="-12" y="-18" width="24" height="36" rx="4"
            fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <polygon points="-10,-20 10,-20 6,-34 -6,-34"
                fill="url(#glass-soft)" stroke="var(--stroke)"/>
    </g>` },
    'batch-brewer-2': { label: 'Бэтч-брю (2 станции)', svg: () => `<g class="core">
        <rect class="shape" x="-40" y="-22" width="80" height="44" rx="6"
            fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <g fill="url(#glass-soft)" stroke="var(--stroke)">
            <rect x="-26" y="-10" width="18" height="18" rx="3"/>
            <rect x="8"   y="-10" width="18" height="18" rx="3"/>
        </g>
    </g>` },
    'pour-over-3': { label: 'Пуровер-станция ×3', svg: () => `<g class="core">
        <rect class="shape" x="-60" y="-18" width="120" height="36" rx="6"
            fill="url(#wood-oak)" stroke="var(--stroke)"/>
        <g fill="url(#glass-soft)" stroke="var(--stroke)">
            <circle cx="-40" r="10"/><circle cx="0" r="10"/><circle cx="40" r="10"/>
        </g>
    </g>` },
    'kettle-electric': { label: 'Электрочайник', svg: () => `<g class="core">
        <ellipse class="shape" cx="0" cy="0" rx="16" ry="12"
            fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <rect x="-10" y="-8" width="20" height="16" rx="4"
            fill="url(#metal-chrome)" stroke="var(--stroke)"/>
    </g>` },
    'water-filter': { label: 'Фильтр воды под мойкой', svg: () => `<g class="core">
        <rect class="shape" x="-20" y="-14" width="40" height="28" rx="6"
            fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <g fill="url(#metal-chrome)" stroke="var(--stroke)">
            <rect x="-14" y="-8" width="10" height="16" rx="3"/>
            <rect x="4"   y="-8" width="10" height="16" rx="3"/>
        </g>
    </g>` },
    'ice-machine-60': { label: 'Льдогенератор 60', svg: () => `<g class="core">
        <rect class="shape" x="-30" y="-30" width="60" height="60" rx="6"
            fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <rect x="-26" y="-10" width="52" height="14" rx="4"
            fill="#111" fill-opacity="0.35"/>
    </g>` },
    'undercounter-fridge-90': { label: 'Холод под столеш. 90', svg: () => `<g class="core">
        <rect class="shape" x="-45" y="-30" width="90" height="60" rx="6"
            fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <rect x="-41" y="-26" width="82" height="52" rx="4"
            fill="#dfe6ee" stroke="var(--stroke)"/>
        <line x1="0" y1="-26" x2="0" y2="26" stroke="var(--stroke)"/>
    </g>` },
    'upright-fridge-60': { label: 'Холодильник 60', svg: () => `<g class="core">
        <rect class="shape" x="-30" y="-36" width="60" height="72" rx="6"
            fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <rect x="-26" y="-32" width="52" height="64" rx="4"
            fill="#dfe6ee" stroke="var(--stroke)"/>
    </g>` },
    'milk-fridge-60': { label: 'Молочный холодильник 60', svg: () => `<g class="core">
        <rect class="shape" x="-30" y="-28" width="60" height="56" rx="6"
            fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <rect x="-24" y="-22" width="48" height="44" rx="4"
            fill="#dfe6ee" stroke="var(--stroke)"/>
        <rect x="-20" y="-18" width="40" height="10" rx="3"
            fill="#fff" fill-opacity="0.7" stroke="var(--stroke)"/>
    </g>` },
    'freezer-60': { label: 'Морозильник 60', svg: () => `<g class="core">
        <rect class="shape" x="-30" y="-30" width="60" height="60" rx="6"
            fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <rect x="-25" y="-10" width="50" height="20" rx="3"
            fill="#eaf6ff" stroke="var(--stroke)"/>
    </g>` },
    'pastry-case-120': { label: 'Витрина кондит. прямая 120', svg: () => `<g class="core">
        <rect class="shape" x="-60" y="-30" width="120" height="60" rx="8"
            fill="url(#wood-espresso)" stroke="#2c180d"/>
        <rect x="-58" y="-38" width="116" height="16" rx="6"
            fill="url(#glass-soft)" stroke="var(--stroke)"/>
    </g>` },
    'pastry-case-120-curved': { label: 'Витрина кондит. радиус 120', svg: () => `<g class="core">
        <rect class="shape" x="-60" y="-30" width="120" height="60" rx="8"
            fill="url(#wood-espresso)" stroke="#2c180d"/>
        <path d="M-58 -30 Q0 -50 58 -30" fill="url(#glass-soft)" stroke="var(--stroke)"/>
        <rect x="-58" y="-38" width="116" height="8" rx="4"
            fill="url(#glass-soft)" stroke="var(--stroke)"/>
    </g>` },
    'pos-terminal': { label: 'POS-терминал', svg: () => `<g class="core">
        <rect class="shape" x="-18" y="-12" width="36" height="24" rx="4"
            fill="#1e2330" stroke="#3a4050"/>
        <rect x="-14" y="-8" width="28" height="16" rx="3"
            fill="#0e1320"/>
        <rect x="-3" y="12" width="6" height="6" rx="2" fill="#5ad1ff"/>
    </g>` },
    'cash-drawer': { label: 'Денежный ящик', svg: () => `<g class="core">
        <rect class="shape" x="-24" y="-14" width="48" height="28" rx="4"
            fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <circle cx="0" cy="0" r="2.5" fill="#333"/>
    </g>` },
    'condiment-120': { label: 'Станция приправ 120', svg: () => `<g class="core">
        <rect class="shape" x="-60" y="-22" width="120" height="44" rx="6"
            fill="url(#wood-oak)" stroke="var(--stroke)"/>
        <g fill="#fff" fill-opacity="0.75" stroke="#ccc">
            <rect x="-48" y="-12" width="24" height="18" rx="3"/>
            <rect x="-12" y="-12" width="24" height="18" rx="3"/>
            <rect x="24"  y="-12" width="24" height="18" rx="3"/>
        </g>
    </g>` },
    'syrup-rack-90': { label: 'Рейл сиропов 90', svg: () => `<g class="core">
        <rect class="shape" x="-45" y="-10" width="90" height="20" rx="5"
            fill="url(#wood-espresso)" stroke="#2c180d"/>
        <g fill="#f6d5ff" stroke="#a86ad0">
            <circle cx="-30" r="4"/><circle cx="-15" r="4"/><circle cx="0" r="4"/><circle cx="15" r="4"/><circle cx="30" r="4"/>
        </g>
    </g>` },
    'trash-single': { label: 'Урна одинарная', svg: () => `<g class="core">
        <rect class="shape" x="-16" y="-20" width="32" height="40" rx="6"
            fill="#40464f" stroke="#242a33"/>
        <rect x="-12" y="-24" width="24" height="8" rx="3" fill="#303640"/>
    </g>` },
    'trash-double': { label: 'Урна двойная', svg: () => `<g class="core">
        <rect class="shape" x="-32" y="-20" width="64" height="40" rx="6"
            fill="#40464f" stroke="#242a33"/>
        <rect x="-26" y="-24" width="24" height="8" rx="3" fill="#303640"/>
        <rect x="2"    y="-24" width="24" height="8" rx="3" fill="#303640"/>
    </g>` },
    'hand-sink': { label: 'Раковина для рук', svg: () => `<g class="core">
        <rect class="shape" x="-20" y="-16" width="40" height="32" rx="6"
            fill="#e9f1fb" stroke="var(--stroke)"/>
        <circle r="5" fill="#c8d7ea"/>
    </g>` },
    'triple-sink': { label: 'Мойка 3-секц.', svg: () => `<g class="core">
        <rect class="shape" x="-90" y="-26" width="180" height="52" rx="8"
            fill="#e9f1fb" stroke="var(--stroke)"/>
        <g fill="#c8d7ea" stroke="var(--stroke)">
            <rect x="-70" y="-14" width="40" height="28" rx="5"/>
            <rect x="-20" y="-14" width="40" height="28" rx="5"/>
            <rect x="30"  y="-14" width="40" height="28" rx="5"/>
        </g>
    </g>` },
    'dishwasher-pro': { label: 'Посудомойка подстол.', svg: () => `<g class="core">
        <rect class="shape" x="-28" y="-24" width="56" height="48" rx="6"
            fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <rect x="-24" y="-6" width="48" height="12" rx="3"
            fill="#eaf6ff" stroke="var(--stroke)"/>
    </g>` },
    'drying-rack-120': { label: 'Сушка посуды 120', svg: () => `<g class="core">
        <rect class="shape" x="-60" y="-10" width="120" height="20" rx="4"
            fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <g stroke="#aab7c6">
            <line x1="-50" y1="-8" x2="-50" y2="8"/><line x1="-30" y1="-8" x2="-30" y2="8"/>
            <line x1="-10" y1="-8" x2="-10" y2="8"/><line x1="10" y1="-8" x2="10" y2="8"/>
            <line x1="30"  y1="-8" x2="30" y2="8"/><line x1="50" y1="-8" x2="50" y2="8"/>
        </g>
    </g>` },
    'queue-post': { label: 'Стойка очереди', svg: () => `<g class="core">
        <circle class="shape" r="10" fill="url(#metal-steel)" stroke="var(--stroke)"/>
        <circle r="14" fill="#000" fill-opacity="0.06"/>
    </g>` },
    'menu-board-120': { label: 'Меню-борд 120', svg: () => `<g class="core">
        <rect class="shape" x="-60" y="-6" width="120" height="12" rx="3"
            fill="#1e2330" stroke="#3a4050"/>
        <rect x="-56" y="-2" width="112" height="4" rx="2"
            fill="#0e1320"/>
    </g>` },
    'planter-long-120': { label: 'Кашпо длинное 120', svg: () => `<g class="core">
        <rect class="shape" x="-60" y="-14" width="120" height="28" rx="6"
            fill="url(#wood-oak)" stroke="var(--stroke)"/>
        <rect x="-56" y="-18" width="112" height="10" rx="5"
            fill="url(#foliage-rich)" stroke="#2c6b3f"/>
    </g>` },
    'partition-120x10': { label: 'Перегородка 120×10', svg: () => `<g class="core">
        <rect class="shape" x="-60" y="-5" width="120" height="10" rx="3"
            fill="#cbd3dd" stroke="#9aa4b0"/>
    </g>` },
    'chair': { label: 'Стул', svg: () => `<g class="core">
        <g fill="none" stroke="url(#metal-steel)" stroke-width="3.4" stroke-linecap="round">
            <path d="M-15 10 L-12 32"/>
            <path d="M15 10 L12 32"/>
            <path d="M-15 -10 L-20 8"/>
            <path d="M15 -10 L20 8"/>
        </g>
        <path class="shape" d="M-22 -12 Q0 -32 22 -12 V-4 Q0 -22 -22 -4 Z" fill="url(#upholstery-amber)" stroke="#714624"/>
        <rect class="shape" x="-20" y="-2" width="40" height="24" rx="7" fill="url(#upholstery-amber)" stroke="#714624"/>
        <rect x="-18" y="-20" width="36" height="10" rx="5" fill="url(#wood-espresso)" stroke="#2c180d"/>
        <rect x="-14" y="2" width="28" height="6" rx="3" fill="#fff4de" fill-opacity="0.25"/>
    </g>` },
    'armchair': { label: 'Кресло', svg: () => `<g class="core">
        <rect x="-44" y="-32" width="88" height="64" rx="20" fill="url(#upholstery-slate)" stroke="#2f363f"/>
        <rect x="-42" y="-20" width="18" height="48" rx="8" fill="url(#leather-caramel)" stroke="#4d2d17"/>
        <rect x="24" y="-20" width="18" height="48" rx="8" fill="url(#leather-caramel)" stroke="#4d2d17"/>
        <rect class="shape" x="-32" y="-8" width="64" height="40" rx="14" fill="url(#upholstery-cream)" stroke="#5d636b"/>
        <rect class="shape" x="-30" y="-24" width="60" height="22" rx="12" fill="url(#upholstery-slate)" stroke="#3b4149"/>
        <path d="M-30 -10 H30" stroke="#ffffff" stroke-opacity="0.18" stroke-width="4" stroke-linecap="round"/>
        <g fill="none" stroke="url(#metal-steel)" stroke-width="4" stroke-linecap="round">
            <path d="M-28 26 L-24 44"/>
            <path d="M28 26 L24 44"/>
        </g>
    </g>` },
    'sofa-2': { label: 'Диван 2-местный', svg: () => `<g class="core">
        <rect class="shape" x="-88" y="-38" width="176" height="76" rx="24" fill="url(#upholstery-forest)" stroke="#253523"/>
        <rect x="-84" y="18" width="168" height="12" rx="5" fill="url(#wood-espresso)" stroke="#1a120b"/>
        <g fill="url(#upholstery-cream)" stroke="#8c805f">
            <rect class="shape" x="-66" y="-2" width="58" height="34" rx="12"/>
            <rect class="shape" x="8" y="-2" width="58" height="34" rx="12"/>
        </g>
        <g fill="url(#upholstery-forest)" stroke="#314b31">
            <rect x="-74" y="-26" width="60" height="20" rx="10"/>
            <rect x="14" y="-26" width="60" height="20" rx="10"/>
        </g>
        <g fill="#ffffff" fill-opacity="0.65" stroke="none">
            <circle cx="-37" cy="-4" r="10"/>
            <circle cx="39" cy="-4" r="10"/>
        </g>
        <g fill="none" stroke="url(#metal-steel)" stroke-width="5" stroke-linecap="round">
            <path d="M-70 30 L-70 44"/>
            <path d="M70 30 L70 44"/>
        </g>
    </g>` },
    'sofa-3': { label: 'Диван 3-местный', svg: () => `<g class="core">
        <rect class="shape" x="-110" y="-38" width="220" height="76" rx="26" fill="url(#upholstery-slate)" stroke="#283039"/>
        <rect x="-106" y="18" width="212" height="12" rx="5" fill="url(#wood-espresso)" stroke="#1a120b"/>
        <g fill="url(#upholstery-cream)" stroke="#6c6960">
            <rect class="shape" x="-84" y="-2" width="54" height="34" rx="12"/>
            <rect class="shape" x="-18" y="-2" width="54" height="34" rx="12"/>
            <rect class="shape" x="48" y="-2" width="54" height="34" rx="12"/>
        </g>
        <g fill="url(#upholstery-slate)" stroke="#3b424b">
            <rect x="-92" y="-26" width="60" height="20" rx="10"/>
            <rect x="-26" y="-26" width="60" height="20" rx="10"/>
            <rect x="40" y="-26" width="60" height="20" rx="10"/>
        </g>
        <g fill="url(#fabric-hatching)" stroke="#c2ae8c" stroke-width="1.2">
            <rect x="-60" y="10" width="44" height="18" rx="8"/>
            <rect x="16" y="10" width="44" height="18" rx="8"/>
        </g>
        <g fill="none" stroke="url(#metal-steel)" stroke-width="5" stroke-linecap="round">
            <path d="M-90 30 L-90 44"/>
            <path d="M0 30 L0 44"/>
            <path d="M90 30 L90 44"/>
        </g>
    </g>` },
    'sectional-l': { label: 'Диван угловой L', svg: () => `<g class="core">
        <path class="shape" d="M-108 -50 H88 Q106 -50 106 -32 V30 H30 V96 H-96 Q-108 96 -108 84 Z" fill="url(#upholstery-forest)" stroke="#253523"/>
        <rect x="-104" y="18" width="134" height="12" rx="5" fill="url(#wood-espresso)" stroke="#1a120b"/>
        <rect x="6" y="30" width="24" height="56" rx="10" fill="url(#wood-espresso)" stroke="#1a120b"/>
        <g fill="url(#upholstery-cream)" stroke="#8c805f">
            <rect class="shape" x="-86" y="-6" width="64" height="34" rx="12"/>
            <rect class="shape" x="-18" y="-6" width="86" height="34" rx="14"/>
            <rect class="shape" x="-84" y="30" width="60" height="34" rx="12"/>
        </g>
        <g fill="none" stroke="url(#metal-steel)" stroke-width="5" stroke-linecap="round">
            <path d="M-92 32 L-92 48"/>
            <path d="M-6 32 L-6 48"/>
            <path d="M44 72 L44 90"/>
        </g>
    </g>` },
    'stool': { label: 'Табурет', svg: () => `<g class="core">
        <g fill="none" stroke="url(#metal-steel)" stroke-width="3" stroke-linecap="round">
            <path d="M-10 -6 L-12 16"/>
            <path d="M10 -6 L12 16"/>
            <path d="M-6 8 L-4 24"/>
            <path d="M6 8 L4 24"/>
        </g>
        <circle class="shape" r="20" fill="url(#wood-honey)" stroke="#704622"/>
        <circle r="12" fill="url(#table-round-sheen)"/>
        <circle r="5" fill="url(#metal-brass)" stroke="#7f601f" stroke-width="0.6"/>
    </g>` },
    'barstool': { label: 'Барный стул', svg: () => `<g class="core">
        <g fill="none" stroke="url(#metal-steel)" stroke-width="3.2" stroke-linecap="round">
            <path d="M-8 -20 L-12 28"/>
            <path d="M8 -20 L12 28"/>
            <ellipse cy="10" rx="16" ry="3" stroke="url(#metal-brass)"/>
        </g>
        <circle class="shape" cy="-24" r="20" fill="url(#leather-caramel)" stroke="#4d2d17"/>
        <circle cy="-24" r="12" fill="url(#table-round-sheen)"/>
        <rect x="-8" y="28" width="16" height="6" rx="3" fill="url(#metal-steel)" stroke="#7c858f"/>
    </g>` },
    'coffee-round': { label: 'Стол журнальный', svg: () => `<g class="core">
        <circle class="shape" r="40" fill="url(#wood-honey)" stroke="#835127"/>
        <circle r="30" fill="url(#table-round-sheen)"/>
        <g fill="none" stroke="url(#metal-steel)" stroke-width="3.2" stroke-linecap="round">
            <path d="M-18 38 L-6 20"/>
            <path d="M18 38 L6 20"/>
            <path d="M-6 20 L6 20"/>
        </g>
    </g>` },
    'coffee-rect': { label: 'Стол журнальный', svg: () => `<g class="core">
        <rect class="shape" x="-48" y="-28" width="96" height="56" rx="10" fill="url(#wood-honey)" stroke="#835127"/>
        <rect x="-32" y="-14" width="64" height="28" rx="8" fill="url(#table-round-sheen)"/>
        <g fill="none" stroke="url(#metal-steel)" stroke-width="3" stroke-linecap="round">
            <path d="M-32 26 L-18 10"/>
            <path d="M32 26 L18 10"/>
            <path d="M-18 10 H18"/>
        </g>
    </g>` },
    'dining-4': { label: 'Стол обеденный', svg: () => `<g class="core">
        <rect class="shape" x="-68" y="-44" width="136" height="88" rx="12" fill="url(#wood-oak)" stroke="#7a4c22"/>
        <rect x="-48" y="-16" width="96" height="32" rx="8" fill="url(#table-round-sheen)"/>
        <g fill="none" stroke="url(#metal-steel)" stroke-width="4" stroke-linecap="round">
            <path d="M-44 40 L-30 10"/>
            <path d="M44 40 L30 10"/>
            <path d="M-30 10 H30"/>
        </g>
    </g>` },
    'dining-6': { label: 'Стол обеденный', svg: () => `<g class="core">
        <rect class="shape" x="-88" y="-48" width="176" height="96" rx="14" fill="url(#wood-oak)" stroke="#7a4c22"/>
        <rect x="-60" y="-18" width="120" height="36" rx="10" fill="url(#table-round-sheen)"/>
        <g fill="none" stroke="url(#metal-steel)" stroke-width="4" stroke-linecap="round">
            <path d="M-60 44 L-40 12"/>
            <path d="M60 44 L40 12"/>
            <path d="M-40 12 H40"/>
        </g>
    </g>` },
    'dining-8': { label: 'Стол обеденный', svg: () => `<g class="core">
        <rect class="shape" x="-108" y="-48" width="216" height="96" rx="18" fill="url(#wood-oak)" stroke="#7a4c22"/>
        <rect x="-72" y="-18" width="144" height="36" rx="12" fill="url(#table-round-sheen)"/>
        <g fill="none" stroke="url(#metal-steel)" stroke-width="4" stroke-linecap="round">
            <path d="M-74 44 L-50 10"/>
            <path d="M74 44 L50 10"/>
            <path d="M-50 10 H50"/>
        </g>
    </g>` },
    'desk': { label: 'Стол письменный', svg: () => `<g class="core">
        <rect class="shape" x="-76" y="-38" width="152" height="76" rx="10" fill="url(#wood-espresso)" stroke="#50311b"/>
        <rect x="-70" y="-30" width="64" height="20" rx="6" fill="#ede0d2" stroke="#d0bca2"/>
        <rect x="14" y="-30" width="62" height="60" rx="8" fill="#62442a" stroke="#3b2415" fill-opacity="0.25"/>
        <path d="M-12 -30 V38" stroke="#22150c" stroke-opacity="0.3"/>
        <g fill="none" stroke="url(#metal-steel)" stroke-width="3.4" stroke-linecap="round">
            <path d="M-52 36 L-40 10"/>
            <path d="M52 36 L40 10"/>
        </g>
    </g>` },
    'workstation-l': { label: 'Рабочая станция L', svg: () => `<g class="core">
        <path class="shape" transform="translate(-84, -70)" d="M0 10 C0 4.477 4.477 0 10 0 H168 C173.523 0 178 4.477 178 10 V60 H110 V140 C110 145.523 105.523 150 100 150 H60 V80 H10 C4.477 80 0 75.523 0 70 V10 Z" fill="url(#wood-espresso)" stroke="#50311b"/>
        <path d="M-10 -6 H70" stroke="#2b1a0f" stroke-opacity="0.2" stroke-width="6" stroke-linecap="round"/>
        <g fill="none" stroke="url(#metal-steel)" stroke-width="3.6" stroke-linecap="round">
            <path d="M-64 58 L-52 18"/>
            <path d="M24 60 L12 18"/>
            <path d="M74 60 L62 18"/>
        </g>
    </g>` },
    'office-chair': { label: 'Кресло офисное', svg: () => `<g class="core" transform="translate(-22, -26)">
        <path d="M11,50 L14,50 Q12,48 11,46 L11,50 M33,50 L30,50 Q32,48 33,46 L33,50 M18,50 L20,50 Q19,48 18,46 L18,50 M26,50 L24,50 Q25,48 26,46 L26,50" fill="#1f1f1f"/>
        <path class="shape" d="M22,0 L22,6 L12,6 Q8,6 8,10 L8,38 Q8,42 12,42 L32,42 Q36,42 36,38 L36,10 Q36,6 32,6 L22,6 Z" fill="url(#upholstery-slate)" stroke="#1c2127"/>
        <rect x="6" y="12" width="4" height="22" rx="2" fill="url(#metal-steel)" stroke="#1c2127"/>
        <rect x="38" y="12" width="4" height="22" rx="2" fill="url(#metal-steel)" stroke="#1c2127"/>
        <path d="M11,46 L33,46 M22,42 V50 M14,42 L11,46 L14,50 M30,42 L33,46 L30,50 M18,42 L18,50 M26,42 L26,50" fill="none" stroke="#1c2127" stroke-width="2" stroke-linecap="round"/>
    </g>` },
    'reception': { label: 'Стойка-ресепшн', svg: () => `<g class="core">
        <rect class="shape" x="-116" y="-44" width="232" height="88" rx="12" fill="url(#wood-espresso)" stroke="#4a2d17"/>
        <rect x="-112" y="-36" width="224" height="44" rx="10" fill="url(#counter-marble)" stroke="#c4c0bb"/>
        <path d="M-112 4 H112" stroke="#2f1d10" stroke-opacity="0.25"/>
        <g fill="none" stroke="#ffffff" stroke-opacity="0.4">
            <path d="M-80 -12 H-30"/>
            <path d="M30 -12 H80"/>
        </g>
    </g>` },
    'whiteboard': { label: 'Доска', svg: () => `<g class="core"><rect x="-90" y="-50" class="shape" width="180" height="100" rx="4" fill="#B0C4DE" stroke="#708090"/><rect x="-85" y="-45" width="170" height="90" fill="#FFFFFF" stroke="#E6E6FA"/><path d="M-75 -25 H60 M-75 -5 H30 M-75 15 H0" stroke="#ADD8E6" stroke-width="2"/></g>` },
    'printer': { label: 'Принтер', svg: () => `<g class="core"><rect x="-30" y="-22.5" class="shape" width="60" height="45" rx="6" fill="#DCDCDC" stroke="#A9A9A9"/><rect x="-25" y="-17.5" width="50" height="10" rx="2" fill="#FFFFFF"/><rect x="-22" y="5.5" width="44" height="12" rx="2" fill="#F5F5F5"/></g>` },
    'copier': { label: 'Ксерокс', svg: () => `<g class="core"><rect x="-35" y="-45" class="shape" width="70" height="90" rx="6" fill="#DCDCDC" stroke="#A9A9A9"/><rect x="-30" y="-40" width="60" height="20" rx="3" fill="#696969" stroke="#2F4F4F"/><rect x="-27" y="-10" width="54" height="5" rx="2" fill="#FFFFFF"/><rect x="-27" y="5" width="54" height="10" rx="2" fill="#F5F5F5"/><rect x="-27" y="20" width="54" height="10" rx="2" fill="#F5F5F5"/></g>` },
    'server-rack': { label: 'Серверная стойка', svg: () => `<g class="core"><rect x="-30" y="-50" class="shape" width="60" height="100" rx="4" fill="#1b263b" stroke="#415a77"/><g fill="#74c0fc" opacity="0.6">${[-38,-24,-10,4,18,32].map(y=>`<rect x="-20" y="${y}" width="40" height="8" rx="1"/>`).join('')}</g></g>` },
    'bed-single': { label: 'Кровать', svg: () => `<g class="core" transform="translate(-45, -100)">
        <rect class="shape" width="90" height="30" rx="8" fill="#D2B48C" stroke="#8B4513"/>
        <rect class="shape" y="10" width="90" height="190" rx="10" fill="#F5F5DC" stroke="#BDB76B"/>
        <rect x="5" y="35" width="80" height="160" fill="#FFFFFF" stroke="#EEE8AA"/>
        <rect x="10" y="40" width="70" height="40" rx="6" fill="#F0E68C" stroke="#BDB76B"/>
    </g>` },
    'bed-double': { label: 'Кровать', svg: () => `<g class="core" transform="translate(-80, -100)">
        <rect class="shape" width="160" height="30" rx="8" fill="#A0522D" stroke="#800000"/>
        <rect class="shape" y="10" width="160" height="190" rx="12" fill="#FFE4C4" stroke="#D2691E"/>
        <rect x="5" y="35" width="150" height="160" fill="#FFFFFF" stroke="#FA8072"/>
        <rect x="15" y="40" width="60" height="40" rx="6" fill="#FFDAB9" stroke="#D2691E"/>
        <rect x="85" y="40" width="60" height="40" rx="6" fill="#FFDAB9" stroke="#D2691E"/>
    </g>` },
    'nightstand': { label: 'Тумба', svg: () => `<g class="core"><rect x="-20" y="-20" class="shape" width="40" height="40" rx="6" fill="url(#wood-grain)" stroke="#855a3c"/><rect x="-15" y="-12" width="30" height="8" rx="2" fill="#e3c6a4" stroke-opacity="0.5"/><rect x="-15" y="4" width="30" height="8" rx="2" fill="#e3c6a4" stroke-opacity="0.5"/></g>` },
    'wardrobe-2d': { label: 'Шкаф', svg: () => `<g class="core"><rect x="-60" y="-30" class="shape" width="120" height="60" rx="6" fill="url(#wood-grain)" stroke="#855a3c"/><path d="M0 -25 V25" stroke="#855a3c" stroke-width="1"/><rect x="-8" y="-2" width="4" height="12" rx="2" fill="#855a3c"/><rect x="4" y="-2" width="4" height="12" rx="2" fill="#855a3c"/></g>` },
    'wardrobe-3d': { label: 'Шкаф', svg: () => `<g class="core"><rect x="-90" y="-30" class="shape" width="180" height="60" rx="6" fill="url(#wood-grain)" stroke="#855a3c"/><path d="M-30 -25 V25 M30 -25 V25" stroke="#855a3c" stroke-width="1"/><rect x="-38" y="-2" width="4" height="12" rx="2" fill="#855a3c"/><rect x="-2" y="-2" width="4" height="12" rx="2" fill="#855a3c"/><rect x="34" y="-2" width="4" height="12" rx="2" fill="#855a3c"/></g>` },
    'shelving': { label: 'Стеллаж', svg: () => `<g class="core"><rect x="-70" y="-20" class="shape" width="140" height="40" rx="6" fill="none" stroke="#6c757d"/>${[-10,0,10].map(y=>`<path d="M-62 ${y} H62" stroke="#bbb"/>`).join('')}</g>` },
    'kitchen-line': { label: 'Кухонный модуль', svg: () => `<g class="core"><rect class="shape" x="-96" y="-34" width="192" height="68" rx="10" fill="url(#wood-espresso)" stroke="#3f2a17"/><rect x="-92" y="-30" width="184" height="20" rx="6" fill="url(#counter-marble)" stroke="#c9c4bf"/>${[-84,-28,28].map(x=>`<rect x="${x}" y="-8" width="52" height="36" rx="6" fill="#f3f4f6" stroke="#b7bec7"/>`).join('')}${[-84,-28,28].map(x=>`<rect x="${x+10}" y="12" width="32" height="12" rx="3" fill="#d1d6de" stroke="#a2aab6"/>`).join('')}</g>` },
    'sink': { label: 'Мойка', svg: () => `<g class="core" transform="translate(-36, -26)">
        <rect class="shape" width="72" height="52" rx="8" fill="url(#metal-chrome)" stroke="#919aa4"/>
        <rect x="6" y="8" width="60" height="36" rx="6" fill="url(#glass-soft)" stroke="#7f9bb0"/>
        <circle cx="36" cy="26" r="4" fill="#5d6a73"/>
        <path d="M54 6 Q60 -6 52 -10" stroke="url(#metal-steel)" stroke-width="3" stroke-linecap="round"/>
        <path d="M54 6 V18" stroke="url(#metal-steel)" stroke-width="3" stroke-linecap="round"/>
    </g>` },
    'cooktop-4': { label: 'Варочная панель', svg: () => `<g class="core" transform="translate(-30, -27.5)">
        <rect class="shape" width="60" height="55" rx="8" fill="#10151a" stroke="#30363c"/>
        ${[18,42].map(x=>[15,38].map(y=>`<circle cx="${x}" cy="${y}" r="9" fill="#1c232a" stroke="#4a545d"/><circle cx="${x}" cy="${y}" r="4" fill="#0d1114" stroke="#5b676f"/>`).join('')).join('')}
        <rect x="-4" y="-4" width="68" height="63" rx="10" fill="none" stroke="#4a545d" stroke-dasharray="6 8" stroke-opacity="0.5"/>
    </g>` },
    'fridge': { label: 'Холодильник', svg: () => `<g class="core"><rect x="-36" y="-34" class="shape" width="72" height="68" rx="8" fill="url(#metal-chrome)" stroke="#8f99a5"/><path d="M-30 0 H30" stroke="#b4bdc7"/><rect x="26" y="-26" width="4" height="16" rx="1.5" fill="#dde4ea" stroke="#93a0ad"/><rect x="26" y="10" width="4" height="16" rx="1.5" fill="#dde4ea" stroke="#93a0ad"/></g>` },
    'oven': { label: 'Духовка', svg: () => `<g class="core"><rect x="-32" y="-32" class="shape" width="64" height="64" rx="8" fill="url(#metal-steel)" stroke="#656d76"/><rect x="-22" y="-18" width="44" height="28" rx="4" fill="#1f2429" stroke="#495057"/><path d="M-20 -24 H20" stroke="#d6dae0" stroke-width="3" stroke-linecap="round"/><circle cx="0" cy="18" r="4" fill="#d6dae0"/></g>` },
    'microwave': { label: 'Микроволновка', svg: () => `<g class="core"><rect x="-30" y="-20" class="shape" width="60" height="40" rx="6" fill="url(#metal-chrome)" stroke="#8f99a5"/><rect x="-20" y="-10" width="32" height="20" rx="3" fill="#0f1418" stroke="#3e464f"/><rect x="15" y="-8" width="10" height="16" rx="3" fill="#d9dee3" stroke="#9da6b1"/><circle cx="20" cy="0" r="2" fill="#6c7682"/></g>` },
    'dishwasher': { label: 'Посудомойка', svg: () => `<g class="core"><rect x="-32" y="-32" class="shape" width="64" height="64" rx="8" fill="url(#metal-chrome)" stroke="#8f99a5"/><path d="M-20 -22 H20" stroke="#c7d0d8" stroke-width="3" stroke-linecap="round"/><rect x="-24" y="10" width="48" height="14" rx="4" fill="#edf1f5" stroke="#b8c1cc"/></g>` },
    'island': { label: 'Кухонный остров', svg: () => `<g class="core"><rect class="shape" x="-80" y="-48" width="160" height="96" rx="12" fill="url(#wood-espresso)" stroke="#4a2d17"/><rect x="-74" y="-42" width="148" height="32" rx="8" fill="url(#counter-marble)" stroke="#c4c0bb"/><rect x="-68" y="0" width="136" height="40" rx="10" fill="#f1f3f5" stroke="#b7bec7"/></g>` },
    'toilet': { label: 'Туалет', svg: () => `<g class="core" transform="translate(-20, -30)">
        <path class="shape" d="M5 10 H35 C37.761 10 40 12.239 40 15 V55 C40 57.761 37.761 60 35 60 H5 C2.239 60 0 57.761 0 55 V15 C0 12.239 2.239 10 5 10 Z" fill="#F8F8FF" stroke="#DCDCDC"/>
        <rect x="5" y="0" width="30" height="15" rx="4" fill="#E6E6FA" stroke="#D8BFD8"/>
        <ellipse cx="20" cy="38" rx="12" ry="15" fill="#FFFFFF" stroke="#DCDCDC"/>
    </g>` },
    'bath-sink': { label: 'Раковина', svg: () => `<g class="core"><rect x="-30" y="-22.5" class="shape" width="60" height="45" rx="8" fill="#F8F8FF" stroke="#DCDCDC"/><ellipse cx="0" cy="0" rx="18" ry="12" fill="#FFFFFF" stroke="#E0E0E0"/><circle r="3" fill="#6c757d"/></g>` },
    'shower': { label: 'Душ', svg: () => `<g class="core"><rect x="-45" y="-45" class="shape" width="90" height="90" rx="2" fill="#F0FFFF" stroke="#B0E0E6"/><path d="M-45 45 L45 -45" stroke="#E0FFFF"/><circle cx="-30" cy="-30" r="5" fill="#C0C0C0"/></g>` },
    'bathtub': { label: 'Ванна', svg: () => `<g class="core"><rect x="-75" y="-35" class="shape" width="150" height="70" rx="35" fill="#F8F8FF" stroke="#DCDCDC"/><ellipse cx="0" cy="0" rx="68" ry="28" fill="#FFFFFF" stroke="#E0E0E0"/></g>` },
    'washer': { label: 'Стиральная машина', svg: () => `<g class="core"><rect x="-32" y="-32" class="shape" width="64" height="64" rx="8" fill="url(#metal-chrome)" stroke="#8f99a5"/><circle cy="2" r="18" fill="#d7e1ea" stroke="#6d7a86"/><circle cy="2" r="12" fill="url(#glass-soft)" stroke="#6d7a86"/></g>` },
    'dryer': { label: 'Сушильная машина', svg: () => `<g class="core"><rect x="-32" y="-32" class="shape" width="64" height="64" rx="8" fill="url(#metal-chrome)" stroke="#8f99a5"/><circle cy="2" r="18" fill="#d7e1ea" stroke="#6d7a86"/><path d="M-10 -8 L10 12 M-10 12 L10 -8" stroke="#6d7a86" stroke-width="2" stroke-linecap="round"/></g>` },
    'water-cooler': { label: 'Кулер для воды', svg: () => `<g class="core"><rect x="-18" y="-52" class="shape" width="36" height="104" rx="8" fill="url(#metal-chrome)" stroke="#8f99a5"/><circle cy="-36" r="14" fill="url(#glass-soft)" stroke="#4a87b3"/><rect x="-8" y="-6" width="16" height="12" rx="3" fill="#dfe3e8" stroke="#9aa4af"/><path d="M-6 -2 H-2 M2 -2 H6" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/></g>` },
    'tv-stand': { label: 'ТВ-тумба', svg: () => `<g class="core"><rect x="-70" y="-20" class="shape" width="140" height="40" rx="6" fill="url(#wood-grain)" stroke="#855a3c"/></g>` },
    'tv-wall': { label: 'ТВ настенный', svg: () => `<g class="core"><rect x="-70" y="-40" class="shape" width="140" height="80" rx="6" fill="#202020" stroke="#000"/><rect x="-60" y="-30" width="120" height="60" rx="2" fill="#000" stroke="#303030"/></g>` },
    'projector': { label: 'Проектор', svg: () => `<g class="core"><rect x="-25" y="-15" class="shape" width="50" height="30" rx="6" fill="#F5F5F5" stroke="#DCDCDC"/><circle cx="10" r="8" fill="#212529" stroke="#495057"/></g>` },
    'projection-screen': { label: 'Экран проектора', svg: () => `<g class="core"><rect x="-90" y="-55" class="shape" width="180" height="10" rx="3" fill="#212529"/><rect x="-90" y="-45" width="180" height="100" fill="#FFFFFF" stroke="#DCDCDC"/></g>` },
    'ac-indoor': { label: 'Кондиционер', svg: () => `<g class="core"><rect x="-50" y="-15" class="shape" width="100" height="30" rx="6" fill="#FFFFFF" stroke="#DCDCDC"/><path d="M-40 7 H40" stroke="#E8E8E8"/></g>` },
    'radiator': { label: 'Радиатор', svg: () => `<g class="core"><rect x="-60" y="-12.5" class="shape" width="120" height="25" rx="4" fill="#F8F8FF" stroke="#DCDCDC"/>${[-50,-35,-20,-5,10,25,40].map(x=>`<path d="M${x} -8.5 V8.5" stroke="#DCDCDC" stroke-width="2"/>`).join('')}</g>` },
    'plant': { label: 'Растение', svg: () => `<g class="core">
        <path d="M-20,0 L20,0 L15,32 L-15,32 Z" fill="url(#ceramic-terracotta)" stroke="#5C3317"/>
        <ellipse cy="0" rx="18" ry="4" fill="#3a2513" fill-opacity="0.6"/>
        <path d="M0 -6 C-6 -16 -4 -28 0 -40 C4 -28 6 -16 0 -6 Z" fill="url(#foliage-rich)" stroke="#1f552a"/>
        <path d="M-12 -10 C-26 -4 -22 -20 -12 -34 C-8 -22 -6 -12 -12 -10 Z" fill="url(#foliage-rich)" stroke="#1f552a"/>
        <path d="M12 -12 C26 -6 22 -22 12 -36 C8 -24 6 -14 12 -12 Z" fill="url(#foliage-rich)" stroke="#1f552a"/>
        <path d="M-6 -14 Q0 -20 6 -14" stroke="#d8f5c4" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
    </g>` },
    'floor-lamp': { label: 'Торшер', svg: () => `<g class="core" transform="translate(0, -25)">
        <circle r="11" cy="22" fill="url(#metal-steel)" stroke="#6f7882"/>
        <path d="M0 -12 V 18" stroke="url(#metal-steel)" stroke-width="3" stroke-linecap="round"/>
        <path d="M-16,-12 L16,-12 L24,-44 L-24,-44 Z" fill="#fff3c4" stroke="#d0b36d"/>
        <path d="M-10,-24 L10,-24" stroke="#ffffff" stroke-opacity="0.5" stroke-linecap="round"/>
    </g>` },
    'rug': { label: 'Ковёр', svg: () => `<g class="core">
        <rect x="-90" y="-60" class="shape" width="180" height="120" rx="8" fill="#F5F5DC" stroke="#DEB887"/>
        <path d="M-80,-50 L80,-50 M-80,50 L80,50 M-80,-40 L80,-40 L80,40 L-80,40 L-80,-40" fill="none" stroke="#D2B48C" stroke-width="2" stroke-dasharray="5 5"/>
        <text y="10" font-family="serif" font-size="24" text-anchor="middle" fill="#CD853F">⚜</text>
    </g>` }
};

// --- Дополнительные параметры и шаблоны ---
// Добавляем информацию о числе посадочных мест для соответствующих шаблонов.
// Сиденья и столы имеют количество посадочных мест, используемое в аналитике.
Object.assign(ITEM_TEMPLATES['chair'] || {}, { seats: 1 });
Object.assign(ITEM_TEMPLATES['armchair'] || {}, { seats: 1 });
Object.assign(ITEM_TEMPLATES['sofa-2'] || {}, { seats: 2 });
Object.assign(ITEM_TEMPLATES['sofa-3'] || {}, { seats: 3 });
Object.assign(ITEM_TEMPLATES['sectional-l'] || {}, { seats: 4 });
Object.assign(ITEM_TEMPLATES['stool'] || {}, { seats: 1 });
Object.assign(ITEM_TEMPLATES['barstool'] || {}, { seats: 1 });
Object.assign(ITEM_TEMPLATES['dining-4'] || {}, { seats: 4 });
Object.assign(ITEM_TEMPLATES['dining-6'] || {}, { seats: 6 });
Object.assign(ITEM_TEMPLATES['dining-8'] || {}, { seats: 8 });
Object.assign(ITEM_TEMPLATES['office-chair'] || {}, { seats: 1 });
Object.assign(ITEM_TEMPLATES['cafe-table-round-60'] || {}, { seats: 2 });
Object.assign(ITEM_TEMPLATES['cafe-table-square-70'] || {}, { seats: 2 });
Object.assign(ITEM_TEMPLATES['cafe-hightop-round-70'] || {}, { seats: 2 });
Object.assign(ITEM_TEMPLATES['cafe-communal-240'] || {}, { seats: 6 });
Object.assign(ITEM_TEMPLATES['banquette-160'] || {}, { seats: 3 });
Object.assign(ITEM_TEMPLATES['banquette-220'] || {}, { seats: 4 });
Object.assign(ITEM_TEMPLATES['booth-2'] || {}, { seats: 2 });
Object.assign(ITEM_TEMPLATES['booth-4'] || {}, { seats: 4 });
Object.assign(ITEM_TEMPLATES['bar-counter-straight-180'] || {}, { seats: 4 });
Object.assign(ITEM_TEMPLATES['bar-counter-straight-240'] || {}, { seats: 6 });
Object.assign(ITEM_TEMPLATES['bar-counter-l-180x180'] || {}, { seats: 5 });
Object.assign(ITEM_TEMPLATES['bar-counter-island-180x90'] || {}, { seats: 6 });

// Добавляем шаблоны барных стоек с параметрами посадки
ITEM_TEMPLATES['bar-counter-straight'] = {
    label: 'Барная стойка',
    seats: 4,
    svg: () => `<g class="core"><rect class="shape" x="-110" y="-36" width="220" height="72" rx="12" fill="url(#wood-espresso)" stroke="#4a2d17"/><rect x="-104" y="-32" width="208" height="22" rx="8" fill="url(#counter-marble)" stroke="#c4c0bb"/><rect x="-110" y="8" width="220" height="16" rx="6" fill="#322218" opacity="0.4"/><path d="M-110 18 H110" stroke="url(#metal-steel)" stroke-width="4" stroke-linecap="round"/></g>`
};
ITEM_TEMPLATES['bar-counter-l'] = {
    label: 'Барная стойка Г',
    seats: 5,
    svg: () => `<g class="core"><path class="shape" transform="translate(-84, -54)" d="M0 12 C0 5.373 5.373 0 12 0 H168 C174.627 0 180 5.373 180 12 V44 H108 V126 C108 132.627 102.627 138 96 138 H60 V76 H12 C5.373 76 0 70.627 0 64 Z" fill="url(#wood-espresso)" stroke="#4a2d17"/><path transform="translate(-78, -48)" d="M0 18 C0 13.582 3.582 10 8 10 H160 C164.418 10 168 13.582 168 18 V34 H108 V116 C108 120.418 104.418 124 100 124 H68 V66 H8 C3.582 66 0 62.418 0 58 Z" fill="url(#counter-marble)" stroke="#c4c0bb"/><path d="M-84 22 H78" stroke="url(#metal-steel)" stroke-width="4" stroke-linecap="round"/><path d="M-20 70 H60" stroke="url(#metal-steel)" stroke-width="4" stroke-linecap="round"/></g>`
};
ITEM_TEMPLATES['bar-counter-island'] = {
    label: 'Барный остров',
    seats: 6,
    svg: () => `<g class="core"><rect class="shape" x="-96" y="-40" width="192" height="80" rx="14" fill="url(#wood-espresso)" stroke="#4a2d17"/><rect x="-90" y="-34" width="180" height="24" rx="10" fill="url(#counter-marble)" stroke="#c4c0bb"/><rect x="-82" y="6" width="164" height="20" rx="8" fill="#322218" opacity="0.35"/><path d="M-78 18 H78" stroke="url(#metal-steel)" stroke-width="4" stroke-linecap="round"/></g>`
};

// Расширяем список категорий добавлением секции для барных стоек
FURNITURE_CATEGORIES.push({
    name: 'Барные стойки',
    items: [
        { id: 'bar-counter-straight', label: 'Барная стойка' },
        { id: 'bar-counter-l', label: 'Барная стойка Г' },
        { id: 'bar-counter-island', label: 'Барный остров' }
    ]
});

