// Shared Vimeo logic for the native (WebView) and web (iframe) VimeoEmbed
// variants (WIRING_PLAN B4). Videos/lives are data-driven from a `vimeoUrl`
// the admin pastes; we parse the id + private hash and build a small HTML page
// that drives the Vimeo Player SDK and bridges playback position for "resume".

export type VimeoRef = { id: string; hash?: string };

// Accepts a full Vimeo URL or a bare id. Handles:
//   https://vimeo.com/17433286?h=6bcdf4c934
//   https://player.vimeo.com/video/17433286?h=6bcdf4c934
//   https://vimeo.com/17433286/6bcdf4c934   (path-style hash)
//   17433286
export function parseVimeo(input?: string | null): VimeoRef | null {
  if (!input) return null;
  const s = input.trim();
  if (!s) return null;

  const idMatch =
    s.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/) ?? s.match(/^(\d+)/);
  const id = idMatch?.[1];
  if (!id) return null;

  let hash: string | undefined;
  const q = s.match(/[?&]h=([a-zA-Z0-9]+)/);
  if (q) hash = q[1];
  if (!hash) {
    const pathHash = s.match(/vimeo\.com\/(?:video\/)?\d+\/([a-zA-Z0-9]+)/);
    if (pathHash) hash = pathHash[1];
  }
  return { id, hash };
}

export type VimeoMessage =
  | { type: "ready" }
  | { type: "progress"; seconds: number; duration: number }
  | { type: "ended" }
  | { type: "error"; message: string };

// HTML that loads the Vimeo Player SDK, seeks to `startAt`, and posts
// timeupdate/ended events. `post()` works both inside a native WebView
// (window.ReactNativeWebView) and a web <iframe srcDoc> (window.parent).
export function buildPlayerHtml(ref: VimeoRef, startAt = 0): string {
  const opts = JSON.stringify({
    id: Number(ref.id),
    ...(ref.hash ? { h: ref.hash } : {}),
    responsive: true,
    autoplay: false,
    playsinline: true,
  });
  const start = Math.max(0, Math.floor(startAt));
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/><style>html,body{margin:0;background:#000;height:100%;overflow:hidden}#p,iframe{width:100%;height:100%}</style></head><body><div id="p"></div><script src="https://player.vimeo.com/api/player.js"></script><script>
(function(){
  function post(m){try{var s=JSON.stringify(m);if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(s);}else if(window.parent){window.parent.postMessage(s,'*');}}catch(e){}}
  try{
    var player=new Vimeo.Player('p', ${opts});
    var START=${start};
    player.ready().then(function(){ if(START>0){ player.setCurrentTime(START).catch(function(){}); } post({type:'ready'}); });
    player.on('timeupdate', function(d){ post({type:'progress', seconds:d.seconds, duration:d.duration}); });
    player.on('ended', function(){ post({type:'ended'}); });
  }catch(e){ post({type:'error', message:String(e)}); }
})();
</script></body></html>`;
}
