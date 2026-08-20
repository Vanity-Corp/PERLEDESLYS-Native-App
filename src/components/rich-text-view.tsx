import { useState } from "react";
import { View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

// Renders rich-text HTML (authored in the dashboard Tiptap editor) inside a
// WebView with a readable stylesheet.
//
// Two modes:
//   • default (auto-height) — the page reports its full content height so the
//     WebView grows to fit inside an outer ScrollView; the text is shown in
//     full and never clipped. Used for articles, "À propos", etc.
//   • scrollable — the WebView fills its parent (e.g. a fixed-height dialog)
//     and scrolls its own content. Used for the long legal texts (Conditions
//     générales / Politique de confidentialité).
function buildHtml(content: string, onDark: boolean): string {
  // On the maroon "À propos" card the body sits on a dark background, so text,
  // headings and links must be light; the default (used everywhere else) stays
  // dark-on-light.
  const bodyColor = onDark ? "rgba(255,255,255,0.9)" : "#2b2b2b";
  const headingColor = onDark ? "#ffffff" : "inherit";
  const linkColor = onDark ? "#E8883C" : "#3E090E";
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{background:transparent}
    body{font-family:-apple-system,'Segoe UI',Roboto,sans-serif;color:${bodyColor};font-size:16px;line-height:1.65;padding:2px 0}
    h1,h2,h3{color:${headingColor}}
    h1{font-size:22px;margin:18px 0 8px;font-weight:700}
    h2{font-size:20px;margin:18px 0 8px;font-weight:600}
    h3{font-size:17px;margin:16px 0 6px;font-weight:600}
    p{margin:0 0 12px}
    ul,ol{margin:0 0 12px 20px}
    li{margin:0 0 6px}
    img{max-width:100%;height:auto;border-radius:12px;margin:12px 0;display:block}
    a{color:${linkColor}}
  </style></head><body>
    <div id="root">${content}</div>
    <script>
      function postHeight(){
        var root = document.getElementById('root');
        var h = Math.max(root.scrollHeight, document.body.scrollHeight);
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(String(h));
      }
      window.addEventListener('load', postHeight);
      document.addEventListener('DOMContentLoaded', postHeight);
      // Re-measure as images decode and as layout settles (fonts, reflow).
      Array.prototype.forEach.call(document.images, function(img){
        if(!img.complete){ img.addEventListener('load', postHeight); img.addEventListener('error', postHeight); }
      });
      if (window.ResizeObserver) {
        new ResizeObserver(postHeight).observe(document.getElementById('root'));
      }
      [50,150,300,600,1200].forEach(function(t){ setTimeout(postHeight, t); });
    </script>
  </body></html>`;
}

export function RichTextView({
  html,
  scrollable = false,
  onDark = false,
}: {
  html: string;
  scrollable?: boolean;
  onDark?: boolean;
}) {
  const [height, setHeight] = useState(80);
  if (!html?.trim()) return null;

  // Scrollable mode: fill the parent and let the WebView scroll internally.
  if (scrollable) {
    return (
      <View style={{ flex: 1 }}>
        <WebView
          originWhitelist={["*"]}
          source={{ html: buildHtml(html, onDark) }}
          style={{ flex: 1, backgroundColor: "transparent" }}
          scrollEnabled
          showsVerticalScrollIndicator
        />
      </View>
    );
  }

  // Auto-height mode: grow to the content's full height (shown inside an outer
  // ScrollView by the caller).
  const onMessage = (e: WebViewMessageEvent) => {
    const h = Number(e.nativeEvent.data);
    if (!Number.isNaN(h) && h > 0) setHeight(h);
  };

  return (
    <View style={{ height }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: buildHtml(html, onDark) }}
        style={{ flex: 1, backgroundColor: "transparent" }}
        scrollEnabled={false}
        onMessage={onMessage}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
