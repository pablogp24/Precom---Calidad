(function(){
  'use strict';
  var installPrompt=null;
  function byId(id){return document.getElementById(id)}
  function standalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}
  function ensureUi(){
    if(byId('flecapRuntimeStatus'))return;
    var style=document.createElement('style');
    style.textContent='#flecapRuntimeStatus{position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:30000;display:none;align-items:center;gap:9px;max-width:calc(100vw - 24px);padding:9px 12px;border-radius:10px;background:#102f49;color:#fff;font:700 11px Arial,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.28)}#flecapRuntimeStatus.show{display:flex}#flecapRuntimeStatus.offline{background:#9a4a12}#flecapRuntimeStatus button{border:0;border-radius:7px;padding:6px 9px;background:#f47c20;color:#fff;font-weight:800;cursor:pointer}';
    document.head.appendChild(style);
    var box=document.createElement('div');box.id='flecapRuntimeStatus';box.setAttribute('role','status');box.setAttribute('aria-live','polite');document.body.appendChild(box);
  }
  function show(message,action,handler,kind){ensureUi();var box=byId('flecapRuntimeStatus');box.className='show '+(kind||'');box.innerHTML='<span></span>';box.firstChild.textContent=message;if(action){var b=document.createElement('button');b.type='button';b.textContent=action;b.onclick=handler;box.appendChild(b)}}
  function hide(){var box=byId('flecapRuntimeStatus');if(box)box.className=''}
  function network(){if(navigator.onLine){show('Conexión recuperada · sincronizando');setTimeout(hide,2200)}else show('Sin conexión · los cambios quedarán pendientes',null,null,'offline')}
  window.addEventListener('online',network);window.addEventListener('offline',network);
  window.addEventListener('beforeinstallprompt',function(event){event.preventDefault();installPrompt=event;if(!standalone())show('FLECAP puede instalarse como aplicación','Instalar',async function(){var p=installPrompt;if(!p)return;installPrompt=null;await p.prompt();hide()})});
  window.addEventListener('appinstalled',function(){installPrompt=null;show('FLECAP instalada correctamente');setTimeout(hide,2200)});
  if('serviceWorker' in navigator){navigator.serviceWorker.addEventListener('controllerchange',function(){if(sessionStorage.getItem('flecap_sw_reloading'))return;sessionStorage.setItem('flecap_sw_reloading','1');location.reload()});navigator.serviceWorker.ready.then(function(reg){if(reg.waiting)show('Hay una nueva versión de FLECAP','Actualizar',function(){reg.waiting.postMessage({type:'SKIP_WAITING'})});reg.addEventListener('updatefound',function(){var worker=reg.installing;if(worker)worker.addEventListener('statechange',function(){if(worker.state==='installed'&&navigator.serviceWorker.controller)show('Hay una nueva versión de FLECAP','Actualizar',function(){worker.postMessage({type:'SKIP_WAITING'})})})})})}
  window.FLECAP_SELF_TEST=function(){var q=window.FLECAP_MODULE_PROGRESS&&window.FLECAP_MODULE_PROGRESS('quality'),p=window.FLECAP_MODULE_PROGRESS&&window.FLECAP_MODULE_PROGRESS('precom');return {quality:q||null,precom:p||null,pipingCentral:!!(typeof state!=='undefined'&&state&&Array.isArray(state.flecapPipingQuality)),online:navigator.onLine,standalone:standalone(),serviceWorker:'serviceWorker' in navigator}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureUi,{once:true});else ensureUi();
})();
