const FURNITURE_CATEGORIES = [
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
    'chair': { label: 'Стул', svg: () => `<g class="core" >
        <defs><linearGradient id="gradChairLeg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#C0C0C0;stop-opacity:1" /><stop offset="50%" style="stop-color:#F5F5F5;stop-opacity:1" /><stop offset="100%" style="stop-color:#C0C0C0;stop-opacity:1" /></linearGradient></defs>
        <rect x="-18" y="13" width="4" height="10" fill="url(#gradChairLeg)" stroke="#808080" />
        <rect x="14" y="13" width="4" height="10" fill="url(#gradChairLeg)" stroke="#808080" />
        <rect x="-18" y="-25" width="36" height="40" rx="6" fill="#D2B48C" stroke="#8B4513" />
        <rect x="-15" y="-1" width="30" height="12" rx="4" fill="#F5DEB3" stroke="#A0522D" />
        <rect x="-20" y="-22" width="40" height="10" rx="5" fill="#DEB887" stroke="#8B4513"/>
    </g>` },
    'armchair': { label: 'Кресло', svg: () => `<g class="core">
        <defs><linearGradient id="gradArmchair" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#A9A9A9;stop-opacity:1" /><stop offset="100%" style="stop-color:#696969;stop-opacity:1" /></linearGradient></defs>
        <rect x="-35" y="-32.5" width="70" height="65" rx="10" fill="url(#gradArmchair)" stroke="#404040" />
        <rect x="-25" y="-2.5" width="50" height="25" rx="5" fill="#D3D3D3" stroke="#808080" />
        <rect x="-30" y="-27.5" width="60" height="20" rx="8" fill="#C0C0C0" stroke="#708090" />
        <rect x="-30" y="-27.5" width="10" height="60" rx="8" fill="#B0C4DE" stroke="#708090" />
        <rect x="20" y="-27.5" width="10" height="60" rx="8" fill="#B0C4DE" stroke="#708090" />
    </g>` },
    'sofa-2': { label: 'Диван 2-местный', svg: () => `<g class="core">
        <defs><linearGradient id="gradSofa" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#6B8E23;stop-opacity:1" /><stop offset="100%" style="stop-color:#556B2F;stop-opacity:1" /></linearGradient></defs>
        <rect x="-75" y="-37.5" width="150" height="75" rx="12" fill="url(#gradSofa)" stroke="#2F4F4F"/>
        <rect x="-60" y="-2.5" width="55" height="30" rx="6" fill="#9ACD32" stroke="#6B8E23"/>
        <rect x="5" y="-2.5" width="55" height="30" rx="6" fill="#9ACD32" stroke="#6B8E23"/>
        <rect x="-67" y="-29.5" width="134" height="20" rx="8" fill="#8FBC8F" stroke="#556B2F"/>
        <rect x="-67" y="-29.5" width="12" height="60" rx="8" fill="#98FB98" stroke="#556B2F"/>
        <rect x="55" y="-29.5" width="12" height="60" rx="8" fill="#98FB98" stroke="#556B2F"/>
    </g>` },
    'sofa-3': { label: 'Диван 3-местный', svg: () => `<g class="core">
        <defs><linearGradient id="gradSofa3" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#4682B4;stop-opacity:1" /><stop offset="100%" style="stop-color:#4169E1;stop-opacity:1" /></linearGradient></defs>
        <rect x="-100" y="-37.5" width="200" height="75" rx="12" fill="url(#gradSofa3)" stroke="#191970"/>
        <rect x="-85" y="-2.5" width="50" height="30" rx="6" fill="#87CEEB" stroke="#4682B4"/>
        <rect x="-25" y="-2.5" width="50" height="30" rx="6" fill="#87CEEB" stroke="#4682B4"/>
        <rect x="35" y="-2.5" width="50" height="30" rx="6" fill="#87CEEB" stroke="#4682B4"/>
        <rect x="-92" y="-29.5" width="184" height="20" rx="8" fill="#B0E0E6" stroke="#4169E1"/>
        <rect x="-92" y="-29.5" width="12" height="60" rx="8" fill="#ADD8E6" stroke="#4169E1"/>
        <rect x="80" y="-29.5" width="12" height="60" rx="8" fill="#ADD8E6" stroke="#4169E1"/>
    </g>` },
    'sectional-l': { label: 'Диван угловой L', svg: () => `<g class="core"><path transform="translate(-100, -75)" class="shape" d="M0 12 C0 5.373 5.373 0 12 0 H188 C194.627 0 200 5.373 200 12 V75 H80 V150 H12 C5.373 150 0 144.627 0 138 V12 Z" fill="#696969" stroke="#404040"/></g>` },
    'stool': { label: 'Табурет', svg: () => `<g class="core"><circle class="shape" r="18" fill="url(#wood-grain)" stroke="#855a3c"/></g>` },
    'barstool': { label: 'Барный стул', svg: () => `<g class="core"><circle class="shape" r="18" fill="url(#wood-grain)" stroke="#855a3c"/><circle r="12" fill="none" stroke="#6c757d" stroke-width="2.5"/></g>` },
    'coffee-round': { label: 'Стол журнальный', svg: () => `<g class="core"><circle class="shape" r="35" fill="url(#wood-grain)" stroke="#855a3c"/></g>` },
    'coffee-rect': { label: 'Стол журнальный', svg: () => `<g class="core"><rect x="-45" y="-25" class="shape" width="90" height="50" rx="8" fill="url(#wood-grain)" stroke="#855a3c"/></g>` },
    'dining-4': { label: 'Стол обеденный', svg: () => `<g class="core"><rect x="-60" y="-40" class="shape" width="120" height="80" rx="6" fill="url(#wood-grain)" stroke="#855a3c"/></g>` },
    'dining-6': { label: 'Стол обеденный', svg: () => `<g class="core"><rect x="-80" y="-45" class="shape" width="160" height="90" rx="6" fill="url(#wood-grain)" stroke="#855a3c"/></g>` },
    'dining-8': { label: 'Стол обеденный', svg: () => `<g class="core"><rect x="-100" y="-45" class="shape" width="200" height="90" rx="6" fill="url(#wood-grain)" stroke="#855a3c"/></g>` },
    'desk': { label: 'Стол письменный', svg: () => `<g class="core"><rect x="-70" y="-35" class="shape" width="140" height="70" rx="6" fill="url(#wood-grain)" stroke="#855a3c"/></g>` },
    'workstation-l': { label: 'Рабочая станция L', svg: () => `<g class="core"><path transform="translate(-80, -65)" class="shape" d="M0 6 C0 2.686 2.686 0 6 0 H154 C157.314 0 160 2.686 160 6 V60 H100 V124 C100 127.314 97.314 130 94 130 H60 V70 H6 C2.686 70 0 67.314 0 64 V6 Z" fill="url(#wood-grain)" stroke="#855a3c"/></g>` },
    'office-chair': { label: 'Кресло офисное', svg: () => `<g class="core" transform="translate(-22, -25)">
        <path d="M11,50 L14,50 Q12,48 11,46 L11,50 M33,50 L30,50 Q32,48 33,46 L33,50 M18,50 L20,50 Q19,48 18,46 L18,50 M26,50 L24,50 Q25,48 26,46 L26,50" fill="#202020" />
        <path class="shape" d="M22,0 L22,4 L12,4 Q8,4 8,8 L8,36 Q8,40 12,40 L32,40 Q36,40 36,36 L36,8 Q36,4 32,4 L22,4 Z" fill="#495057" stroke="#212529"/>
        <path d="M4,12 L4,32 L8,32 L8,12 Z M40,12 L40,32 L36,32 L36,12 Z" fill="#606060" stroke="#212529"/>
        <path d="M11,46 L33,46 M22,42 V50 M14,42 L11,46 L14,50 M30,42 L33,46 L30,50 M18,42 L18,50 M26,42 L26,50" fill="none" stroke="#212529" stroke-width="2" stroke-linecap="round"/>
    </g>` },
    'reception': { label: 'Стойка-ресепшн', svg: () => `<g class="core"><rect x="-110" y="-40" class="shape" width="220" height="80" rx="6" fill="url(#wood-grain)" stroke="#855a3c"/><rect x="-110" y="-20" width="220" height="60" rx="6" fill="#f8f9fa" stroke="#ced4da"/></g>` },
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
    'kitchen-line': { label: 'Кухонный модуль', svg: () => `<g class="core"><rect x="-90" y="-30" class="shape" width="180" height="60" rx="6" fill="#f8f9fa" stroke="#ced4da"/>${[-85,-25,35].map(x=>`<rect x="${x}" y="-25" width="50" height="50" rx="4" fill="#e9ecef" stroke="#ced4da"/>`).join('')}</g>` },
    'sink': { label: 'Мойка', svg: () => `<g class="core" transform="translate(-35, -25)">
        <rect class="shape" width="70" height="50" rx="6" fill="#E0E0E0" stroke="#A0A0A0"/>
        <rect x="8" y="8" width="54" height="34" rx="4" fill="#FFFFFF" stroke="#C0C0C0"/>
        <rect x="48" y="10" width="12" height="6" fill="#C0C0C0" stroke="#808080"/>
        <rect x="52" y="16" width="4" height="10" fill="#C0C0C0" stroke="#808080"/>
        <circle cx="35" cy="25" r="3" fill="#6c757d" opacity="0.5"/>
    </g>` },
    'cooktop-4': { label: 'Варочная панель', svg: () => `<g class="core" transform="translate(-30, -27.5)">
        <rect class="shape" width="60" height="55" rx="6" fill="#101010" stroke="#303030"/>
        ${[18,42].map(x=>[15,38].map(y=>`<circle cx="${x}" cy="${y}" r="8" fill="#202020" stroke="#404040"/>`).join('')).join('')}
    </g>` },
    'fridge': { label: 'Холодильник', svg: () => `<g class="core"><rect x="-35" y="-32.5" class="shape" width="70" height="65" rx="6" fill="#F5F5F5" stroke="#A9A9A9"/><path d="M-30 0 H30" stroke="#A9A9A9"/><rect x="25" y="-24.5" width="3" height="15" rx="1.5" fill="#D3D3D3"/><rect x="25" y="7.5" width="3" height="15" rx="1.5" fill="#D3D3D3"/></g>` },
    'oven': { label: 'Духовка', svg: () => `<g class="core"><rect x="-30" y="-30" class="shape" width="60" height="60" rx="6" fill="#C0C0C0" stroke="#808080"/><rect x="-20" y="-18" width="40" height="24" rx="3" fill="#212529" stroke="#495057"/><path d="M-20 -22 H20" stroke="#A9A9A9" stroke-width="2.5"/></g>` },
    'microwave': { label: 'Микроволновка', svg: () => `<g class="core"><rect x="-27.5" y="-17.5" class="shape" width="55" height="35" rx="4" fill="#F5F5F5" stroke="#A9A9A9"/><rect x="-19.5" y="-9.5" width="28" height="19" rx="2" fill="#212529"/><rect x="12.5" y="-7.5" width="8" height="15" rx="2" fill="#DCDCDC"/></g>` },
    'dishwasher': { label: 'Посудомойка', svg: () => `<g class="core"><rect x="-30" y="-30" class="shape" width="60" height="60" rx="6" fill="#E8E8E8" stroke="#A8A8A8"/><path d="M-20 -22 H20" stroke="#C8C8C8" stroke-width="2.5"/></g>` },
    'island': { label: 'Кухонный остров', svg: () => `<g class="core"><rect x="-75" y="-45" class="shape" width="150" height="90" rx="8" fill="url(#wood-grain)" stroke="#855a3c"/><rect x="-65" y="-35" width="130" height="70" fill="#F8F8FF" stroke="#DCDCDC" rx="4"/></g>` },
    'toilet': { label: 'Туалет', svg: () => `<g class="core" transform="translate(-20, -30)">
        <path class="shape" d="M5 10 H35 C37.761 10 40 12.239 40 15 V55 C40 57.761 37.761 60 35 60 H5 C2.239 60 0 57.761 0 55 V15 C0 12.239 2.239 10 5 10 Z" fill="#F8F8FF" stroke="#DCDCDC"/>
        <rect x="5" y="0" width="30" height="15" rx="4" fill="#E6E6FA" stroke="#D8BFD8"/>
        <ellipse cx="20" cy="38" rx="12" ry="15" fill="#FFFFFF" stroke="#DCDCDC"/>
    </g>` },
    'bath-sink': { label: 'Раковина', svg: () => `<g class="core"><rect x="-30" y="-22.5" class="shape" width="60" height="45" rx="8" fill="#F8F8FF" stroke="#DCDCDC"/><ellipse cx="0" cy="0" rx="18" ry="12" fill="#FFFFFF" stroke="#E0E0E0"/><circle r="3" fill="#6c757d"/></g>` },
    'shower': { label: 'Душ', svg: () => `<g class="core"><rect x="-45" y="-45" class="shape" width="90" height="90" rx="2" fill="#F0FFFF" stroke="#B0E0E6"/><path d="M-45 45 L45 -45" stroke="#E0FFFF"/><circle cx="-30" cy="-30" r="5" fill="#C0C0C0"/></g>` },
    'bathtub': { label: 'Ванна', svg: () => `<g class="core"><rect x="-75" y="-35" class="shape" width="150" height="70" rx="35" fill="#F8F8FF" stroke="#DCDCDC"/><ellipse cx="0" cy="0" rx="68" ry="28" fill="#FFFFFF" stroke="#E0E0E0"/></g>` },
    'washer': { label: 'Стиральная машина', svg: () => `<g class="core"><rect x="-30" y="-30" class="shape" width="60" height="60" rx="6" fill="#F8F8FF" stroke="#DCDCDC"/><circle cy="2" r="16" fill="#E0E0E0" stroke="#A0A0A0"/><circle cy="2" r="12" fill="rgba(0,0,0,0.1)"/></g>` },
    'dryer': { label: 'Сушильная машина', svg: () => `<g class="core"><rect x="-30" y="-30" class="shape" width="60" height="60" rx="6" fill="#F8F8FF" stroke="#DCDCDC"/><circle cy="2" r="16" fill="#E0E0E0" stroke="#A0A0A0"/></g>` },
    'water-cooler': { label: 'Кулер для воды', svg: () => `<g class="core"><rect x="-17.5" y="-50" class="shape" width="35" height="100" rx="6" fill="#F8F8FF" stroke="#DCDCDC"/><circle cy="-34" r="12" fill="#87CEEB" stroke="#4682B4"/><rect x="-7.5" y="-5" width="15" height="10" fill="#DCDCDC"/></g>` },
    'tv-stand': { label: 'ТВ-тумба', svg: () => `<g class="core"><rect x="-70" y="-20" class="shape" width="140" height="40" rx="6" fill="url(#wood-grain)" stroke="#855a3c"/></g>` },
    'tv-wall': { label: 'ТВ настенный', svg: () => `<g class="core"><rect x="-70" y="-40" class="shape" width="140" height="80" rx="6" fill="#202020" stroke="#000"/><rect x="-60" y="-30" width="120" height="60" rx="2" fill="#000" stroke="#303030"/></g>` },
    'projector': { label: 'Проектор', svg: () => `<g class="core"><rect x="-25" y="-15" class="shape" width="50" height="30" rx="6" fill="#F5F5F5" stroke="#DCDCDC"/><circle cx="10" r="8" fill="#212529" stroke="#495057"/></g>` },
    'projection-screen': { label: 'Экран проектора', svg: () => `<g class="core"><rect x="-90" y="-55" class="shape" width="180" height="10" rx="3" fill="#212529"/><rect x="-90" y="-45" width="180" height="100" fill="#FFFFFF" stroke="#DCDCDC"/></g>` },
    'ac-indoor': { label: 'Кондиционер', svg: () => `<g class="core"><rect x="-50" y="-15" class="shape" width="100" height="30" rx="6" fill="#FFFFFF" stroke="#DCDCDC"/><path d="M-40 7 H40" stroke="#E8E8E8"/></g>` },
    'radiator': { label: 'Радиатор', svg: () => `<g class="core"><rect x="-60" y="-12.5" class="shape" width="120" height="25" rx="4" fill="#F8F8FF" stroke="#DCDCDC"/>${[-50,-35,-20,-5,10,25,40].map(x=>`<path d="M${x} -8.5 V8.5" stroke="#DCDCDC" stroke-width="2"/>`).join('')}</g>` },
    'plant': { label: 'Растение', svg: () => `<g class="core">
        <defs><linearGradient id="gradPlantPot" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#CD853F" /><stop offset="100%" stop-color="#8B4513" /></linearGradient></defs>
        <path d="M-20,0 L20,0 L15,30 L-15,30 Z" fill="url(#gradPlantPot)" stroke="#5C3317" />
        <path d="M0-30 C-20,-20 -10,-40 0,0 C10,-40 20,-20 0,-30 M-10,-25 C-30,-15 -20,-35 -10,-5 C0,-35 10,-15 -10,-25 M10,-25 C30,-15 20,-35 10,-5 C0,-35 -10,-15 10,-25" fill="#228B22" stroke="#006400" />
    </g>` },
    'floor-lamp': { label: 'Торшер', svg: () => `<g class="core" transform="translate(0, -25)">
        <circle r="10" cy="20" fill="#DCDCDC" stroke="#A9A9A9"/>
        <path d="M0 -13 V 15" stroke="#808080"/>
        <path d="M-14,-13 L14,-13 L20,-40 L-20,-40 Z" fill="#FFFFE0" stroke="#F0E68C"/>
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

// Добавляем шаблоны барных стоек с параметрами посадки
ITEM_TEMPLATES['bar-counter-straight'] = {
    label: 'Барная стойка',
    seats: 4,
    svg: () => `<g class="core"><rect x="-100" y="-25" class="shape" width="200" height="50" rx="8" fill="url(#wood-grain)" stroke="#855a3c"/></g>`
};
ITEM_TEMPLATES['bar-counter-l'] = {
    label: 'Барная стойка Г',
    seats: 5,
    svg: () => `<g class="core"><path transform="translate(-80, -50)" class="shape" d="M0 6 C0 2.686 2.686 0 6 0 H160 C162.314 0 165 2.686 165 6 V40 H100 V110 C100 112.314 97.314 115 94 115 H60 V50 H6 C2.686 50 0 47.314 0 44 V6 Z" fill="url(#wood-grain)" stroke="#855a3c"/></g>`
};
ITEM_TEMPLATES['bar-counter-island'] = {
    label: 'Барный остров',
    seats: 6,
    svg: () => `<g class="core"><rect x="-90" y="-35" class="shape" width="180" height="70" rx="8" fill="url(#wood-grain)" stroke="#855a3c"/></g>`
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

