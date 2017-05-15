# Saladict 沙拉查词5

Chrome 浏览器插件，网页划词翻译。

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg" target="_blank"><img src="saladict.jpg" /></a>
</p>

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

【5.5.14】
1. 词典可默认不展开

【5.5.12】
1. 增加右键谷歌网页翻译
2. 增加双语例句
3. 其它 bug 修复

【5.3.9】
1. 降低查词图标敏感度
2. 添加重置按钮
3. 增加 Howjsay 发音
4. 其它 bug 修复

【5.1.6】
1. 增加双击查词
2. 减少动画加快显示
3. 修复无法关闭
4. 修复设置时高度不更新
5. 其它 bug 修复

【5.0.0】
1. 全新重写，全面优化，性能大幅度提高。
2. 词典可以增删排序。
3. 新增多个词典。
4. 右键支持更多词典搜索。
5. 保留了置顶与拖动功能。
6. 更好用的配置界面。
7. 更多变化使用中发现吧。

【4.1.1】
1. 在必应词典和 Urban Dictionary 基础上增加 Vocabulary.com 海词统计和 Howjsay ，释义发音更详细。
2. 右键查词，选词后右键可直达牛津词典、韦氏词典、词源、谷歌翻译等等。
3. 新增三种划词模式，适合各种强迫症。
4. 连续按三次ctrl还可以直接查词，随时查词，无需再另开词典占内存啦。
5. 词典界面可以拖动，还可以固定在网页上，看论文利器啊。
6. 延迟响应时间，不容易误按，手残党福利。
7. 保留了显示当前页面二维码功能（设置界面，鼠标悬停在 “Saladict”标题上）。
8. 更多功能慢慢发现吧;D

【3.0.1】
 1. 增加了划译开关
 2. 增加了 urban 词典的例子
 3. 增加了必应搜索图标
 4. 搜索图标右击可以变成翻译搜索
 5. 修复了几处错误并加速了结果显示

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
