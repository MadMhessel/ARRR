const PLAN_LIBRARY = {};

function defineItem(id, config) {
  PLAN_LIBRARY[id] = config;
}

[
  ['zone', {
    label: 'Зона помещения 200×150',
    builder: 'zone',
    width: 200,
    depth: 150,
    scaleStepCm: 50
  }],
  ['sofa-2seat-200', {
    label: 'Диван 2-местный 200×95',
    builder: 'sofa',
    width: 200,
    depth: 95,
    seats: 2,
    opts: { segments: 2 }
  }],
  ['sofa-3seat-240', {
    label: 'Диван 3-местный 240×100',
    builder: 'sofa',
    width: 240,
    depth: 100,
    seats: 3,
    opts: { segments: 3 }
  }],
  ['sofa-l-260x180', {
    label: 'Диван угловой 260×180',
    builder: 'sofaL',
    width: 260,
    depth: 180,
    seats: 4,
    opts: { chaiseRatio: 0.45, backDepthRatio: 0.58, segments: 2 }
  }],
  ['chair-armchair-90', {
    label: 'Кресло 90×90',
    builder: 'armchair',
    width: 90,
    depth: 90,
    seats: 1
  }],
  ['chair-side-45x45', {
    label: 'Стул 45×45',
    builder: 'chair',
    width: 45,
    depth: 45,
    seats: 1
  }],
  ['seat-banquette-160x60', {
    label: 'Банкетка 160×60',
    builder: 'banquette',
    width: 160,
    depth: 60,
    seats: 3
  }],
  ['seat-banquette-corner-180x180', {
    label: 'Банкетка угловая 180×180',
    builder: 'banquetteCorner',
    width: 180,
    depth: 180,
    seats: 4,
    opts: { seatDepth: 50 }
  }],
  ['seat-banquette-120x60', {
    label: 'Банкетка 120×60',
    builder: 'banquette',
    width: 120,
    depth: 60,
    seats: 2
  }],
  ['seat-booth-2-150x120', {
    label: 'Кабинка на 2 150×120',
    builder: 'booth',
    width: 150,
    depth: 120,
    seats: 2,
    opts: { tableWidthRatio: 0.32 }
  }],
  ['seat-booth-4-220x140', {
    label: 'Кабинка на 4 220×140',
    builder: 'booth',
    width: 220,
    depth: 140,
    seats: 4,
    opts: { tableWidthRatio: 0.32 }
  }],
  ['table-coffee-round-80', {
    label: 'Журнальный стол Ø80',
    builder: 'tableRound',
    width: 80,
    depth: 80,
    opts: { cross: false }
  }],
  ['table-coffee-rect-120x60', {
    label: 'Журнальный стол 120×60',
    builder: 'tableRect',
    width: 120,
    depth: 60,
    opts: { cross: false, cornerRadius: 10 }
  }],
  ['storage-media-180x40', {
    label: 'Медиа-тумба 180×40',
    builder: 'storage',
    width: 180,
    depth: 40,
    opts: { shelves: [0], dividers: [0.33, 0.66], radius: 8 }
  }],
  ['decor-rug-200x140', {
    label: 'Ковёр 200×140',
    builder: 'rug',
    width: 200,
    depth: 140,
    scaleStepCm: 10
  }],
  ['decor-plant-60', {
    label: 'Растение Ø60',
    builder: 'plant',
    width: 60,
    depth: 60,
    scaleStepCm: 10
  }],
  ['decor-floorlamp-45x45', {
    label: 'Торшер 45×45',
    builder: 'floorLamp',
    width: 45,
    depth: 45
  }],
  ['table-round-60', {
    label: 'Стол круглый Ø60',
    builder: 'tableRound',
    width: 60,
    depth: 60,
    seats: 2
  }],
  ['table-round-70', {
    label: 'Стол круглый Ø70',
    builder: 'tableRound',
    width: 70,
    depth: 70,
    seats: 3
  }],
  ['table-round-80', {
    label: 'Стол круглый Ø80',
    builder: 'tableRound',
    width: 80,
    depth: 80,
    seats: 4
  }],
  ['table-square-70', {
    label: 'Стол квадратный 70×70',
    builder: 'tableRect',
    width: 70,
    depth: 70,
    seats: 4,
    opts: { cornerRadius: 8 }
  }],
  ['table-rect-120x70', {
    label: 'Стол 120×70',
    builder: 'tableRect',
    width: 120,
    depth: 70,
    seats: 4,
    opts: { cornerRadius: 10 }
  }],
  ['table-rect-160x80', {
    label: 'Стол 160×80',
    builder: 'tableRect',
    width: 160,
    depth: 80,
    seats: 6,
    opts: { cornerRadius: 12 }
  }],
  ['table-rect-200x100', {
    label: 'Стол 200×100',
    builder: 'tableRect',
    width: 200,
    depth: 100,
    seats: 8,
    opts: { cornerRadius: 12 }
  }],
  ['table-rect-240x90', {
    label: 'Стол 240×90',
    builder: 'tableRect',
    width: 240,
    depth: 90,
    seats: 10,
    opts: { cornerRadius: 12 }
  }],
  ['table-hightop-round-70', {
    label: 'Хай-топ Ø70',
    builder: 'tableRound',
    width: 70,
    depth: 70,
    seats: 3,
    opts: { highTop: true }
  }],
  ['table-work-160x80', {
    label: 'Рабочий стол 160×80',
    builder: 'tableRect',
    width: 160,
    depth: 80,
    seats: 2,
    opts: { centerLine: 'horizontal', cornerRadius: 10 }
  }],
  ['stool-round-35', {
    label: 'Табурет Ø35',
    builder: 'stoolRound',
    width: 35,
    depth: 35,
    seats: 1
  }],
  ['stool-bar-35x35', {
    label: 'Барный табурет 35×35',
    builder: 'stoolSquare',
    width: 35,
    depth: 35,
    seats: 1
  }],
  ['counter-straight-180', {
    label: 'Столешница прямая 180×60',
    builder: 'counterStraight',
    width: 180,
    depth: 60,
    scaleStepCm: 10
  }],
  ['counter-straight-240', {
    label: 'Столешница прямая 240×60',
    builder: 'counterStraight',
    width: 240,
    depth: 60,
    scaleStepCm: 10
  }],
  ['counter-l-180x180', {
    label: 'Столешница Г-образная 180×180',
    builder: 'counterL',
    width: 180,
    depth: 180,
    opts: { thickness: 60 }
  }],
  ['counter-island-180x90', {
    label: 'Остров 180×90',
    builder: 'counterIsland',
    width: 180,
    depth: 90
  }],
  ['counter-back-180x40', {
    label: 'Барная задняя линия 180×40',
    builder: 'counterBack',
    width: 180,
    depth: 40
  }],
  ['partition-linear-120x10', {
    label: 'Перегородка 120×10',
    builder: 'partitionLine',
    width: 120,
    depth: 10,
    scaleStepCm: 5
  }],
  ['kitchen-sink-60x60', {
    label: 'Мойка 60×60',
    builder: 'sink',
    width: 60,
    depth: 60,
    opts: { basins: [{ cx: 0, cy: 0, rx: 18, ry: 18 }], faucet: true }
  }],
  ['kitchen-handsink-50x50', {
    label: 'Раковина для рук 50×50',
    builder: 'sink',
    width: 50,
    depth: 50,
    opts: { basins: [{ cx: 0, cy: 0, rx: 14, ry: 14 }], faucet: true }
  }],
  ['utility-mopsink-60x60', {
    label: 'Мойка для швабры 60×60',
    builder: 'mopSink',
    width: 60,
    depth: 60
  }],
  ['utility-floor-drain-15x15', {
    label: 'Половой трап 15×15',
    builder: 'floorDrain',
    width: 15,
    depth: 15,
    scaleStepCm: 5
  }],
  ['kitchen-triple-sink-180x60', {
    label: 'Мойка тройная 180×60',
    builder: 'sink',
    width: 180,
    depth: 60,
    opts: {
      basins: [
        { cx: -50, cy: 0, rx: 18, ry: 18 },
        { cx: 0, cy: 0, rx: 18, ry: 18 },
        { cx: 50, cy: 0, rx: 18, ry: 18 }
      ],
      faucet: true
    }
  }],
  ['kitchen-cooktop-60x60', {
    label: 'Варочная панель 60×60',
    builder: 'cooktop',
    width: 60,
    depth: 60
  }],
  ['kitchen-oven-60x60', {
    label: 'Духовой шкаф 60×60',
    builder: 'appliance',
    width: 60,
    depth: 60,
    opts: { innerHeightRatio: 0.4, innerAlign: 'center', horizontal: [0.2, -0.2] }
  }],
  ['appliance-dishwasher-60x60', {
    label: 'Посудомоечная 60×60',
    builder: 'appliance',
    width: 60,
    depth: 60,
    opts: { innerHeightRatio: 0.35, innerAlign: 'bottom', horizontal: [0] }
  }],
  ['appliance-fridge-60x70', {
    label: 'Холодильник 60×70',
    builder: 'appliance',
    width: 60,
    depth: 70,
    opts: { inner: false, horizontal: [0] }
  }],
  ['appliance-undercounter-60x60', {
    label: 'Холодильник подстольный 60×60',
    builder: 'appliance',
    width: 60,
    depth: 60,
    opts: { innerAlign: 'top', innerHeightRatio: 0.28, vertical: [0.3], horizontal: [0.15] }
  }],
  ['appliance-upright-70x70', {
    label: 'Холодильник напольный 70×70',
    builder: 'appliance',
    width: 70,
    depth: 70,
    opts: { inner: false, horizontal: [0.25, -0.25], handle: { side: 'right' } }
  }],
  ['appliance-freezer-60x60', {
    label: 'Морозильник 60×60',
    builder: 'appliance',
    width: 60,
    depth: 60,
    opts: { inner: false, horizontal: [0] }
  }],
  ['appliance-milk-60x60', {
    label: 'Молочный холодильник 60×60',
    builder: 'appliance',
    width: 60,
    depth: 60,
    opts: { inner: false, horizontal: [-0.1, 0.2] }
  }],
  ['appliance-display-120x60', {
    label: 'Витрина 120×60',
    builder: 'appliance',
    width: 120,
    depth: 60,
    opts: { inner: false, horizontal: [0.18, -0.18], frontArcs: [{ offset: -30 }, { offset: 30 }] }
  }],
  ['appliance-espresso-80x60', {
    label: 'Эспрессо-машина 2 гр. 80×60',
    builder: 'appliance',
    width: 80,
    depth: 60,
    opts: { innerHeightRatio: 0.3, innerAlign: 'top', vertical: [0], horizontal: [-0.15], frontArcs: [{ offset: -20 }, { offset: 20 }] }
  }],
  ['appliance-espresso-110x60', {
    label: 'Эспрессо-машина 3 гр. 110×60',
    builder: 'appliance',
    width: 110,
    depth: 60,
    opts: { innerHeightRatio: 0.3, innerAlign: 'top', vertical: [-0.25, 0.25], horizontal: [-0.15], frontArcs: [{ offset: -35 }, { offset: 0 }, { offset: 35 }] }
  }],
  ['appliance-batchbrew-80x45', {
    label: 'Бэтч-брю 80×45',
    builder: 'appliance',
    width: 80,
    depth: 45,
    opts: { innerHeightRatio: 0.28, innerAlign: 'top', horizontal: [0], vertical: [-0.2, 0.2], circles: [
      { cx: -17.6, cy: -2.25, radius: 9.6 },
      { cx: 17.6, cy: -2.25, radius: 9.6 }
    ] }
  }],
  ['appliance-pourover-120x40', {
    label: 'Пуровер-станция 120×40',
    builder: 'appliance',
    width: 120,
    depth: 40,
    opts: { inner: false, vertical: [-0.33, 0, 0.33], circles: [
      { cx: -33.6, cy: 0, radius: 9.6 },
      { cx: 33.6, cy: 0, radius: 9.6 }
    ] }
  }],
  ['appliance-grinder-30x30', {
    label: 'Кофемолка 30×30',
    builder: 'grinder',
    width: 30,
    depth: 30
  }],
  ['appliance-kettle-30x30', {
    label: 'Электрочайник 30×30',
    builder: 'appliance',
    width: 30,
    depth: 30,
    opts: { inner: false, circle: { radius: 8 } }
  }],
  ['appliance-filter-40x30', {
    label: 'Фильтр 40×30',
    builder: 'appliance',
    width: 40,
    depth: 30,
    opts: { innerHeightRatio: 0.4, innerAlign: 'center' }
  }],
  ['appliance-ice-60x60', {
    label: 'Льдогенератор 60×60',
    builder: 'appliance',
    width: 60,
    depth: 60,
    opts: { innerHeightRatio: 0.3, innerAlign: 'top', horizontal: [0.2] }
  }],
  ['appliance-counter-60x40', {
    label: 'Модуль на столе 60×40',
    builder: 'appliance',
    width: 60,
    depth: 40,
    opts: { innerHeightRatio: 0.4, innerAlign: 'center', vertical: [0] }
  }],
  ['appliance-pos-35x35', {
    label: 'POS-терминал',
    builder: 'appliance',
    width: 35,
    depth: 35,
    opts: { innerHeightRatio: 0.3, innerAlign: 'top', horizontal: [0] }
  }],
  ['appliance-cashdrawer-45x35', {
    label: 'Денежный ящик 45×35',
    builder: 'appliance',
    width: 45,
    depth: 35,
    opts: { innerHeightRatio: 0.3, innerAlign: 'bottom', horizontal: [0] }
  }],
  ['fixture-condiment-120x35', {
    label: 'Станция приправ 120×35',
    builder: 'appliance',
    width: 120,
    depth: 35,
    opts: { inner: false, vertical: [-0.3, 0, 0.3] }
  }],
  ['fixture-syrup-90x30', {
    label: 'Рейл сиропов 90×30',
    builder: 'appliance',
    width: 90,
    depth: 30,
    opts: { inner: false, vertical: [-0.25, 0.25] }
  }],
  ['fixture-trash-40x40', {
    label: 'Урна 40×40',
    builder: 'appliance',
    width: 40,
    depth: 40,
    opts: { inner: false, horizontal: [0], paths: [{ d: 'M -16 -14 Q 0 -22 16 -14' }] }
  }],
  ['fixture-trash-80x40', {
    label: 'Урна двойная 80×40',
    builder: 'appliance',
    width: 80,
    depth: 40,
    opts: { inner: false, vertical: [0], horizontal: [0], paths: [
      { d: 'M -36 -14 Q -20 -22 -4 -14' },
      { d: 'M 4 -14 Q 20 -22 36 -14' }
    ] }
  }],
  ['fixture-drying-120x40', {
    label: 'Сушка 120×40',
    builder: 'appliance',
    width: 120,
    depth: 40,
    opts: { inner: false, horizontal: [0] }
  }],
  ['fixture-queuepost-35', {
    label: 'Стойка очереди Ø35',
    builder: 'queuePost',
    width: 35,
    depth: 35
  }],
  ['fixture-menuboard-120x10', {
    label: 'Меню-борд 120×10',
    builder: 'menuBoard',
    width: 120,
    depth: 10
  }],
  ['decor-planter-120x30', {
    label: 'Кашпо 120×30',
    builder: 'planter',
    width: 120,
    depth: 30
  }],
  ['bed-single-90x200', {
    label: 'Кровать односп. 90×200',
    builder: 'bed',
    width: 90,
    depth: 200,
    scaleStepCm: 10,
    seats: 1,
    opts: { pillows: 1 }
  }],
  ['bed-double-160x200', {
    label: 'Кровать двусп. 160×200',
    builder: 'bed',
    width: 160,
    depth: 200,
    scaleStepCm: 10,
    seats: 2,
    opts: { pillows: 2 }
  }],
  ['bed-queen-180x200', {
    label: 'Кровать двусп. 180×200',
    builder: 'bed',
    width: 180,
    depth: 200,
    scaleStepCm: 10,
    seats: 2,
    opts: { pillows: 2 }
  }],
  ['storage-nightstand-50x40', {
    label: 'Тумба 50×40',
    builder: 'storage',
    width: 50,
    depth: 40,
    opts: { shelves: [0], radius: 6 }
  }],
  ['storage-wardrobe-120x60', {
    label: 'Шкаф 120×60',
    builder: 'storage',
    width: 120,
    depth: 60,
    opts: { dividers: [0.5], shelves: [0.2, -0.2], radius: 10 }
  }],
  ['storage-wardrobe-180x60', {
    label: 'Шкаф 180×60',
    builder: 'storage',
    width: 180,
    depth: 60,
    opts: { dividers: [0.33, 0.66], shelves: [0.2, -0.2], radius: 10 }
  }],
  ['storage-shelving-120x40', {
    label: 'Стеллаж 120×40',
    builder: 'storage',
    width: 120,
    depth: 40,
    opts: { shelves: [0.3, 0, -0.3], radius: 8 }
  }],
  ['bath-bathtub-170x75', {
    label: 'Ванна 170×75',
    builder: 'bathtub',
    width: 170,
    depth: 75
  }],
  ['bath-shower-90x90', {
    label: 'Душ 90×90',
    builder: 'shower',
    width: 90,
    depth: 90
  }],
  ['bath-toilet-38x70', {
    label: 'Унитаз 38×70',
    builder: 'toilet',
    width: 38,
    depth: 70
  }],
  ['bath-sink-60x50', {
    label: 'Раковина 60×50',
    builder: 'sink',
    width: 60,
    depth: 50,
    opts: { basins: [{ cx: 0, cy: 0, rx: 16, ry: 16 }], faucet: true }
  }],
  ['appliance-washer-60x60', {
    label: 'Стиральная машина 60×60',
    builder: 'washer',
    width: 60,
    depth: 60
  }],
  ['appliance-dryer-60x60', {
    label: 'Сушильная машина 60×60',
    builder: 'washer',
    width: 60,
    depth: 60,
    opts: { innerCircle: 16 }
  }],
  ['fixture-watercooler-40x60', {
    label: 'Кулер 40×60',
    builder: 'watercooler',
    width: 40,
    depth: 60
  }],
  ['climate-radiator-120x12', {
    label: 'Радиатор 120×12',
    builder: 'radiator',
    width: 120,
    depth: 12
  }],
  ['climate-ac-100x30', {
    label: 'Кондиционер 100×30',
    builder: 'ac',
    width: 100,
    depth: 30
  }],
  ['fixture-tv-180x20', {
    label: 'ТВ панель 180×20',
    builder: 'tv',
    width: 180,
    depth: 20
  }],
  ['fixture-projector-40x40', {
    label: 'Проектор 40×40',
    builder: 'projector',
    width: 40,
    depth: 40
  }],
  ['fixture-screen-240x10', {
    label: 'Экран 240×10',
    builder: 'screen',
    width: 240,
    depth: 10,
    scaleStepCm: 10
  }],
  ['chair-office-70x70', {
    label: 'Офисное кресло 70×70',
    builder: 'armchair',
    width: 70,
    depth: 70,
    seats: 1,
    opts: { compact: true }
  }],
  ['counter-reception-200x80', {
    label: 'Ресепшен 200×80',
    builder: 'counterStraight',
    width: 200,
    depth: 80,
    opts: { edgeOffset: 0.25 }
  }],
  ['fixture-whiteboard-180x10', {
    label: 'Доска 180×10',
    builder: 'whiteboard',
    width: 180,
    depth: 10
  }],
  ['appliance-printer-60x45', {
    label: 'Принтер 60×45',
    builder: 'appliance',
    width: 60,
    depth: 45,
    opts: { innerHeightRatio: 0.35, innerAlign: 'center', horizontal: [-0.15, 0.15] }
  }],
  ['appliance-copier-70x60', {
    label: 'Ксерокс 70×60',
    builder: 'appliance',
    width: 70,
    depth: 60,
    opts: { innerHeightRatio: 0.3, innerAlign: 'center', horizontal: [-0.2, 0.2] }
  }],
  ['appliance-server-70x70', {
    label: 'Серверная стойка 70×70',
    builder: 'appliance',
    width: 70,
    depth: 70,
    opts: { inner: false, horizontal: [-0.3, -0.1, 0.1, 0.3] }
  }]
].forEach(([id, config]) => defineItem(id, config));

