# 沙拉查词 Saladict

[![Version](https://img.shields.io/github/release/crimx/ext-saladict.svg?label=version)](https://github.com/crimx/ext-saladict/releases)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/cdonnmffkdaoajfknoeeecmchibpmkmg.svg?label=Chrome%20users)](https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg?hl=en)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/cdonnmffkdaoajfknoeeecmchibpmkmg.svg?label=Chrome%20stars)](https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg?hl=en)
[![Mozilla Add-on](https://img.shields.io/amo/users/ext-saladict.svg?label=Firefoxe%20users)](https://addons.mozilla.org/firefox/addon/ext-saladict/)
[![Mozilla Add-on](https://img.shields.io/amo/stars/ext-saladict.svg?label=Firefoxe%20stars)](https://addons.mozilla.org/firefox/addon/ext-saladict/)

[![Build Status](https://travis-ci.com/crimx/ext-saladict.svg)](https://travis-ci.com/crimx/ext-saladict)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?maxAge=2592000)](http://commitizen.github.io/cz-cli/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-brightgreen.svg?maxAge=2592000)](https://conventionalcommits.org)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?maxAge=2592000)](https://standardjs.com/)
[![License](https://img.shields.io/github/license/crimx/ext-saladict.svg?colorB=44cc11?maxAge=2592000)](https://github.com/crimx/ext-saladict/blob/dev/LICENSE)

[【官网】](https://www.crimx.com/ext-saladict/)Chrome/Firefox 浏览器插件，网页划词翻译。

<p align="center">
  <a href="https://github.com/crimx/ext-saladict/releases/" target="_blank"><img src="https://raw.githubusercontent.com/wiki/crimx/ext-saladict/images/notebook.gif" /></a>
</p>

## 下载

- [谷歌应用商店](https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg?hl=en)
- [火狐应用商店](https://addons.mozilla.org/firefox/addon/ext-saladict/)
- [微软 Edge 商店](https://microsoftedge.microsoft.com/addons/detail/idghocbbahafpfhjnfhpbfbmpegphmmp)(由 @rumosky 上传)
- 其它途径见本项目[发布页面](https://github.com/crimx/ext-saladict/releases)。

沙拉查词 7 为完全重写的版本。增加了更多细腻的动效与流畅的交互，更快速更稳定更多自定义设置。

## 改动日志

[CHANGELOG.md](./CHANGELOG.md)

## 从源码构建

```bash
git clone git@github.com:crimx/ext-saladict.git
cd ext-saladict
yarn install
yarn pdf
```

在项目跟添加 `.env` 文件，参考 `.env.example` 格式（可留空如果你不要这些词典）。

```bash
yarn build
```

在 `build/` 目录下可查看针对各个浏览器打包好的扩展包。

## 开发

见[项目贡献指南](./CONTRIBUTING-zh.md)。

## 如何向本项目贡献代码

见[项目贡献指南](./CONTRIBUTING-zh.md)。

## 声明

沙拉查词为自由开源项目，仅做学习交流之用，每个用户均可免费下载使用，如果认为你的合法权益收到侵犯请马上联系[作者](https://github.com/crimx)。

沙拉查词项目为 [MIT](https://github.com/crimx/ext-saladict/blob/dev/LICENSE) 许可，你可以随意使用源码，但必须附带该许可与版权声明。请勿用于任何违法犯罪行为，沙拉查词强烈谴责并会尽可能配合追究责任。对于照搬源码二次发布的套壳项目沙拉查词有责任对平台和用户发出相应的举报和提醒。

## 更多截图

<p align="center">
  <a href="https://github.com/crimx/ext-saladict/releases/" target="_blank"><img src="https://github.com/crimx/ext-saladict/wiki/images/youdao-page.gif" /></a>
</p>

<p align="center">
  <a href="https://github.com/crimx/ext-saladict/releases/" target="_blank"><img src="https://github.com/crimx/ext-saladict/wiki/images/screen-notebook.png" /></a>
</p>

<p align="center">
  <a href="https://github.com/crimx/ext-saladict/releases/" target="_blank"><img src="https://github.com/crimx/ext-saladict/wiki/images/pin.gif" /></a>
</p>
