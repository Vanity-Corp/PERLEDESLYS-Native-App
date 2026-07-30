// Shared YouTube logic for the native (WebView) and web (iframe) VideoEmbed
// variants. Videos/lives store a URL the admin pastes (the DB column is still
// named `vimeoUrl` for historical reasons but now holds YouTube URLs). We parse
// the video id and build a small HTML page driving the YouTube IFrame API,
// bridging playback position back for the "resume" feature.

// Default video used when a content item has no (parseable) URL yet.
export const DEFAULT_YOUTUBE_URL = "https://www.youtube.com/watch?v=o5r2Fu31K3Q";

// Accepts a full YouTube URL or a bare 11-char id. Handles:
//   https://www.youtube.com/watch?v=o5r2Fu31K3Q
//   https://youtu.be/o5r2Fu31K3Q
//   https://www.youtube.com/embed/o5r2Fu31K3Q
//   https://www.youtube.com/shorts/o5r2Fu31K3Q
//   o5r2Fu31K3Q
export function parseYouTube(input?: string | null): string | null {
  if (!input) return null;
  const s = input.trim();
  if (!s) return null;

  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/(?:embed|shorts|v)\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return null;
}

// A user-facing YouTube watch URL (for the "voir sur YouTube" link).
export function youTubeWatchUrl(input?: string | null): string {
  const id = parseYouTube(input) ?? parseYouTube(DEFAULT_YOUTUBE_URL)!;
  return `https://www.youtube.com/watch?v=${id}`;
}

export type VideoMessage =
  | { type: "ready" }
  | { type: "progress"; seconds: number; duration: number }
  | { type: "ended" }
  | { type: "error"; message: string };

// HTML that loads the YouTube IFrame API, seeks to `startAt`, and posts
// timeupdate/ended events. `post()` works both inside a native WebView
// (window.ReactNativeWebView) and a web <iframe srcDoc> (window.parent).
export function buildPlayerHtml(
  videoId: string,
  startAt = 0,
  autoplay = false,
): string {
  const start = Math.max(0, Math.floor(startAt));
  const auto = autoplay ? 1 : 0;
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/><style>*{margin:0;padding:0;box-sizing:border-box}html,body{height:100%;width:100%;background:#000;overflow:hidden}#p{position:absolute;inset:0}#p iframe{position:absolute!important;top:0!important;left:0!important;width:100%!important;height:100%!important;border:0}</style></head><body><div id="p"></div><script src="https://www.youtube.com/iframe_api"></script><script>
(function(){
  function post(m){try{var s=JSON.stringify(m);if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(s);}else if(window.parent){window.parent.postMessage(s,'*');}}catch(e){}}
  var player, timer;
  window.onYouTubeIframeAPIReady=function(){
    try{
      player=new YT.Player('p',{
        videoId:${JSON.stringify(videoId)},
        playerVars:{autoplay:${auto},start:${start},playsinline:1,rel:0,modestbranding:1},
        events:{
          onReady:function(){post({type:'ready'});
            timer=setInterval(function(){
              try{post({type:'progress',seconds:player.getCurrentTime(),duration:player.getDuration()});}catch(e){}
            },1000);
          },
          onStateChange:function(e){ if(e.data===YT.PlayerState.ENDED){post({type:'ended'});} }
        }
      });
    }catch(e){post({type:'error',message:String(e)});}
  };
})();
</script></body></html>`;
}