const CATEGORY_ITEMS = {
  'Помещение': ['zone'],
  'Посадка гостей': [
    'table-round-60',
    'table-round-70',
    'table-round-80',
    'table-rect-120x70',
    'table-rect-160x80',
    'table-rect-200x100',
    'table-rect-240x90',
    'table-hightop-round-70',
    'table-work-160x80',
    'chair-side-45x45',
    'stool-round-35',
    'stool-bar-35x35',
    'seat-banquette-120x60',
    'seat-banquette-160x60',
    'seat-banquette-corner-180x180',
    'seat-booth-2-150x120',
    'seat-booth-4-220x140'
  ],
  'Бар и кухонная линия': [
    'counter-straight-180',
    'counter-straight-240',
    'counter-l-180x180',
    'counter-island-180x90',
    'counter-back-180x40',
    'partition-linear-120x10'
  ],
  'Оборудование кофе-бара': [
    'appliance-espresso-80x60',
    'appliance-espresso-110x60',
    'appliance-grinder-30x30',
    'appliance-batchbrew-80x45',
    'appliance-pourover-120x40',
    'appliance-dishwasher-60x60',
    'appliance-undercounter-60x60',
    'appliance-display-120x60',
    'appliance-milk-60x60',
    'appliance-ice-60x60',
    'appliance-counter-60x40',
    'appliance-pos-35x35',
    'appliance-cashdrawer-45x35',
    'fixture-condiment-120x35',
    'fixture-syrup-90x30'
  ],
  'Сантехника и уборка': [
    'kitchen-sink-60x60',
    'kitchen-handsink-50x50',
    'utility-mopsink-60x60',
    'utility-floor-drain-15x15',
    'kitchen-triple-sink-180x60',
    'bath-sink-60x50',
    'bath-toilet-38x70',
    'bath-shower-90x90',
    'appliance-washer-60x60',
    'appliance-dryer-60x60'
  ],
  'Хранение и инфраструктура': [
    'appliance-fridge-60x70',
    'appliance-upright-70x70',
    'appliance-freezer-60x60',
    'storage-shelving-120x40',
    'storage-wardrobe-120x60',
    'storage-wardrobe-180x60',
    'fixture-trash-40x40',
    'fixture-trash-80x40',
    'fixture-drying-120x40',
    'fixture-watercooler-40x60',
    'decor-plant-60',
    'decor-planter-120x30'
  ],
  'Сервис и оформление': [
    'fixture-queuepost-35',
    'fixture-menuboard-120x10',
    'decor-floorlamp-45x45',
    'table-coffee-round-80',
    'table-coffee-rect-120x60',
    'storage-media-180x40'
  ]
};

