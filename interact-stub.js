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
          const interaction = {};
          const startEvent = {
            target: event.target,
            button: event.button,
            clientX: event.clientX,
            clientY: event.clientY,
            interaction,
          };
          // Если onstart возвращает false, отменяем перетаскивание
          if (typeof options.onstart === 'function') {
            const res = options.onstart(startEvent);
            if (res === false) return;
          }
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
            if (options.listeners && typeof options.listeners.move === 'function') {
              options.listeners.move({ dx, dy, clientX: ev.clientX, clientY: ev.clientY, interaction });
            }
          };
          const upHandler = (ev) => {
            document.removeEventListener('pointermove', moveHandler);
            document.removeEventListener('pointerup', upHandler);
            if (options.listeners && typeof options.listeners.end === 'function') {
              options.listeners.end({ interaction, clientX: ev.clientX, clientY: ev.clientY, target: ev.target });
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
     * The dropzone API is not implemented.  Calls to this method
     * simply return the wrapper so that chaining continues.
     */
    dropzone() {
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
        // Also remove handlers from children
        const all = el.querySelectorAll('*');
        all.forEach(node => {
          if (node._interactHandlers) {
            node._interactHandlers.forEach(({ type, handler }) => {
              node.removeEventListener(type, handler);
            });
            delete node._interactHandlers;
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