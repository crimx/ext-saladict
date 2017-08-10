# Saladict 沙拉查词5

Chrome 浏览器插件，网页划词翻译。

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg" target="_blank"><img src="saladict.jpg" /></a>
</p>

功能一览：

- 多词典支持，英汉、英英、俚语、词源、权威例句、汉语、释义分布图、谷歌翻译**全包**。
- 支持**四种**划词方式，支持 iframe 划词。
- 支持三按 ctrl 快速查词。
- 也可**点击图标**快速查词。
- 右键支持谷歌**网页翻译**，支持更多词典页面直达。
- 各个词典面板支持个性化调整。
- 查词面板可钉住可拖动可输入。
- 查词结果支持**导出图片**。
- 可显示当前页面二维码。

理论上支持所有 Chrome 系浏览器。效果图：

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg" target="_blank"><img src="screen.gif" /></a>
</p>

# 下载

- Chrome Web Store: <https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg>
- crx: <https://github.com/crimx/crx-saladict/releases/>

为什么需要这些权限：
- 划词需要访问网页数据
- 快速查词会直接搜索剪贴板文字

除此以外本扩展不收集任何资料，第三方下载请注意对比扩展 ID `cdonnmffkdaoajfknoeeecmchibpmkmg`。

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg" target="_blank"><img src="screenshot.jpg" /></a>
</p>

# 更新

【5.15.4】
1. Bug 修复

【5.15.2】
1. 增加 Macmillan 词典；
2. 海词增加词频分级；
3. buried an easter egg；
4. 修复拖动问题，其它 bug 修复；

查看[更新历史](./CHANGELOG.md)。

# 开发

添加词典很简单，以 bing 为例

Clone 库并 `$ npm install`

## 注册词典

`src/app-config.js` 在 `dicts/all` 注册词典并添加相关设置。

```javascript
{
  dicts: {
    all: {
      // ...
      bing: {
        id: 'bing',
        page: 'https://cn.bing.com/dict/search?q=%s',
        preferredHeight: 160,
        options: {
          tense: true,
          phsym: true,
          cdef: true
        }
      }
      // ...
    }
  }
}
```

- `id` 为每个词典的标识符；
- `page`为点击标题是跳转的链接，`%s`会替换成关键字；
- `preferredHeight` 为词典默认高度，超过默认高度的内容会先隐藏起来并显示下箭头；
- 词典本身的设置放在 `options` 下，只能是 `boolean` 或者 `number`，会自动在设置页面生成相应选项。

## 添加模块

在 `src/dictionaries/` 下以词典 id 命名新建文件夹，放置以下文件（可从其它词典复制过来修改），如 bing：

```
bing
├─ favicon.png
├─ _locales.json
├─ engine.js
└─ view.vue
```

- favicon.png 为 32×32 图片；
- _locales.json 中添加多语言，`name` 为词典名，`options` 下为自定义的设置；
- engine.js 负责抓取结果，输出一个函数，返回一个 Promise 包含自定义的结果，最终会被传到 view.vue 上作为 `result` props；
  ```javascript
  /**
  * Search text and give back result
  * @param {string} text - Search text
  * @param {object} config - app config
  * @returns {Promise} A promise with the result, which will be passed to view.vue as `result` props
  */
  export default function search (text, config) {
    return new Promise((resolve, reject) => {
      // ...
    })
  }
  ```
- view.vue 负责渲染结果，如 bing；
  ```html
  <template>
  <section>
    <div class="bing-result" v-if="result">
      <!-- content -->
    </div>
  </section>
  </template>

  <script>
  export default {
    name: 'Bing',
    props: ['result']
  }
  </script>

  <style scoped>
  .bing-result {
    padding: 10px;
  }
  </style>
  ```

具体使用可参考其它词典。