const FURNITURE_CATEGORIES = Object.entries(CATEGORY_ITEMS).map(([name, ids]) => ({
  name,
  items: ids.map(id => ({ id, label: PLAN_LIBRARY[id]?.label || id }))
}));

const ITEM_TEMPLATES = {};

function fmt(num) {
  if (!Number.isFinite(num)) return '0';
  const value = Math.round(num * 100) / 100;
  if (Object.is(value, -0)) return '0';
  return value.toString();
}

function join(parts) {
  return parts.filter(Boolean).join('');
}

function rect(width, height, options = {}) {
  const { x = 0, y = 0, radius = 0, className = 'shape' } = options;
  const x0 = x - width / 2;
  const y0 = y - height / 2;
  const rx = radius ? ` rx="${fmt(radius)}"` : '';
  return `<rect x="${fmt(x0)}" y="${fmt(y0)}" width="${fmt(width)}" height="${fmt(height)}"${rx} class="${className}"/>`;
}

function circle(radius, options = {}) {
  const { cx = 0, cy = 0, className = 'shape' } = options;
  return `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(radius)}" class="${className}"/>`;
}

function ellipse(rx, ry, options = {}) {
  const { cx = 0, cy = 0, className = 'shape' } = options;
  return `<ellipse cx="${fmt(cx)}" cy="${fmt(cy)}" rx="${fmt(rx)}" ry="${fmt(ry)}" class="${className}"/>`;
}

