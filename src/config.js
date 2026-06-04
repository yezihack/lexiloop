export default {
  name: '词环',
  nameEn: 'LexiLoop',
  slogan: '循环背单词，轻盈不打扰',
  version: '1.0.0',
  github: 'https://github.com/yezihack/lexiloop',

  // 网站统计配置
  // 设置对应的 ID 后，统计代码会在生产环境自动加载
  // 本地开发(npm run dev)和 Tauri 桌面版不会加载统计
  analytics: {
    // 百度统计：https://tongji.baidu.com
    // 在统计代码中找到 hm.src 后 hmjs.src 中的 token 部分
    // 例：https://hm.baidu.com/hm.js?xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    baiduId: '',

    // Google Analytics 4：https://analytics.google.com
    // 格式：G-XXXXXXXXXX
    googleId: '',

    // 51.la 统计：https://www.51.la
    // 在代码中找到 id 参数
    laId: '3Q92VnPgPl1PKBWw',

    // CNZZ/友盟统计：https://www.umeng.com
    cnzzId: '',
  },
};
