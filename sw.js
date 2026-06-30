/* DentalSpark Service Worker —— 网络优先（联网总是取最新，断网回退缓存） */
const CACHE='dentalspark-v2';
const ASSETS=['./','./index.html','./dentaview.html','./manifest.webmanifest',
  './icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const ks=await caches.keys();
    await Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting();});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith((async()=>{
    try{
      const fresh=await fetch(e.request,{cache:'no-store'});
      const copy=fresh.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      return fresh;
    }catch(err){
      const cached=await caches.match(e.request);
      return cached || caches.match('./index.html');
    }
  })());
});