function line(x1, y1, x2, y2, className = 'shape-detail') {
  return `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" class="${className}"/>`;
}

function path(d, className = 'shape shape-fill') {
  return `<path d="${d}" class="${className}"/>`;
}

function registerTemplate(id, config) {
  const builder = typeof config.builder === 'function' ? config.builder : BUILDERS[config.builder];
  if (!builder) throw new Error(`Unknown builder: ${config.builder}`);
  const context = { id, label: config.label, width: config.width, depth: config.depth, opts: config.opts || {} };
  const render = variant => builder({ ...context, variant });
  const template = {
    label: config.label,
    baseSize: { width: config.width, height: config.depth },
    scaleStepCm: config.scaleStepCm || 5,
    svg: () => `<g class="core" data-id="${id}">${render('rich')}</g>`,
    schematicSvg: () => `<g class="core schematic-only" data-id="${id}">${render('schematic')}</g>`
  };
  if (config.seats) template.seats = config.seats;
  ITEM_TEMPLATES[id] = template;
}
function buildZone({ width, depth }) {
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.12 }),
    line(0, -depth / 2, 0, depth / 2, 'furn-center')
  ]);
}

function buildSofa({ width, depth, opts = {} }) {
  const segments = Math.max(1, opts.segments || 2);
  const radius = Math.min(width, depth) * 0.15;
  const seatDepth = depth * 0.58;
  const seatCenterY = depth * 0.12;
  const inset = Math.min(width, depth) * 0.12;
  const backHeight = depth * 0.25;
  const seatHeight = seatDepth - inset * 0.6;
  const parts = [
    rect(width, depth, { className: 'shape shape-fill', radius }),
    rect(width - inset, seatHeight, { className: 'shape-detail', y: seatCenterY }),
    rect(width, backHeight, { className: 'shape-detail', y: -depth / 2 + backHeight / 2 })
  ];
  const seatTop = seatCenterY - seatHeight / 2;
  const seatBottom = seatCenterY + seatHeight / 2;
  for (let i = 1; i < segments; i += 1) {
    const x = -width / 2 + (width / segments) * i;
    parts.push(line(x, seatTop, x, seatBottom));
  }
  return join(parts);
}

function buildSofaL({ width, depth, opts = {} }) {
  const chaiseRatio = opts.chaiseRatio ?? 0.45;
  const backDepthRatio = opts.backDepthRatio ?? 0.58;
  const chaiseWidth = width * chaiseRatio;
  const mainDepth = depth * backDepthRatio;
  const thickness = Math.min(width, depth) * 0.12;
  const x0 = -width / 2;
  const y0 = -depth / 2;
  const shape = `M ${fmt(x0)} ${fmt(y0)} H ${fmt(x0 + width)} V ${fmt(y0 + mainDepth)} H ${fmt(x0 + chaiseWidth)} V ${fmt(y0 + depth)} H ${fmt(x0)} Z`;
  const parts = [path(shape, 'shape shape-fill')];
  const mainSeat = rect(width - thickness * 1.2, mainDepth - thickness * 1.4, {
    className: 'shape-detail',
    y: y0 + mainDepth / 2 + thickness * 0.3
  });
  parts.push(mainSeat);
  const chaiseSeatHeight = depth - mainDepth - thickness * 1.2;
  if (chaiseSeatHeight > 0) {
    parts.push(rect(chaiseWidth - thickness * 1.2, chaiseSeatHeight, {
      className: 'shape-detail',
      x: x0 + chaiseWidth / 2,
      y: y0 + mainDepth + chaiseSeatHeight / 2 + thickness * 0.3
    }));
  }
  parts.push(line(x0 + chaiseWidth, y0 + mainDepth, x0 + chaiseWidth, y0 + depth));
  return join(parts);
}

