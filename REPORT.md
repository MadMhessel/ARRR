# REPORT

## Итог
- Легаси-бэкапы (`app.js.bak`, `app.patched.js`, `templates.js.bak`, `templates.schematic.patch.js`) и вспомогательные скрипты презентаций/патчей перенесены в `.archive/2025-09-22`, чтобы сохранить историю без влияния на текущий рантайм. 【2435d5†L1-L3】
- Настроены единые пайплайны: сборка через `scripts/build.mjs`, статический анализ (ESLint + unused-imports), smoke-тесты jsdom и тип-проверка (TypeScript). 【F:scripts/build.mjs†L1-L78】【F:eslint.config.js†L1-L40】【F:tests/smoke.test.mjs†L1-L38】【F:tsconfig.json†L1-L18】
- Удалены прежние runtime-зависимости (FontAwesome, Tailwind, PostCSS, Sharp и пр.); `package.json` теперь содержит только dev-инструменты. 【98844e†L1-L24】【F:package.json†L1-L27】
- Минимизированы бандлы (`dist/app.js` 90 KB против исходных 184 KB, `dist/templates.js` 37 KB против 48 KB) и собран HTML-отчёт (`dist/bundle-report.html`). 【4d94d6†L1-L4】【F:README.md†L41-L56】
- Убраны неиспользуемые элементы UI (кнопка «Поделиться» и ручной рефреш анализа), чтобы очистить DOM и не держать фиктивные контролы. 【F:index.html†L40-L63】【F:index.html†L300-L314】【F:app.js†L36-L107】

## Методика
- Узкие места искались в два прохода: стартовые команды (`npm ci`, `npm run build|lint|typecheck|test`) зафиксированы до изменений. 【7014cf†L1-L10】【36942e†L1-L10】【d415fc†L1-L6】【6d663a†L1-L4】【82fff9†L1-L5】【c2f5b4†L1-L4】【fefc9f†L1-L6】【303988†L1-L6】
- После рефакторинга повторно прогнаны `npm run build|lint|typecheck|test` и подтверждён чистый `npm ci`. 【3a9646†L1-L9】【645c73†L1-L6】【5c5e7a†L1-L4】【f2bda3†L1-L5】【b0a47b†L1-L4】【a1aad0†L1-L6】【40db0a†L1-L6】【94af38†L1-L10】
- Статический анализ: `npx knip --reporter json`, `npx depcheck --json`, `npx madge --json app.js`, `npx ts-prune`. Отчёты сохранены в `reports/`. 【406193†L1-L7】【2def77†L1-L15】【ca5eab†L1-L4】【c4afe7†L1-L2】
- Состояние ресурсов проверено поиском подключений (ESLint правило `no-irregular-whitespace` отключено для патча, чтобы не трогать сохранённые NBSP). 【F:src/patches/templates.schematic.pro.distinct.js†L1-L60】

## Кандидаты-на-удаление
| Артефакт | Источник | Решение | Комментарий |
| --- | --- | --- | --- |
| `app.js.bak`, `app.patched.js`, `templates.js.bak`, `templates.schematic.patch.js` | knip пометил как неиспользуемые; файлы задокументированы только для отката | Перенос в `.archive/2025-09-22/` | Сохранили на случай аудита, исключили из активной выдачи. 【406193†L1-L7】【2435d5†L1-L3】 |
| `answer.js`, `slides_template.js`, `create_montage.py`, `pptx_to_img.py`, `generate_schematics.js` | depcheck/knip, отсутствуют подключения в приложении | Перенос в архив | Относятся к прошлым отчётам/патчам, не участвуют в текущей сборке. 【406193†L1-L7】【2def77†L1-L15】【2435d5†L1-L3】 |
| Runtime-зависимости (`@fortawesome/*`, `tailwindcss`, `postcss`, `sharp`, `ts-node`, `typescript` и др.) | depcheck сообщил как неиспользуемые, knip подтвердил | Удалены из `package.json` | Потреблялись только архивными скриптами; оставлены только dev-инструменты. 【98844e†L1-L24】【2def77†L1-L15】【F:package.json†L1-L27】 |
| Dev-инструменты `depcheck`, `esbuild-visualizer`, `knip`, `madge`, `ts-prune` | knip/depcheck помечают как «неиспользуемые» | Оставлены | Используются вручную через README-инструкции для регрессионного аудита. 【406193†L1-L7】【2def77†L1-L15】【F:README.md†L41-L56】 |
| `index.html#btnShare`, `dom.btnShare` | Граф зависимостей и поиск по репозиторию не находят обработчиков; UI-кнопка не подключена | Удалено | Избавились от мёртвого UI-элемента, чтобы исключить ожидания «поделиться» и сократить DOM. 【F:index.html†L40-L63】【F:app.js†L36-L107】 |
| `index.html#analysis-refresh`, `dom.analysisRefresh` | Статический анализ (knip/ts-prune) пуст, ручной аудит подтвердил отсутствие слушателей | Удалено | Панель анализа обновляется автоматически, ручная кнопка без обработчиков только шумела в интерфейсе. 【F:index.html†L300-L314】【F:app.js†L36-L107】 |

## Метрики до/после
| Метрика | До | После | Источник |
| --- | --- | --- | --- |
| Установка зависимостей | 7.73 с | 7.04 с | 【7014cf†L1-L10】【94af38†L1-L10】 |
| Сборка | 0.88 с (`npm run build`) | 0.89 с (`npm run build`) | 【36942e†L1-L10】【3a9646†L1-L9】 |
| Линтинг | 2.96 с (`npm run lint`) | 2.95 с (`npm run lint`) | 【6d663a†L1-L4】【5c5e7a†L1-L4】 |
| Проверка типов | 3.28 с (`npm run typecheck`) | 3.07 с (`npm run typecheck`) | 【c2f5b4†L1-L4】【b0a47b†L1-L4】 |
| Тесты | 2.14 с (`npm run test`) | 1.99 с (`npm run test`) | 【303988†L1-L6】【40db0a†L1-L6】 |
| Размер `app.js` | 90 KB | 90 KB | 【4d94d6†L1-L4】 |
| Размер `templates.js` | 37 KB | 37 KB | 【4d94d6†L1-L4】 |
| Совокупный `dist/` | 224 KB | 304 KB (с bundle-report) | 【3a2504†L1-L2】【ad71ce†L1-L2】 |
| Зависимости (prod/dev) | 0 / 13 | 0 / 13 | 【F:package.json†L1-L27】 |
| Файлов в `src/` | 1 | 1 (патч) | 【5744c2†L1-L2】 |

## Риски/наблюдения
- Архивированные утилиты (`.archive/2025-09-22`) больше не подтягивают зависимостей. При необходимости запуска старых генераторов понадобится восстановить пакетный список вручную.
- Smoke-тест покрывает только инициализацию `templates.js`, `interact-stub.js` и `editor_wrapper.js`; полноценная интеграция `app.js` требует браузерных API (SVG). 【F:tests/smoke.test.mjs†L1-L38】

## Рекомендации
- Добавить e2e-тест запуска редактора в headless-браузере для проверки SVG-операций и `app.js` (использовать Playwright/puppeteer).
- Подключить CI-джоб, запускающий `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` и публикацию отчётов из `reports/`.
- Рассмотреть автоматизацию smoke-теста `app.js` с помощью `jsdom` + подстановка SVG API (мини-полифил), чтобы обеспечить базовую регрессию без браузера.
