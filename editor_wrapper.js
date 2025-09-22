
/*
 editor_wrapper.js
 Safe, non-invasive exposure of editor API for external toolbars.
 Does not modify existing app.js behavior. Tries multiple fallbacks.
*/
(function(){
  try {
    if(window.Editor && Object.keys(window.Editor).length){
      // Already present; do not overwrite.
      console.info('Editor already present; wrapper will not overwrite.');
      return;
    }
    var api = window.EditorLite || window.Editor || {};
    function tryCall(obj, names, args){
      for(var i=0;i<names.length;i++){
        var n = names[i];
        if(obj && typeof obj[n] === 'function'){
          try{ return obj[n].apply(obj, args||[]); }catch(e){ console.warn('editor wrapper call error', n, e); return; }
        }
      }
    }
    window.Editor = {
      // toggle tool by name; fallbacks: EditorLite.activateTool / Editor.activateTool / simulate button click
      toggleTool: function(toolName){
        if(tryCall(api, ['activateTool','toggleTool','setTool'], [toolName]) !== undefined) return;
        // fallback: find toolbar button [data-tool=toolName] and click it
        try{
          var btn = document.querySelector('[data-tool="'+toolName+'"]');
          if(btn){ btn.click(); return; }
        }catch{ /* ignore missing toolbar button */ }
        console.info('Editor.toggleTool fallback executed for', toolName);
      },
      // duplicate selected object: try duplicateSelected, duplicate, or trigger button with id ctx-dup
      duplicateObject: function(){
        if(tryCall(api, ['duplicateSelected','duplicate','duplicateObject']) !== undefined) return;
        var btn = document.getElementById('ctx-dup') || document.querySelector('[data-tool="duplicate"]');
        if(btn) return btn.click();
        console.info('Editor.duplicateObject fallback executed');
      },
      // createLayoutObject: try exposed function, otherwise no-op
      createLayoutObject: function(template, x, y){
        var res = tryCall(api, ['createLayoutObject','createObject'], [template,x,y]);
        if(res !== undefined) return res;
        console.info('Editor.createLayoutObject fallback (no-op)');
        return null;
      },
      // selectObject: try to call selectElement or set selection via class
      selectObject: function(el){
        if(!el) return;
        if(tryCall(api, ['selectElement','selectObject'], [el]) !== undefined) return;
        // fallback: toggle .selected class
        document.querySelectorAll('.selected').forEach(function(s){ s.classList.remove('selected'); });
        try{ el.classList.add('selected'); }catch{ /* ignore classList errors */ }
      }
    };
    console.info('Editor wrapper installed (safe mode)');
  } catch(e){
    console.warn('Editor wrapper installation failed', e);
  }
})();