function buildArmchair({ width, depth, opts = {} }) {
  const radius = Math.min(width, depth) * 0.18;
  const seatDepth = depth * 0.58;
  const seatCenterY = depth * 0.1;
  const backHeight = depth * 0.28;
  const parts = [
    rect(width, depth, { className: 'shape shape-fill', radius }),
    rect(width * 0.72, seatDepth, { className: 'shape-detail', y: seatCenterY }),
    rect(width, backHeight, { className: 'shape-detail', y: -depth / 2 + backHeight / 2 })
  ];
  if (!opts.compact) {
    const armInset = width * 0.18;
    parts.push(line(-width / 2 + armInset, seatCenterY - seatDepth / 2, -width / 2 + armInset, depth / 2 - armInset));
    parts.push(line(width / 2 - armInset, seatCenterY - seatDepth / 2, width / 2 - armInset, depth / 2 - armInset));
  }
  return join(parts);
}

function buildChair({ width, depth }) {
  const radius = Math.min(width, depth) * 0.15;
  const seatWidth = width * 0.7;
  const seatDepth = depth * 0.6;
  const seatOffsetY = depth * 0.12;
  const backY = -depth / 2 + depth * 0.18;
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius }),
    rect(seatWidth, seatDepth, { className: 'shape-detail', y: seatOffsetY }),
    line(-seatWidth / 2, backY, seatWidth / 2, backY)
  ]);
}

function buildStoolRound({ width }) {
  const radius = width / 2;
  return join([
    circle(radius, { className: 'shape shape-fill' }),
    circle(radius * 0.28, { className: 'shape-detail' })
  ]);
}

function buildStoolSquare({ width, depth }) {
  const radius = Math.min(width, depth) * 0.2;
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius }),
    rect(width * 0.55, depth * 0.55, { className: 'shape-detail' })
  ]);
}

function buildGrinder({ width, depth }) {
  const baseWidth = width * 0.82;
  const baseHeight = depth * 0.56;
  const baseY = depth * 0.225;
  const hopperBaseY = baseY - baseHeight / 2;
  const hopperWidth = width * 0.7;
  return join([
    rect(baseWidth, baseHeight, { className: 'shape shape-fill', radius: Math.min(baseWidth, baseHeight) * 0.22, y: baseY }),
    path(`M ${fmt(-hopperWidth / 2)} ${fmt(hopperBaseY)} L 0 ${fmt(-depth / 2)} L ${fmt(hopperWidth / 2)} ${fmt(hopperBaseY)} Z`, 'shape-detail'),
    rect(width * 0.5, baseHeight * 0.18, { className: 'shape-detail', y: baseY + baseHeight * 0.18 }),
    circle(width * 0.18, { className: 'shape-detail', cy: baseY })
  ]);
}

function buildBanquette({ width, depth }) {
  const radius = Math.min(width, depth) * 0.18;
  const seatDepth = depth * 0.58;
  const seatY = depth * 0.12;
  const backInset = Math.min(width, depth) * 0.08;
  const backY = -depth / 2 + depth * 0.18;
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius }),
    rect(width * 0.9, seatDepth, { className: 'shape-detail', y: seatY }),
    line(-width / 2 + backInset, backY, width / 2 - backInset, backY)
  ]);
}

function buildBanquetteCorner({ width, depth, opts = {} }) {
  const seatDepth = (opts.seatDepth || Math.min(width, depth) * 0.28);
  const xMin = -width / 2;
  const xMax = width / 2;
  const yMin = -depth / 2;
  const yMax = depth / 2;
  const innerX = xMin + seatDepth;
  const innerY = yMin + seatDepth;
  const outline = [
    `M ${fmt(xMin)} ${fmt(yMin)}`,
    `H ${fmt(xMax)}`,
    `V ${fmt(innerY)}`,
    `H ${fmt(innerX)}`,
    `V ${fmt(yMax)}`,
    `H ${fmt(xMin)}`,
    'Z'
  ].join(' ');
  const backOffset = seatDepth * 0.45;
  const innerBackX = xMin + backOffset;
  const innerBackY = yMin + backOffset;
  const parts = [
    path(outline, 'shape shape-fill'),
    line(innerBackX, innerBackY, xMax - backOffset, innerBackY),
    line(innerBackX, innerBackY, innerBackX, yMax - backOffset)
  ];
  return join(parts);
}

function buildBooth({ width, depth, opts = {} }) {
  const radius = Math.min(width, depth) * 0.1;
  const seatDepth = depth * 0.24;
  const tableWidth = width * (opts.tableWidthRatio || 0.32);
  const tableDepth = depth * 0.28;
  const tableY = -depth / 2 + seatDepth + tableDepth / 2 + depth * 0.05;
  const framePath = [
    `M ${fmt(-width / 2)} ${fmt(depth / 2 - seatDepth)}`,
    `V ${fmt(-depth / 2 + radius)}`,
    `Q ${fmt(-width / 2)} ${fmt(-depth / 2)} ${fmt(-width / 2 + radius)} ${fmt(-depth / 2)}`,
    `H ${fmt(width / 2 - radius)}`,
    `Q ${fmt(width / 2)} ${fmt(-depth / 2)} ${fmt(width / 2)} ${fmt(-depth / 2 + radius)}`,
    `V ${fmt(depth / 2 - seatDepth)}`
  ].join(' ');
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius }),
    path(framePath, 'shape-detail'),
    rect(tableWidth, tableDepth, { className: 'shape-detail', y: tableY }),
    line(0, tableY - tableDepth / 2, 0, tableY + tableDepth / 2)
  ]);
}

function buildTableRound({ width, depth, opts = {} }) {
  const radius = width / 2;
  const parts = [circle(radius, { className: 'shape shape-fill' })];
  const showAxis = opts.axis !== false;
  const axisLength = radius * (opts.axisLengthRatio || 0.65);
  if (showAxis) {
    const axisEnd = Math.min(axisLength, radius - radius * 0.12);
    parts.push(line(0, 0, 0, axisEnd));
  }
  if (opts.highTop) {
    const dropWidth = radius * 0.7;
    const dropDepth = radius * 0.24;
    const outerY = -radius + dropDepth;
    const outerControlY = outerY - dropDepth * 0.8;
    const innerWidth = dropWidth * 0.6;
    const innerY = outerY + dropDepth * 0.45;
    const innerControlY = innerY - dropDepth * 0.6;
    parts.push(path(`M ${fmt(-dropWidth / 2)} ${fmt(outerY)} Q 0 ${fmt(outerControlY)} ${fmt(dropWidth / 2)} ${fmt(outerY)}`, 'shape-detail'));
    parts.push(path(`M ${fmt(-innerWidth / 2)} ${fmt(innerY)} Q 0 ${fmt(innerControlY)} ${fmt(innerWidth / 2)} ${fmt(innerY)}`, 'shape-detail'));
  }
  if (opts.innerCircle) {
    const innerRadius = typeof opts.innerCircle === 'number' ? opts.innerCircle : radius * 0.35;
    parts.push(circle(innerRadius, { className: 'shape-detail' }));
  }
  return join(parts);
}

