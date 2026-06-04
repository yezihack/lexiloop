/**
 * 网站统计初始化
 * 仅跳过 npm run dev 开发模式，其余环境（build、build:local、Tauri）均加载
 */
import config from './config.js';

// 动态插入 script 标签
function injectScript(src, attrs = {}) {
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
}

// 动态插入内联 script
function injectInlineScript(code) {
  const s = document.createElement('script');
  s.textContent = code;
  document.head.appendChild(s);
}

export function initAnalytics() {
  // 仅开发模式跳过（npm run dev）
  if (import.meta.env.DEV) return;

  const { baiduId, googleId, laId, cnzzId } = config.analytics;

  // 百度统计
  if (baiduId) {
    injectInlineScript(`
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?${baiduId}";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();
    `);
  }

  // Google Analytics 4
  if (googleId) {
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${googleId}`);
    injectInlineScript(`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${googleId}');
    `);
  }

  // 51.la 统计
  if (laId) {
    injectScript(`https://sdk.51.la/js-sdk-pro.min.js`, {
      charset: 'UTF-8',
      id: 'LA_COLLECT',
    });
    injectInlineScript(`LA.init({id: "${laId}", ck: "${laId}"})`);
  }

  // CNZZ/友盟统计
  if (cnzzId) {
    injectScript(
      `https://s9.cnzz.com/z_stat.php?id=${cnzzId}&web_id=${cnzzId}`
    );
  }
}
