# Saladict 沙拉查词5

Chrome 浏览器插件，网页划词翻译。

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg" target="_blank"><img src="saladict.jpg" /></a>
</p>

功能一览：

- [x] 多词典支持，英汉、英英、俚语、词源、权威例句、汉语、释义分布图、谷歌翻译**全包**。
- [x] 支持**四种**划词方式，支持 iframe 划词。
- [x] 支持三按 ctrl 快速查词。
- [x] 也可点击图标快速查词。
- [x] 右键支持谷歌网页翻译，支持更多词典页面直达。
- [x] 各个词典面板支持个性化调整。
- [x] 查词面板可钉住可拖动可输入。
- [x] 查词结果支持导出图片。
- [x] 可显示当前页面二维码。

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

【5.11.23】
1. 增加两岸词典与国语辞典
2. 增加点击图标弹出查词面板（太多人提这个要求了，都是从其它扩展带来的习惯）
3. 查词结果可以导出图片，在绿色工具栏上可以看到
4. 二维码功能移到工具栏上
5. 其它 bug 修复、性能优化

查看[更新历史](./CHANGELOG.md)。

# 开发

添加词典很简单，以 bing 为例

Clone 库并 `$ npm install`

## 注册词典

`src/app-config.js` 在 `dicts/all` 注册词典并添加相关设置。

```javascript
{
  dicts: {
    // default selected dictionaries
    selected: ['bing', 'urban', 'vocabulary', 'dictcn'],
    all: {
      // ...
      bing: {
        id: 'bing',
        favicon: 'bing.png',
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
- `favicon` 在 `assets/static/dicts/` 下，为 32×32 图片；
- `page`为点击标题是跳转的链接，`%s`会替换成关键字；
- `preferredHeight` 为词典默认高度，超过默认高度的内容会先隐藏起来并显示下箭头；
- 词典本身的设置放在 `options` 下，只能是 `boolean` 或者 `number`，会自动在设置页面生成相应选项。

## 添加多语言

在 `src/_locales/` 的每个语言里添加词典需要的文字。如 `src/_locales/zh_CN/messages.json`：

```json
{
  "dict_bing": {
    "description": "Dictionary Name",
    "message": "必应词典"
  }
}
```

上面注册时添加了三个设置，分别补上说明，命名为 `dict_[id]_[option]`：

```json
{
  "dict_bing_tense": {
     "description": "Dictionary option",
     "message": "显示单词时态"
  },

  "dict_bing_phsym": {
     "description": "Dictionary option",
     "message": "显示单词发音"
  },

  "dict_bing_cdef": {
     "description": "Dictionary option",
     "message": "显示单词解释"
  }
}
```

## 解析模块

解析模块负责从词典服务器获得结果并提取需要的信息。

`src/background/dicts/` 下新建文件。命名为 `[id].js` ，需跟词典 ID 一致，大小写不敏感。

如 `bing.js`：

```javascript
export default function search (text, config) {
  return new Promise((resolve, reject) => {

  })
}
```

导出一个 `search` 函数，接受关键字 `text` 和只读的配置 `config`，返回 `Promise` ，resolve 的数据为任何可序列化的数据。

（可通过 `config.dicts.all.bing.options` 获得自身的设置）

## 添加组件

最后一步为添加试图组件，显示结果。

`src/content/panel/components/dicts/` 下添加 Vue 组件，`[id].vue`，大小写不敏感。

如 `Bing.vue`：

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

解析模块 resolve 的数据最终会传到 `result`。直接根据 `result` 显示结果就行。