function buildTableRect({ width, depth, opts = {} }) {
  const radius = opts.cornerRadius || Math.min(width, depth) * 0.12;
  const parts = [rect(width, depth, { className: 'shape shape-fill', radius })];
  let showShortAxes = opts.shortAxes !== false;
  if (opts.cross === false) showShortAxes = false;
  if (opts.shortAxes === true) showShortAxes = true;
  if (showShortAxes) {
    const shorter = Math.min(width, depth);
    const offset = shorter * 0.12;
    const axisLength = Math.min(shorter * 0.45, Math.max(shorter - offset * 2, shorter * 0.3));
    if (width >= depth) {
      const leftStart = -width / 2 + offset;
      const rightStart = width / 2 - offset;
      parts.push(line(leftStart, 0, leftStart + axisLength, 0));
      parts.push(line(rightStart, 0, rightStart - axisLength, 0));
    } else {
      const topStart = -depth / 2 + offset;
      const bottomStart = depth / 2 - offset;
      parts.push(line(0, topStart, 0, topStart + axisLength));
      parts.push(line(0, bottomStart, 0, bottomStart - axisLength));
    }
  }
  if (opts.centerLine === 'horizontal' || opts.centerLine === 'both') parts.push(line(-width / 2, 0, width / 2, 0));
  if (opts.centerLine === 'vertical' || opts.centerLine === 'both') parts.push(line(0, -depth / 2, 0, depth / 2));
  return join(parts);
}

function buildCounterStraight({ width, depth, opts = {} }) {
  const parts = [rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.08 })];
  const offset = opts.edgeOffset ? depth * opts.edgeOffset : depth * 0.3;
  parts.push(line(-width / 2, offset - depth / 2, width / 2, offset - depth / 2));
  return join(parts);
}

function buildCounterL({ width, depth, opts = {} }) {
  const thickness = opts.thickness || Math.min(width, depth) * 0.35;
  const x0 = -width / 2;
  const y0 = -depth / 2;
  const outline = `M ${fmt(x0)} ${fmt(y0)} H ${fmt(x0 + width)} V ${fmt(y0 + thickness)} H ${fmt(x0 + thickness)} V ${fmt(y0 + depth)} H ${fmt(x0)} Z`;
  return join([
    path(outline, 'shape shape-fill'),
    line(x0, y0 + thickness / 2, x0 + width, y0 + thickness / 2),
    line(x0 + thickness / 2, y0 + thickness, x0 + thickness / 2, y0 + depth)
  ]);
}

function buildCounterIsland({ width, depth }) {
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.12 }),
    rect(width * 0.6, depth * 0.35, { className: 'shape-detail' })
  ]);
}

function buildCounterBack({ width, depth }) {
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.1 }),
    line(-width / 2, 0, width / 2, 0)
  ]);
}

function buildPartitionLine({ width, depth }) {
  return rect(width, depth, { className: 'shape shape-fill', radius: depth * 0.4 });
}
function buildSink({ width, depth, opts = {} }) {
  const parts = [rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.08 })];
  (opts.basins || []).forEach(basin => {
    parts.push(ellipse(basin.rx || width * 0.25, basin.ry || depth * 0.3, {
      cx: basin.cx || 0,
      cy: basin.cy || 0,
      className: 'shape-detail'
    }));
  });
  if (opts.faucet) parts.push(line(0, -depth / 2, 0, -depth / 2 + depth * 0.2));
  return join(parts);
}

function buildMopSink({ width, depth }) {
  const parts = [rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.08 })];
  const offset = Math.min(width, depth) * 0.25;
  parts.push(line(-width / 2 + offset, -depth / 2, width / 2, depth / 2 - offset));
  parts.push(line(-width / 2, -depth / 2 + offset, width / 2 - offset, depth / 2));
  parts.push(line(-width / 2, depth / 2 - offset, width / 2, -depth / 2 + offset));
  return join(parts);
}

function buildFloorDrain({ width, depth }) {
  const size = Math.min(width, depth);
  return join([
    rect(size, size, { className: 'shape', radius: size * 0.15 }),
    line(-size / 2, 0, size / 2, 0),
    line(0, -size / 2, 0, size / 2)
  ]);
}

function buildCooktop({ width, depth }) {
  const burnerRadius = Math.min(width, depth) * 0.18;
  const offsets = [-0.3, 0.3];
  const parts = [rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.08 })];
  offsets.forEach(ox => offsets.forEach(oy => {
    parts.push(circle(burnerRadius, { cx: width * ox / 2, cy: depth * oy / 2, className: 'shape-detail' }));
  }));
  return join(parts);
}

function buildBed({ width, depth, opts = {} }) {
  const headHeight = depth * 0.25;
  const pillowCount = Math.max(1, opts.pillows || 2);
  const parts = [
    rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.12 }),
    rect(width, headHeight, { className: 'shape-detail', y: -depth / 2 + headHeight / 2 })
  ];
  const pillowWidth = width / pillowCount - width * 0.08;
  const pillowHeight = headHeight * 0.6;
  for (let i = 0; i < pillowCount; i += 1) {
    const cx = -width / 2 + pillowWidth / 2 + (width / pillowCount) * i;
    parts.push(rect(pillowWidth, pillowHeight, {
      className: 'shape-detail',
      x: cx,
      y: -depth / 2 + headHeight * 0.65
    }));
  }
  parts.push(line(0, -depth / 2 + headHeight, 0, depth / 2 - depth * 0.08));
  return join(parts);
}

function buildStorage({ width, depth, opts = {} }) {
  const parts = [rect(width, depth, { className: 'shape shape-fill', radius: opts.radius || Math.min(width, depth) * 0.1 })];
  (opts.dividers || []).forEach(ratio => {
    const x = -width / 2 + width * ratio;
    parts.push(line(x, -depth / 2, x, depth / 2));
  });
  (opts.shelves || []).forEach(ratio => {
    const y = depth * ratio;
    parts.push(line(-width / 2, y, width / 2, y));
  });
  return join(parts);
}

function buildBathtub({ width, depth }) {
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.3 }),
    ellipse(width * 0.38, depth * 0.35, { className: 'shape-detail' })
  ]);
}

function buildShower({ width, depth }) {
  return join([
    rect(width, depth, { className: 'shape shape-fill' }),
    line(-width / 2, depth / 2, width / 2, -depth / 2),
    circle(Math.min(width, depth) * 0.08, { className: 'shape-detail' })
  ]);
}

