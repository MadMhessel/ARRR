/*
 * A lightweight stub for interact.js functionality used in this planner.
 *
 * The original project relied on the InteractJS library for draggable,
 * resizable and dropzone behaviours. In this environment the external
 * library isn't available, which prevented any of the editor's scripts
 * from running. This stub implements just enough of the API to keep
 * existing code working without changing its structure.  It uses
 * PointerEvents under the hood and supports basic dragging, resizing
 * (via the provided `.resize‑handle` child) and a simple unset cleanup.
 * Dropzone behaviours are no‑ops here because the editor also exposes
 * a click‑to‑add fallback for palette items (see app.js modifications).
 */

(() => {
  // Prevent double installation
  if (window.interact) return;

  const dropzones = new Map();

  function getParentNode(node) {
    if (!node) return null;
    if (node.parentElement) return node.parentElement;
    if (node.parentNode instanceof Element) return node.parentNode;
    if (node.parentNode && node.parentNode.host) return node.parentNode.host;
    return null;
  }

  function acceptsDrop(options, relatedTarget) {
    if (!options || !options.accept) return true;
    const { accept } = options;
    if (typeof accept === 'string') {
      return relatedTarget?.matches?.(accept);
    }
    if (typeof accept === 'function') {
      return !!accept({ relatedTarget });
    }
    if (accept instanceof Element) {
      return relatedTarget === accept;
    }
    if (Array.isArray(accept)) {
      return accept.some(item => acceptsDrop({ accept: item }, relatedTarget));
    }
    return false;
  }

  function findDropzoneAt(clientX, clientY, relatedTarget) {
    let node = document.elementFromPoint(clientX, clientY);
    while (node) {
      const record = dropzones.get(node);
      if (record && acceptsDrop(record.options, relatedTarget)) {
        return record;
      }
      node = getParentNode(node);
    }
    return null;
  }

  function fireDropEvent(record, type, interaction, pointerEvent) {
    if (!record) return;
    const evt = {
      target: record.el,
      relatedTarget: interaction.dragElement,
      interaction,
      clientX: pointerEvent?.clientX,
      clientY: pointerEvent?.clientY,
      dragEvent: pointerEvent
    };
    const listeners = record.options?.listeners || {};
    const listener = listeners[type];
    if (typeof listener === 'function') listener(evt);
    const handler = record.options?.['on' + type];
    if (typeof handler === 'function') handler(evt);
  }

  class InteractWrapper {
    constructor(elements) {
      this.elements = elements;
    }

    /*
     * Enable dragging on the wrapped element(s).
     * We ignore inertia and other modifiers; only the onstart,
     * move and end listeners are called.  dx/dy are computed as
     * deltas in screen coordinates.  The callback receives an
     * object similar to InteractJS with dx, dy, clientX and clientY.
     */
    draggable(options = {}) {
      this.elements.forEach(el => {
        const pointerDown = (event) => {
          // Только основная клавиша мыши
          if (event.button !== 0) return;
          // Минимальный объект interaction для обратной связи
          const interaction = {
            dragElement: el,
            rect: el.getBoundingClientRect(),
            activeDropzones: new Set(),
            dropTarget: null
          };
          const listeners = options.listeners || {};
          const baseStartEvent = {
            target: el,
            button: event.button,
            clientX: event.clientX,
            clientY: event.clientY,
            interaction,
            rect: interaction.rect,
            event
          };
          // Если обработчик start возвращает false, отменяем перетаскивание
          if (typeof listeners.start === 'function') {
            const res = listeners.start(baseStartEvent);
            if (res === false) return;
          }
          if (typeof options.onstart === 'function') {
            const res = options.onstart(baseStartEvent);
            if (res === false) return;
          }
          // обновляем target, если обработчик изменил interaction.dragElement
          const targetEl = interaction.dragElement || el;
          interaction.dragElement = targetEl;
          // Не подавляем всплытие событий и не вызываем preventDefault, чтобы
          // родительские mousedown‑обработчики в app.js смогли отреагировать
          // и выбрать объект. Этого достаточно для drag, выделение текста при
          // перетаскивании нам не мешает.
          let lastX = event.clientX;
          let lastY = event.clientY;
          const moveHandler = (ev) => {
            const dx = ev.clientX - lastX;
            const dy = ev.clientY - lastY;
            lastX = ev.clientX;
            lastY = ev.clientY;
            if (listeners && typeof listeners.move === 'function') {
              listeners.move({ dx, dy, clientX: ev.clientX, clientY: ev.clientY, interaction, rect: interaction.rect, target: targetEl, event: ev });
            }
            if (typeof options.onmove === 'function') {
              options.onmove({ dx, dy, clientX: ev.clientX, clientY: ev.clientY, interaction, rect: interaction.rect, target: targetEl, event: ev });
            }
            if (interaction.dragElement) {
              const record = findDropzoneAt(ev.clientX, ev.clientY, interaction.dragElement);
              const current = interaction.dropTarget;
              if (current && current !== record) {
                fireDropEvent(current, 'dragleave', interaction, ev);
              }
              if (record && record !== current) {
                interaction.activeDropzones.add(record);
                fireDropEvent(record, 'dragenter', interaction, ev);
              }
              interaction.dropTarget = record;
            }
          };
          const upHandler = (ev) => {
            document.removeEventListener('pointermove', moveHandler);
            document.removeEventListener('pointerup', upHandler);
            if (interaction.dragElement) {
              const record = findDropzoneAt(ev.clientX, ev.clientY, interaction.dragElement) || interaction.dropTarget;
              if (record) {
                fireDropEvent(record, 'drop', interaction, ev);
              }
              interaction.activeDropzones.forEach(r => fireDropEvent(r, 'dropdeactivate', interaction, ev));
              interaction.activeDropzones.clear();
              interaction.dropTarget = null;
            }
            if (listeners && typeof listeners.end === 'function') {
              listeners.end({ interaction, clientX: ev.clientX, clientY: ev.clientY, target: interaction.dragElement || ev.target, event: ev });
            }
            if (typeof options.onend === 'function') {
              options.onend({ interaction, clientX: ev.clientX, clientY: ev.clientY, target: interaction.dragElement || ev.target, event: ev });
            }
          };
          document.addEventListener('pointermove', moveHandler);
          document.addEventListener('pointerup', upHandler);
        };
        el.addEventListener('pointerdown', pointerDown);
        // Remember for later cleanup
        this._storeHandler(el, 'pointerdown', pointerDown);
      });
      return this;
    }

    /*
     * Enable resizing via the `.resize‑handle` child on each element.  The
     * provided edges definition is passed back unchanged to the move
     * listener so that the original code knows which sides to modify.
     */
    resizable(options = {}) {
      this.elements.forEach(el => {
        const handle = el.querySelector('.resize-handle');
        if (!handle) return;
        const pointerDown = (event) => {
          if (event.button !== 0) return;
          if (typeof options.onstart === 'function') {
            const res = options.onstart(event);
            if (res === false) return;
          }
          event.stopPropagation();
          event.preventDefault();
          let lastX = event.clientX;
          let lastY = event.clientY;
          const moveHandler = (ev) => {
            const delta = { x: ev.clientX - lastX, y: ev.clientY - lastY };
            lastX = ev.clientX;
            lastY = ev.clientY;
            if (options.listeners && typeof options.listeners.move === 'function') {
              options.listeners.move({ delta, edges: options.edges || {}, clientX: ev.clientX, clientY: ev.clientY });
            }
          };
          const upHandler = (ev) => {
            document.removeEventListener('pointermove', moveHandler);
            document.removeEventListener('pointerup', upHandler);
            if (options.listeners && typeof options.listeners.end === 'function') {
              options.listeners.end(ev);
            }
          };
          document.addEventListener('pointermove', moveHandler);
          document.addEventListener('pointerup', upHandler);
        };
        handle.addEventListener('pointerdown', pointerDown);
        this._storeHandler(handle, 'pointerdown', pointerDown);
      });
      return this;
    }

    /*
     * Rotate handles leverage the `.rotate‑handle` child.  This method
     * attaches simple drag logic to update rotation.  The callback
     * receives clientX/clientY; the wrapped code computes angles itself.
     */
    draggableRotate(options = {}) {
      this.elements.forEach(el => {
        const handle = el.querySelector('.rotate-handle');
        if (!handle) return;
        const pointerDown = (event) => {
          if (event.button !== 0) return;
          if (typeof options.onstart === 'function') {
            const res = options.onstart(event);
            if (res === false) return;
          }
          event.stopPropagation();
          event.preventDefault();
          const moveHandler = (ev) => {
            if (options.listeners && typeof options.listeners.move === 'function') {
              options.listeners.move({ clientX: ev.clientX, clientY: ev.clientY, interaction: { el } });
            }
          };
          const upHandler = (ev) => {
            document.removeEventListener('pointermove', moveHandler);
            document.removeEventListener('pointerup', upHandler);
            if (options.listeners && typeof options.listeners.end === 'function') {
              options.listeners.end(ev);
            }
          };
          document.addEventListener('pointermove', moveHandler);
          document.addEventListener('pointerup', upHandler);
        };
        handle.addEventListener('pointerdown', pointerDown);
        this._storeHandler(handle, 'pointerdown', pointerDown);
      });
      return this;
    }

    /*
     * Basic dropzone support: remember accepted targets and fire
     * dragenter/leave/drop/dropdeactivate callbacks to mimic
     * InteractJS behaviour for the editor's needs.
     */
    dropzone(options = {}) {
      this.elements.forEach(el => {
        if (dropzones.has(el)) dropzones.delete(el);
        const record = { el, options };
        dropzones.set(el, record);
        if (!el._interactDropzones) {
          el._interactDropzones = new Set();
        }
        el._interactDropzones.add(record);
      });
      return this;
    }

    /*
     * Remove registered pointer listeners from elements.  This is
     * important when destroying objects (e.g. undo/redo) to avoid
     * leaking events.
     */
    unset() {
      this.elements.forEach(el => {
        const handlers = el._interactHandlers;
        if (handlers) {
          handlers.forEach(({ type, handler }) => {
            el.removeEventListener(type, handler);
          });
          delete el._interactHandlers;
        }
        if (el._interactDropzones) {
          el._interactDropzones.forEach(record => {
            dropzones.delete(record.el);
          });
          delete el._interactDropzones;
        }
        // Also remove handlers from children
        const all = el.querySelectorAll('*');
        all.forEach(node => {
          if (node._interactHandlers) {
            node._interactHandlers.forEach(({ type, handler }) => {
              node.removeEventListener(type, handler);
            });
            delete node._interactHandlers;
          }
          if (node._interactDropzones) {
            node._interactDropzones.forEach(record => {
              dropzones.delete(record.el);
            });
            delete node._interactDropzones;
          }
        });
      });
    }

    // Internal helper to register cleanup callbacks
    _storeHandler(el, type, handler) {
      if (!el._interactHandlers) {
        el._interactHandlers = [];
      }
      el._interactHandlers.push({ type, handler });
    }
  }

  // Entry point.  Accepts a selector or element, returns a wrapper.
  function interact(target) {
    let elements;
    if (typeof target === 'string') {
      elements = Array.from(document.querySelectorAll(target));
    } else if (target instanceof Element || target instanceof SVGElement) {
      elements = [target];
    } else if (Array.isArray(target) || (typeof NodeList !== 'undefined' && target instanceof NodeList)) {
      elements = Array.from(target);
    } else {
      elements = [];
    }
    const wrapper = new InteractWrapper(elements);
    // Special case: rotate handle support.  InteractJS attaches another
    // draggable call for rotate handles; here we map it explicitly.
    wrapper.draggableRotate = wrapper.draggableRotate.bind(wrapper);
    return wrapper;
  }

  window.interact = interact;
})();
