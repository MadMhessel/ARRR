# Template migration map

This document enumerates the legacy template identifiers that existed before the schematic plan style refresh and the canonical identifiers that replace them. The mapping is used by `TEMPLATE_MIGRATION_MAP` inside `templates.js` and by the runtime migration logic in `app.js` when opening historical layouts.

## How to use this table

* When loading an existing project, map every legacy `templateId` through this table to obtain the canonical plan item.
* If a legacy identifier is missing, add it to both `TEMPLATE_MIGRATION_MAP` and this file in the same release.
* When introducing new canonical templates, document them in `docs/plan-style-guide.md` and update the mapping if they supersede older assets.

## Legacy → canonical identifiers

| Legacy ID | Canonical ID | Notes |
|-----------|--------------|-------|
| ac-indoor | climate-ac-100x30 | – |
| armchair | chair-armchair-90 | – |
| banquette-160 | seat-banquette-160x60 | – |
| banquette-220 | seat-banquette-220x60 | – |
| bar-back-shelf-180 | counter-back-180x40 | – |
| bar-counter-island | counter-island-180x90 | Multiple legacy templates now reuse this canonical asset. |
| bar-counter-island-180x90 | counter-island-180x90 | Multiple legacy templates now reuse this canonical asset. |
| bar-counter-l | counter-l-180x180 | Multiple legacy templates now reuse this canonical asset. |
| bar-counter-l-180x180 | counter-l-180x180 | Multiple legacy templates now reuse this canonical asset. |
| bar-counter-straight | counter-straight-180 | Multiple legacy templates now reuse this canonical asset. |
| bar-counter-straight-180 | counter-straight-180 | Multiple legacy templates now reuse this canonical asset. |
| bar-counter-straight-240 | counter-straight-240 | – |
| barstool | stool-bar-35x35 | – |
| batch-brewer-2 | appliance-batchbrew-80x45 | – |
| bath-sink | bath-sink-60x50 | – |
| bathtub | bath-bathtub-170x75 | – |
| bed-double | bed-double-160x200 | – |
| bed-single | bed-single-90x200 | – |
| booth-2 | seat-booth-2-150x120 | – |
| booth-4 | seat-booth-4-220x140 | – |
| cafe-communal-240 | table-rect-240x90 | – |
| cafe-hightop-round-70 | table-hightop-round-70 | – |
| cafe-table-round-60 | table-round-60 | – |
| cafe-table-square-70 | table-square-70 | – |
| cash-drawer | appliance-cashdrawer-45x35 | – |
| chair | chair-side-45x50 | – |
| coffee-rect | table-coffee-rect-120x60 | – |
| coffee-round | table-coffee-round-80 | – |
| condiment-120 | fixture-condiment-120x35 | – |
| cooktop-4 | kitchen-cooktop-60x60 | – |
| copier | appliance-copier-70x60 | – |
| desk | table-work-160x80 | – |
| dining-4 | table-rect-120x75 | – |
| dining-6 | table-rect-160x90 | – |
| dining-8 | table-rect-200x100 | – |
| dishwasher | appliance-dishwasher-60x60 | Multiple legacy templates now reuse this canonical asset. |
| dishwasher-pro | appliance-dishwasher-60x60 | Multiple legacy templates now reuse this canonical asset. |
| dryer | appliance-dryer-60x60 | – |
| drying-rack-120 | fixture-drying-120x40 | – |
| espresso-2g | appliance-espresso-80x60 | – |
| espresso-3g | appliance-espresso-110x60 | – |
| floor-lamp | decor-floorlamp-45x45 | – |
| freezer-60 | appliance-freezer-60x60 | – |
| fridge | appliance-fridge-60x70 | – |
| grinder-80mm | appliance-small-30x30 | – |
| hand-sink | kitchen-handsink-50x50 | – |
| ice-machine-60 | appliance-ice-60x60 | – |
| island | counter-island-180x90 | Multiple legacy templates now reuse this canonical asset. |
| kettle-electric | appliance-kettle-30x30 | – |
| kitchen-line | counter-straight-180 | Multiple legacy templates now reuse this canonical asset. |
| menu-board-120 | fixture-menuboard-120x10 | – |
| microwave | appliance-counter-60x40 | – |
| milk-fridge-60 | appliance-milk-60x60 | – |
| nightstand | storage-nightstand-50x40 | – |
| office-chair | chair-office-70x70 | – |
| oven | kitchen-oven-60x60 | – |
| partition-120x10 | partition-linear-120x10 | – |
| pastry-case-120 | appliance-display-120x70 | Multiple legacy templates now reuse this canonical asset. |
| pastry-case-120-curved | appliance-display-120x70 | Multiple legacy templates now reuse this canonical asset. |
| plant | decor-plant-60 | – |
| planter-long-120 | decor-planter-120x30 | – |
| pos-terminal | appliance-pos-35x35 | – |
| pour-over-3 | appliance-pourover-120x40 | – |
| printer | appliance-printer-60x45 | – |
| projection-screen | fixture-screen-240x10 | – |
| projector | fixture-projector-40x40 | – |
| queue-post | fixture-queuepost-35 | – |
| radiator | climate-radiator-120x12 | – |
| reception | counter-reception-200x80 | – |
| rug | decor-rug-200x140 | – |
| sectional-l | sofa-l-260x180 | – |
| server-rack | appliance-server-70x70 | – |
| shelving | storage-shelving-120x40 | – |
| shower | bath-shower-90x90 | – |
| sink | kitchen-sink-60x60 | – |
| sofa-2 | sofa-2seat-200 | – |
| sofa-3 | sofa-3seat-240 | – |
| stool | stool-round-35 | – |
| syrup-rack-90 | fixture-syrup-90x30 | – |
| toilet | bath-toilet-38x70 | – |
| trash-double | fixture-trash-80x40 | – |
| trash-single | fixture-trash-40x40 | – |
| triple-sink | kitchen-triple-sink-180x60 | – |
| tv-stand | storage-media-180x40 | – |
| tv-wall | fixture-tv-180x20 | – |
| undercounter-fridge-90 | appliance-undercounter-90x60 | – |
| upright-fridge-60 | appliance-upright-60x70 | – |
| wardrobe-2d | storage-wardrobe-120x60 | – |
| wardrobe-3d | storage-wardrobe-180x60 | – |
| washer | appliance-washer-60x60 | – |
| water-cooler | fixture-watercooler-40x60 | – |
| water-filter | appliance-filter-40x30 | – |
| whiteboard | fixture-whiteboard-180x10 | – |
| workstation-l | counter-l-180x180 | Multiple legacy templates now reuse this canonical asset. |
| zone | zone | Unchanged canonical identifier. |

### Door component variants

Legacy wall components stored only `{ type: 'door', width }`. During migration `normaliseDoorComponent` assigns canonical metadata:

| Legacy component payload | Canonicalised payload |
|--------------------------|-----------------------|
| `{ type: 'door', width: 0.9 }` | `{ type: 'door', width: 0.9, variant: 'single', hinge: 'left', swing: 'in' }` |

Sliding, double и стеклянные системы ранее создавались отдельными SVG-элементами. Теперь они представлены вариантами `variant: 'double' | 'sliding' | 'glass'` с собственными ограничениями ширины. При загрузке старых сцен без `variant` поле автоматически принимает значение `single`.