function buildToilet({ width, depth }) {
  const bowlHeight = depth * 0.55;
  const cisternHeight = depth - bowlHeight;
  return join([
    rect(width, bowlHeight, { className: 'shape shape-fill', y: depth / 2 - bowlHeight / 2, radius: Math.min(width, bowlHeight) * 0.35 }),
    ellipse(width * 0.35, bowlHeight * 0.4, { className: 'shape-detail', cy: depth / 2 - bowlHeight * 0.55 }),
    rect(width * 0.75, cisternHeight, { className: 'shape-detail', y: -depth / 2 + cisternHeight / 2 })
  ]);
}

function buildWasher({ width, depth, opts = {} }) {
  const radius = Math.min(width, depth) * 0.3;
  const inner = opts.innerCircle || radius * 0.75;
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.08 }),
    circle(radius, { className: 'shape-detail' }),
    circle(inner, { className: 'shape-detail' })
  ]);
}

function buildWatercooler({ width, depth }) {
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.12 }),
    rect(width * 0.6, depth * 0.35, { className: 'shape-detail', y: -depth * 0.15 }),
    rect(width * 0.6, depth * 0.18, { className: 'shape-detail', y: depth * 0.2 })
  ]);
}

function buildTV({ width, depth }) {
  return join([
    rect(width, depth, { className: 'shape shape-fill' }),
    rect(width * 0.88, depth * 0.6, { className: 'shape-detail' })
  ]);
}

function buildProjector({ width, depth }) {
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.2 }),
    circle(Math.min(width, depth) * 0.2, { className: 'shape-detail', cx: width * 0.25 })
  ]);
}

function buildScreen({ width, depth }) {
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius: depth * 0.4 }),
    line(-width / 2, 0, width / 2, 0)
  ]);
}

function buildAC({ width, depth }) {
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.2 }),
    line(-width / 2, 0, width / 2, 0)
  ]);
}

function buildRadiator({ width, depth }) {
  const parts = [rect(width, depth, { className: 'shape shape-fill', radius: depth * 0.4 })];
  const segmentWidth = width / 6;
  for (let i = 1; i < 6; i += 1) {
    const x = -width / 2 + segmentWidth * i;
    parts.push(line(x, -depth / 2, x, depth / 2));
  }
  return join(parts);
}

function buildPlant({ width }) {
  const radius = width / 2;
  const leaf = `M 0 ${fmt(radius)} C ${fmt(radius * 0.6)} ${fmt(radius * 0.1)} ${fmt(radius * 0.6)} ${fmt(-radius * 0.4)} 0 ${fmt(-radius * 0.9)} C ${fmt(-radius * 0.6)} ${fmt(-radius * 0.4)} ${fmt(-radius * 0.6)} ${fmt(radius * 0.1)} 0 ${fmt(radius)} Z`;
  return join([
    circle(radius, { className: 'shape shape-fill' }),
    path(leaf, 'shape-detail')
  ]);
}

function buildFloorLamp({ width, depth }) {
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.3 }),
    line(0, -depth / 2, 0, depth / 2)
  ]);
}

function buildRug({ width, depth }) {
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.1 }),
    rect(width * 0.82, depth * 0.82, { className: 'shape-detail' })
  ]);
}

function buildQueuePost({ width }) {
  const radius = width / 2;
  return join([
    circle(radius, { className: 'shape shape-fill' }),
    line(0, -radius, 0, radius)
  ]);
}

function buildMenuBoard({ width, depth }) {
  return rect(width, depth, { className: 'shape shape-fill', radius: depth * 0.4 });
}

function buildPlanter({ width, depth }) {
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius: Math.min(width, depth) * 0.2 }),
    rect(width * 0.9, depth * 0.4, { className: 'shape-detail', y: -depth * 0.15 })
  ]);
}

