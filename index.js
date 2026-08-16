// deepseek-harness-skin - local resident plugin: anime background skin for DeepSeek Harness Web UI
// Design (Codex-Dream-Skin style): CLEAR background, UI untouched, text readable.
//
// Reliability ladder:
//  1. Set the background on <html> (canvas background, below everything).
//  2. Make <body> transparent so the html background shows through.
//  3. Also create a fixed z-index:-1 layer as a fallback.
// setInterval + a targeted MutationObserver re-apply idempotently; the observer
// reacts to swapped full-viewport containers without looping on plugin styles.
// Image served via /deepseek-harness-skin/bg.png (verified 200 + browser Image load OK).
// The default image ships in assets/bg.png; config.background may point to any
// local png/jpg/jpeg/webp/gif and falls back to the bundled asset if missing.
// Zero external deps (no schemastery).
import { createReadStream, existsSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'deepseek-harness-skin'
export const inject = ['webServer']

const VEIL = 'linear-gradient(180deg, rgba(8,10,18,0.14) 0%, rgba(8,10,18,0.24) 55%, rgba(8,10,18,0.36) 100%), linear-gradient(90deg, rgba(8,10,18,0.24) 0%, rgba(8,10,18,0.15) 46%, rgba(8,10,18,0.08) 100%)'
const DEFAULT_IMAGE_PATH = fileURLToPath(new URL('./assets/bg.png', import.meta.url))
const BG_URL = '/deepseek-harness-skin/bg.png'
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' }

function resolveImagePath(config = {}) {
  const custom = typeof config.background === 'string' ? config.background.trim() : ''
  if (custom) {
    const customPath = resolve(custom)
    if (existsSync(customPath)) return customPath
    console.warn(`[deepseek-harness-skin] configured background not found, using bundled asset: ${customPath}`)
  }
  return DEFAULT_IMAGE_PATH
}

function buildInject() {
  return `<script data-deepseek-harness-skin>
(() => {
  const BG = '${VEIL}, url("${BG_URL}") center / cover no-repeat fixed';
  const SIDEBAR_BG = 'linear-gradient(180deg, rgba(250,251,251,0.82) 0%, rgba(250,251,251,0.62) 100%)';
  const MAIN_BG = 'linear-gradient(180deg, rgba(250,251,251,0.58) 0%, rgba(250,251,251,0.42) 55%, rgba(250,251,251,0.58) 100%)';
  const COMPOSER_BG = 'linear-gradient(180deg, rgba(250,251,252,0.66) 0%, rgba(250,251,252,0.42) 100%)';
  const COMPOSER_BLUR = 'blur(16px) saturate(150%)';
  const SETTINGS_BG = 'linear-gradient(180deg, rgba(250,251,252,0.97) 0%, rgba(250,251,252,0.93) 100%)';
  const SETTINGS_BLUR = 'blur(24px) saturate(140%)';
  // Mirror the structural class names emitted by the current DSH client
  // bundles so opaque app surfaces never get a chance to paint first.
  const SKIN_CSS = [
    'html, body, #root { background: transparent !important; }',
    '.p78RHG_frame, .p78RHG_sidebarCol, .Jvd9iG_root, .-Z6ZpG_root, .U2QE2G_root { background: transparent !important; }',
    '[class*="composerSeat"], [class*="composerStack"], [data-composer-card] { background: transparent !important; }',
    'body { text-shadow: 0 1px 2px rgba(8,10,18,0.55), 0 0 12px rgba(8,10,18,0.30); }',
  ].join('\\n');
  let applied = false;
  // The app paints opaque full-viewport surfaces (AppFrame, conversation
  // root, sidebar, details) over the html canvas. Clear those so the skin
  // stays visible, while keeping smaller cards and z-indexed overlays.
  const clearOpaqueSurfaces = () => {
    const vw = innerWidth;
    const vh = innerHeight;
    if (!vw || !vh) return;
    for (const el of document.querySelectorAll('body *')) {
      if (el.id === 'deepseek-harness-skin-bg') continue;
      if (el.dataset.dshDreamPanel) continue;
      if (el.dataset.dshDreamGlass) continue;
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width < vw * 0.8 && r.height < vh * 0.8) continue;
      const bg = s.backgroundColor;
      const img = s.backgroundImage;
      let alpha = 1;
      if (bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
        alpha = 0;
      } else {
        const m = bg.match(/rgba?\(([^)]+)\)/i);
        if (m) {
          const parts = m[1].split(',').map((p) => p.trim());
          if (parts.length >= 4) alpha = parseFloat(parts[3]) || 0;
        }
      }
      if (alpha < 1 && (img === 'none' || img === '')) continue;
      const z = parseInt(s.zIndex, 10);
      if (Number.isFinite(z) && z >= 100) continue;
      if (el.style.background !== 'transparent') el.style.setProperty('background', 'transparent', 'important');
    }
  };
  const markPanels = () => {
    const vw = innerWidth;
    const vh = innerHeight;
    if (!vw || !vh) return;
    let sidebar = null;
    let main = null;
    for (const el of document.querySelectorAll('body *')) {
      if (el.id === 'deepseek-harness-skin-bg') continue;
      const r = el.getBoundingClientRect();
      if (r.height < vh * 0.98 || r.width === 0) continue;
      if (!sidebar && r.x <= 1 && r.width >= 240 && r.width <= 340) sidebar = el;
      if (!main && r.x >= 200 && r.width >= vw * 0.6) main = el;
      if (sidebar && main) break;
    }
    if (sidebar) sidebar.dataset.dshDreamPanel = 'sidebar';
    if (main) main.dataset.dshDreamPanel = 'main';
  };
  const applyPanels = () => {
    const apply = (kind, bg) => {
      const el = document.querySelector('[data-dsh-dream-panel="' + kind + '"]');
      if (el && el.style.background !== bg) el.style.setProperty('background', bg, 'important');
    };
    apply('sidebar', SIDEBAR_BG);
    apply('main', MAIN_BG);
    const sidebar = document.querySelector('[data-dsh-dream-panel="sidebar"]');
    if (sidebar) {
      for (const el of sidebar.querySelectorAll('[class*="fade"]')) {
        el.style.setProperty('background', 'transparent', 'important');
      }
    }
  };
  const markComposer = () => {
    for (const card of document.querySelectorAll('[data-composer-card], [class*="btGtYW_card"]')) {
      if (card.dataset.dshDreamGlass) continue;
      if (card.querySelector('textarea[class*="btGtYW_input"]')) {
        card.dataset.dshDreamGlass = 'composer';
      }
    }
  };
  const applyComposer = () => {
    for (const el of document.querySelectorAll('[data-dsh-dream-glass="composer"]')) {
      if (el.style.background !== COMPOSER_BG) el.style.setProperty('background', COMPOSER_BG, 'important');
      if (el.style.backdropFilter !== COMPOSER_BLUR) el.style.setProperty('backdrop-filter', COMPOSER_BLUR, 'important');
      if (el.style.getPropertyValue('-webkit-backdrop-filter') !== COMPOSER_BLUR) {
        el.style.setProperty('-webkit-backdrop-filter', COMPOSER_BLUR, 'important');
      }
      if (el.style.border !== '1px solid rgba(255,255,255,0.55)') {
        el.style.setProperty('border', '1px solid rgba(255,255,255,0.55)', 'important');
      }
      if (el.style.boxShadow !== '0 8px 32px rgba(8,10,18,0.12)') {
        el.style.setProperty('box-shadow', '0 8px 32px rgba(8,10,18,0.12)', 'important');
      }
    }
    // The composer seat paints a white fade meant to blend the message list
    // into the input card; it becomes a hard white edge on the anime skin.
    for (const el of document.querySelectorAll('[class*="composerSeat"], [class*="composerStack"], [data-composer-seat]')) {
      if (el.style.background !== 'transparent') el.style.setProperty('background', 'transparent', 'important');
    }
  };
  const markSettings = () => {
    const vw = innerWidth;
    const vh = innerHeight;
    if (!vw || !vh) return;
    let heading = null;
    for (const el of document.querySelectorAll('h1,h2,h3,h4,[role="heading"],[class*="title" i],[class*="header" i]')) {
      const t = (el.textContent || '').trim();
      if (t === '设置' || t === 'Settings') {
        heading = el;
        break;
      }
    }
    let node = heading ? heading.parentElement : null;
    let best = null;
    let bestArea = Infinity;
    while (node && node !== document.body) {
      if (!node.dataset.dshDreamGlass && !node.dataset.dshDreamPanel) {
        const r = node.getBoundingClientRect();
        if (r.width >= 320 && r.height >= 160 && r.width <= vw - 8 && r.height <= vh - 8) {
          const area = r.width * r.height;
          if (area < bestArea) {
            bestArea = area;
            best = node;
          }
        }
      }
      node = node.parentElement;
    }
    if (best && !best.dataset.dshDreamGlass) best.dataset.dshDreamGlass = 'settings';
  };
  const applySettings = () => {
    for (const el of document.querySelectorAll('[data-dsh-dream-glass="settings"]')) {
      if (el.style.background !== SETTINGS_BG) el.style.setProperty('background', SETTINGS_BG, 'important');
      if (el.style.backdropFilter !== SETTINGS_BLUR) el.style.setProperty('backdrop-filter', SETTINGS_BLUR, 'important');
      if (el.style.getPropertyValue('-webkit-backdrop-filter') !== SETTINGS_BLUR) {
        el.style.setProperty('-webkit-backdrop-filter', SETTINGS_BLUR, 'important');
      }
      if (el.style.border !== '1px solid rgba(255,255,255,0.7)') {
        el.style.setProperty('border', '1px solid rgba(255,255,255,0.7)', 'important');
      }
      if (el.style.boxShadow !== '0 12px 40px rgba(8,10,18,0.25)') {
        el.style.setProperty('box-shadow', '0 12px 40px rgba(8,10,18,0.25)', 'important');
      }
    }
  };
  const ensure = () => {
    const doc = document.documentElement;
    const b = document.body;
    if (document.head && !document.getElementById('deepseek-harness-skin-style')) {
      const style = document.createElement('style');
      style.id = 'deepseek-harness-skin-style';
      style.textContent = SKIN_CSS;
      document.head.appendChild(style);
    }
    if (doc) {
      if (doc.style.background !== BG) doc.style.setProperty('background', BG, 'important');
      if (doc.style.backgroundAttachment !== 'fixed') doc.style.setProperty('background-attachment', 'fixed', 'important');
    }
    if (b && b.style.background !== 'transparent') {
      b.style.setProperty('background', 'transparent', 'important');
    }
    let el = document.getElementById('deepseek-harness-skin-bg');
    if (!el && b) {
      el = document.createElement('div');
      el.id = 'deepseek-harness-skin-bg';
      el.style.position = 'fixed';
      el.style.top = '0';
      el.style.left = '0';
      el.style.width = '100vw';
      el.style.height = '100vh';
      el.style.zIndex = '-1';
      el.style.pointerEvents = 'none';
      el.style.background = BG;
      el.style.backgroundAttachment = 'fixed';
      if (b) b.insertBefore(el, b.firstChild);
    }
    markPanels();
    clearOpaqueSurfaces();
    applyPanels();
    markComposer();
    applyComposer();
    markSettings();
    applySettings();
    if (!applied) {
      applied = true;
      console.log('[deepseek-harness-skin] applied', doc ? doc.style.background.slice(0, 60) : 'no-doc');
    }
  };
  ensure();
  setInterval(ensure, 300);
  if (!window.__dshDreamObs && document.body) {
    const isSkinNode = (el) => {
      if (!el) return false;
      if (el.id === 'deepseek-harness-skin-bg' || el.id === 'deepseek-harness-skin-style') return true;
      return !!(el.dataset.dshDreamPanel || el.dataset.dshDreamGlass || el.dataset.composerCard || el.dataset.composerSeat);
    };
    const isComposerNode = (el) => {
      if (!el || el.nodeType !== 1) return false;
      return !!(el.matches?.('[data-composer-card], [data-composer-seat]') || el.querySelector('[data-composer-card], [data-composer-seat]'));
    };
    const mo = new MutationObserver((muts) => {
      const vw = innerWidth;
      const vh = innerHeight;
      if (!vw || !vh) return;
      let relevant = false;
      for (const m of muts) {
        if (m.type === 'attributes') {
          const target = m.target;
          if (target.matches?.('[data-composer-card], [data-composer-seat]')) relevant = true;
          else if (isSkinNode(target)) continue;
          else {
            const r = target.getBoundingClientRect();
            if (r.width >= vw * 0.8 && r.height >= vh * 0.8) relevant = true;
          }
        } else {
          for (const n of [...m.addedNodes, ...m.removedNodes]) {
            if (n.nodeType !== 1) continue;
            if (isComposerNode(n)) relevant = true;
            else if (isSkinNode(n)) continue;
            else {
              const r = n.getBoundingClientRect();
              if (r.width >= vw * 0.8 && r.height >= vh * 0.8) relevant = true;
            }
          }
        }
      }
      if (relevant) ensure();
    });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    window.__dshDreamObs = mo;
  }
  addEventListener('pageshow', ensure);

  const img = new Image();
  img.onload = () => console.log('[deepseek-harness-skin] image loaded OK', img.width + 'x' + img.height);
  img.onerror = (e) => console.error('[deepseek-harness-skin] image load FAILED', e && e.type);
  img.src = '${BG_URL}';
})();
</script>`
}

export function apply(ctx, config = {}) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: BG_URL,
    handler: (_req, res) => {
      try {
        const imagePath = resolveImagePath(config)
        if (!existsSync(imagePath)) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
          res.end('deepseek-harness-skin: background image not found: ' + imagePath)
          return
        }
        res.writeHead(200, {
          'Content-Type': MIME[extname(imagePath).toLowerCase()] ?? 'application/octet-stream',
          'Cache-Control': 'no-store',
        })
        createReadStream(imagePath).pipe(res)
      } catch (err) {
        res.writeHead(500)
        res.end(String(err))
      }
    },
  }), 'deepseek-harness-skin: serve background image')

  const injectHtml = buildInject()
  ctx.effect(() => ctx.webServer.tapIndex((html) => {
    return html.includes('</body>') ? html.replace('</body>', injectHtml + '</body>') : html + injectHtml
  }), 'deepseek-harness-skin: inject background skin script into index.html')
}
