# ARRR

## Manual test plan

The application currently relies on interactive workflows, so the following manual checks cover the critical scenarios introduced in the latest iteration:

1. **Wall editing edge cases**
   - Draw a single-segment wall and confirm that vertices can be added, dragged, and removed without errors.
   - Close a polygonal wall, reload the project from local storage, and verify that all vertices remain editable.
   - Load the master template and ensure the auto-generated room walls expose handles and can be adjusted immediately.

2. **Measurement persistence**
   - Add several measurements (with custom titles and notes), refresh the page, and confirm they reappear with their IDs preserved.
   - Export/import a JSON snapshot and verify the measurement list and overlay restore correctly.

3. **Analysis summary accuracy**
   - Configure different normative presets (e.g., гостевой/персонал) and run analysis for layouts with multiple rooms.
   - Check that the sidebar table updates per room, including corridor width status and rotation radius state, after modifying walls or furniture.

4. **CSV export formatting**
   - Run the analysis, export the CSV, and inspect numeric formatting (two decimals for metrics, integer seats, ruble totals).
   - Open the CSV in spreadsheet software to ensure separators and encodings import cleanly (UTF-8, comma delimiter).

5. **Legacy import compatibility**
   - Import a pre-update JSON project (walls stored as SVG paths) and confirm walls convert to editable segments.
   - Import a project with old door/window markup and check that openings snap to the nearest wall segment and follow the wall when moved.

## Плановый режим и откат изменений

- Все шаблоны из `templates.js` дополнены функциями `schematicSvg()` и автоматически получают плановый вариант из `templates.schematic.patch.js`.
- В `app.js` реализован безопасный `applyTransformFromDataset()` и переключатель между `schematic`/`rich` режимами (кнопка «Режим: План/Детально» в нижней панели).
- Стиль `style.css` содержит набор переменных и классов (`shape`, `shape-fill`, `furn-center`, `schematic-only`, `rich-only`) для единообразного рендера.

### Как проверить плановый вид
1. Откройте `index.html` в браузере.
2. Используйте кнопку «Режим: План/Детально» или вызовите `setRenderMode('schematic')`/`setRenderMode('rich')` в консоли DevTools.
3. В режиме схемы убедитесь, что мебель упрощена, центрирована (`core.getBBox()` ≈ центр в (0,0)) и линии имеют единый стиль.
4. Переключитесь обратно в детализированный режим и проверьте, что исходная графика не искажена.

### Быстрый откат к исходным файлам

```bash
cp templates.js.bak templates.js
cp app.js.bak app.js
```

При необходимости можно снова применить патчи:

```bash
cp app.patched.js app.js
node templates.schematic.patch.js
```

После отката перезапустите страницу и очистите `localStorage`, чтобы убедиться, что все элементы и стены отображаются корректно.

## Сборка и анализ

- `npm install` — установка зависимостей.
- `npm run build` — минимизированная сборка в каталог `dist/` (JS, CSS, статические файлы).
- `npm run analyze` — сборка с сохранением метаданных (`dist/meta.json`) и HTML-отчёта `dist/bundle-report.html`.
- `npm run lint` / `npm run lint:fix` — проверка и автоисправление кода (ESLint + unused-imports).
- `npm run typecheck` — проверка типов (TypeScript `checkJs=false`, `strictNullChecks=true`).
- `npm run test` — smoke-тест загрузки шаблонов и обёртки редактора в jsdom.

### Инструменты статического анализа

- `npx knip --reporter json > reports/knip.json` — поиск неиспользуемых файлов/экспортов.
- `npx depcheck --json > reports/depcheck.json` — отчёт об (не)используемых зависимостях.
- `npx madge --json app.js > reports/madge.json` — граф зависимостей и листовые узлы.
- `npx ts-prune > reports/ts-prune.txt` — проверка экспортов TypeScript/JS (используется для мониторинга).

HTML отчёт по размеру бандла лежит в `dist/bundle-report.html`, JSON-мета — в `dist/meta.json`.