function buildWhiteboard({ width, depth }) {
  return join([
    rect(width, depth, { className: 'shape shape-fill', radius: depth * 0.4 }),
    rect(width * 0.9, depth * 0.4, { className: 'shape-detail' })
  ]);
}
function buildAppliance({ width, depth, opts = {} }) {
  const radius = opts.radius ?? Math.min(width, depth) * 0.1;
  const parts = [rect(width, depth, { className: 'shape shape-fill', radius })];
  if (opts.inner !== false) {
    const innerWidth = opts.innerWidth ?? width - Math.min(width, depth) * 0.3;
    const innerHeight = opts.innerHeight ?? depth * (opts.innerHeightRatio ?? 0.35);
    let innerY = 0;
    if (opts.innerY !== undefined) innerY = opts.innerY;
    else if (opts.innerAlign === 'top') innerY = -depth / 2 + innerHeight / 2 + depth * 0.12;
    else if (opts.innerAlign === 'bottom') innerY = depth / 2 - innerHeight / 2 - depth * 0.12;
    parts.push(rect(innerWidth, innerHeight, { className: 'shape-detail', y: innerY }));
  }
  (opts.horizontal || []).forEach(ratio => {
    const y = depth * ratio;
    parts.push(line(-width / 2, y, width / 2, y));
  });
  (opts.vertical || []).forEach(ratio => {
    const x = width * ratio;
    parts.push(line(x, -depth / 2, x, depth / 2));
  });
  if (Array.isArray(opts.circles)) {
    opts.circles.forEach(cfg => {
      if (!cfg) return;
      const radiusValue = cfg.radius || Math.min(width, depth) * 0.2;
      parts.push(circle(radiusValue, {
        className: cfg.className || 'shape-detail',
        cx: cfg.cx || 0,
        cy: cfg.cy || 0
      }));
    });
  } else if (opts.circle) {
    parts.push(circle(opts.circle.radius || Math.min(width, depth) * 0.2, {
      className: opts.circle.className || 'shape-detail',
      cx: opts.circle.cx || 0,
      cy: opts.circle.cy || 0
    }));
  }
  (opts.paths || []).forEach(def => {
    if (!def || !def.d) return;
    parts.push(path(def.d, def.className || 'shape-detail'));
  });
  (opts.frontArcs || []).forEach(arc => {
    if (!arc) return;
    const center = arc.offset !== undefined ? arc.offset : width * (arc.ratio || 0);
    const arcWidth = arc.width || width * (arc.widthRatio || 0.28);
    const radiusValue = arc.radius || Math.min(arcWidth / 2, depth * 0.28);
    const inset = arc.inset || depth * 0.12;
    const y = depth / 2 - inset;
    const x0 = center - arcWidth / 2;
    const x1 = center + arcWidth / 2;
    parts.push(path(`M ${fmt(x0)} ${fmt(y)} A ${fmt(radiusValue)} ${fmt(radiusValue)} 0 0 1 ${fmt(x1)} ${fmt(y)}`, arc.className || 'shape-detail'));
  });
  if (opts.handle) {
    const side = opts.handle.side === 'left' ? -1 : 1;
    const inset = opts.handle.inset ?? Math.min(width, depth) * 0.18;
    const handleLength = opts.handle.length ?? depth * 0.45;
    const x = side * (width / 2 - inset);
    parts.push(line(x, -handleLength / 2, x, handleLength / 2));
  }
  return join(parts);
}
const BUILDERS = {
  zone: buildZone,
  sofa: buildSofa,
  sofaL: buildSofaL,
  armchair: buildArmchair,
  chair: buildChair,
  stoolRound: buildStoolRound,
  stoolSquare: buildStoolSquare,
  grinder: buildGrinder,
  banquette: buildBanquette,
  banquetteCorner: buildBanquetteCorner,
  booth: buildBooth,
  tableRound: buildTableRound,
  tableRect: buildTableRect,
  counterStraight: buildCounterStraight,
  counterL: buildCounterL,
  counterIsland: buildCounterIsland,
  counterBack: buildCounterBack,
  partitionLine: buildPartitionLine,
  sink: buildSink,
  mopSink: buildMopSink,
  floorDrain: buildFloorDrain,
  cooktop: buildCooktop,
  bed: buildBed,
  storage: buildStorage,
  bathtub: buildBathtub,
  shower: buildShower,
  toilet: buildToilet,
  washer: buildWasher,
  watercooler: buildWatercooler,
  tv: buildTV,
  projector: buildProjector,
  screen: buildScreen,
  ac: buildAC,
  radiator: buildRadiator,
  plant: buildPlant,
  floorLamp: buildFloorLamp,
  rug: buildRug,
  queuePost: buildQueuePost,
  menuBoard: buildMenuBoard,
  planter: buildPlanter,
  whiteboard: buildWhiteboard,
  appliance: buildAppliance
};
Object.entries(PLAN_LIBRARY).forEach(([id, config]) => registerTemplate(id, config));
const TEMPLATE_MIGRATION_MAP = {
  'zone': 'zone',
  'cafe-table-round-60': 'table-round-60',
  'cafe-table-square-70': 'table-square-70',
  'cafe-hightop-round-70': 'table-hightop-round-70',
  'cafe-communal-240': 'table-rect-240x90',
  'banquette-160': 'seat-banquette-160x60',
  'banquette-220': 'seat-banquette-120x60',
  'booth-2': 'seat-booth-2-150x120',
  'booth-4': 'seat-booth-4-220x140',
  'bar-counter-straight-180': 'counter-straight-180',
  'bar-counter-straight-240': 'counter-straight-240',
  'bar-counter-l-180x180': 'counter-l-180x180',
  'bar-counter-island-180x90': 'counter-island-180x90',
  'bar-back-shelf-180': 'counter-back-180x40',
  'espresso-2g': 'appliance-espresso-80x60',
  'espresso-3g': 'appliance-espresso-110x60',
  'grinder-80mm': 'appliance-grinder-30x30',
  'batch-brewer-2': 'appliance-batchbrew-80x45',
  'pour-over-3': 'appliance-pourover-120x40',
  'kettle-electric': 'appliance-kettle-30x30',
  'water-filter': 'appliance-filter-40x30',
  'ice-machine-60': 'appliance-ice-60x60',
  'undercounter-fridge-90': 'appliance-undercounter-60x60',
  'upright-fridge-60': 'appliance-upright-70x70',
  'milk-fridge-60': 'appliance-milk-60x60',
  'freezer-60': 'appliance-freezer-60x60',
  'pastry-case-120': 'appliance-display-120x60',
  'pastry-case-120-curved': 'appliance-display-120x60',
  'pos-terminal': 'appliance-pos-35x35',
  'cash-drawer': 'appliance-cashdrawer-45x35',
  'condiment-120': 'fixture-condiment-120x35',
  'syrup-rack-90': 'fixture-syrup-90x30',
  'trash-single': 'fixture-trash-40x40',
  'trash-double': 'fixture-trash-80x40',
  'hand-sink': 'kitchen-handsink-50x50',
  'triple-sink': 'kitchen-triple-sink-180x60',
  'dishwasher-pro': 'appliance-dishwasher-60x60',
  'drying-rack-120': 'fixture-drying-120x40',
  'queue-post': 'fixture-queuepost-35',
  'menu-board-120': 'fixture-menuboard-120x10',
  'planter-long-120': 'decor-planter-120x30',
  'partition-120x10': 'partition-linear-120x10',
  'chair': 'chair-side-45x45',
  'armchair': 'chair-armchair-90',
  'sofa-2': 'sofa-2seat-200',
  'sofa-3': 'sofa-3seat-240',
  'sectional-l': 'sofa-l-260x180',
  'stool': 'stool-round-35',
  'barstool': 'stool-bar-35x35',
  'coffee-round': 'table-coffee-round-80',
  'coffee-rect': 'table-coffee-rect-120x60',
  'dining-4': 'table-rect-120x70',
  'dining-6': 'table-rect-160x80',
  'dining-8': 'table-rect-200x100',
  'desk': 'table-work-160x80',
  'workstation-l': 'counter-l-180x180',
  'office-chair': 'chair-office-70x70',
  'reception': 'counter-reception-200x80',
  'whiteboard': 'fixture-whiteboard-180x10',
  'printer': 'appliance-printer-60x45',
  'copier': 'appliance-copier-70x60',
  'server-rack': 'appliance-server-70x70',
  'bed-single': 'bed-single-90x200',
  'bed-double': 'bed-double-160x200',
  'nightstand': 'storage-nightstand-50x40',
  'wardrobe-2d': 'storage-wardrobe-120x60',
  'wardrobe-3d': 'storage-wardrobe-180x60',
  'shelving': 'storage-shelving-120x40',
  'kitchen-line': 'counter-straight-180',
  'sink': 'kitchen-sink-60x60',
  'cooktop-4': 'kitchen-cooktop-60x60',
  'fridge': 'appliance-fridge-60x70',
  'oven': 'kitchen-oven-60x60',
  'microwave': 'appliance-counter-60x40',
  'dishwasher': 'appliance-dishwasher-60x60',
  'island': 'counter-island-180x90',
  'toilet': 'bath-toilet-38x70',
  'bath-sink': 'bath-sink-60x50',
  'shower': 'bath-shower-90x90',
  'bathtub': 'bath-bathtub-170x75',
  'washer': 'appliance-washer-60x60',
  'dryer': 'appliance-dryer-60x60',
  'water-cooler': 'fixture-watercooler-40x60',
  'tv-stand': 'storage-media-180x40',
  'tv-wall': 'fixture-tv-180x20',
  'projector': 'fixture-projector-40x40',
  'projection-screen': 'fixture-screen-240x10',
  'ac-indoor': 'climate-ac-100x30',
  'radiator': 'climate-radiator-120x12',
  'plant': 'decor-plant-60',
  'floor-lamp': 'decor-floorlamp-45x45',
  'rug': 'decor-rug-200x140',
  'bar-counter-straight': 'counter-straight-180',
  'bar-counter-l': 'counter-l-180x180',
  'bar-counter-island': 'counter-island-180x90'
};

const TEMPLATE_MIGRATION_RULES = [];

if (typeof globalThis !== 'undefined') {
  globalThis.TEMPLATE_MIGRATION_MAP = TEMPLATE_MIGRATION_MAP;
  globalThis.TEMPLATE_MIGRATION_RULES = TEMPLATE_MIGRATION_RULES;
}
