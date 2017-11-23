# Changelog

[Unreleased]

[5.27.3] - 2017-11-23
### Added
- 增加有道分级网页翻译2.0（支持 HTTPS）
- 增加自动发音
- 增加查词历史记录
- 面板钉住时支持多种查词模式
- 必应词典无结果时增加相关词语
- 词带内部双击查词，点击单词链接也能直接查词
- 对抓取页面筛选节点以增强安全性
- 自身页面通信增加 page id 以解决冲突问题

### Changed
- 查看页面二维码移到地址栏旁的图标中
- Chrome 最低版本支持提升为 55 以提升性能与减少大小
- 重构代码以分散复杂度
- 二维码生成改用 vue-qriously 更轻盈

### Fixed
- 修复打开 PDF 时弹出框查词自动粘贴失效
- 修复 howjsay 相关词语获取
- 修复查词滚动错误

[5.19.1] - 2017-11-15
### Added
- 可配置双击时长

### Fixed
- 默认不显示词典以避免闪现

[5.18.5] - 2017-11-13
### Added
- 增加汉典
- 可配置词典只在某种语言下显示

### Fixed
- 修复繁体词典不能查简体字问题
- 修复默认收起的词典不能隐藏
- 更新 vuedraggable 修复拖动问题
- 延迟音频播放避免误触
- 每次查词滚动到顶端

[5.16.1] - 2017-10-28
### Added
- 添加 PDF 支持

### Fixed
- 修复通知框点击

[5.15.21] - 2017-10-26
### Changed
- 全不选时右键菜单隐藏

### Fixed
- 更新时才弹出通知
- 重构 event page，顶层只保留监听，加快加载速度
- 去掉 require.context，webpack 会自动生成路径

[5.15.19] - 2017-10-11
### Changed
- 重构事件监听
- 重构 chrome api wrap

### Fixed
- 点击发音
- 自动恢复 dom 挂载
- 更新 etymonline 词典

[5.15.14] - 2017-09-05
### Changed
- 弹出查词框时自动选中所有剪贴板内容
- 查词结构导出图片样式调整

[5.15.12] - 2017-09-02
### Fixed
- 修复 ctrl/⌘ 模式时切换窗口的问题
- 麦克米伦标题修复

### Changed
- 关闭自动查词

[5.15.9] - 2017-08-23
### Fixed
- 更新必应词典
- 修复拖动抖动问题
- 样式修补

### Changed
- 第一次安装时打开设置页面

[5.15.4] - 2017-08-10
### Fixed
- 词典样式
- 麦克米伦检测问题

[5.15.2] - 2017-08-06
### Added
- Macmillan 词典
- 海词词频分级
- 彩蛋

### Fixed
- 拖动问题
- 其它小修正

[5.12.8] - 2017-07-31
### Added
-  增加 Longman Business 词典

### Changed
- 只对剪贴板单个单词自动查词，多个单词会自动粘贴，但不开始查找，需要再按一下回车
- 使用懒加载性能大幅度优化，提取公共模块体积减少
- 更紧凑的架构设计，添加词典更简单

### Fixed
- 修复 Bing 发音问题

## [5.11.23] - 2017-07-13
### Added
- 增加两岸词典与国语辞典
- 增加点击图标弹出查词面板
- 查词结果可以导出图片，在绿色工具栏上可以看到

### Changed
- 二维码功能移到工具栏上

### Fixed
- i18n 带 fallback
- svg 属性迁就 html2canvas
- 设置页面开始连查两遍的问题
- 通过 `:root:root:root:root:root` 进一步增加元素权值
- 改为插到 body 末尾

## [5.7.20] - 2017-05-21
### Added
- 添加词源词典
- 右键添加有道词典、海词词典和金山词霸

### Security
- 增强稳定性

## [5.5.14] - 2017-05-15
### Changed
- 词典可默认不展开

## [5.5.12] - 2017-05-15
### Added
- 增加右键谷歌网页翻译
- 增加双语例句

## [5.3.9] - 2017-05-03
### Added
- 添加重置按钮
- 增加 Howjsay 发音

### Fixed
- 降低查词图标敏感度

## [5.1.6] - 2017-04-06
### Added
- 增加双击查词

### Fixed
- 减少动画加快显示
- 修复无法关闭
- 修复设置时高度不更新

## [5.0.0] - 2017-04-04
### Changed
- 全新重写，全面优化，性能大幅度提高。
- 词典可以增删排序。
- 新增多个词典。
- 右键支持更多词典搜索。
- 保留了置顶与拖动功能。
- 更好用的配置界面。
- 更多变化使用中发现吧。

## [4.1.1] - 2015-12-27
### Changed
- 在必应词典和 Urban Dictionary 基础上增加 Vocabulary.com 海词统计和 Howjsay ，释义发音更详细。
- 右键查词，选词后右键可直达牛津词典、韦氏词典、词源、谷歌翻译等等。
- 新增三种划词模式，适合各种强迫症。
- 连续按三次ctrl还可以直接查词，随时查词，无需再另开词典占内存啦。
- 词典界面可以拖动，还可以固定在网页上，看论文利器啊。
- 延迟响应时间，不容易误按，手残党福利。
- 保留了显示当前页面二维码功能（设置界面，鼠标悬停在 “Saladict”标题上）。
- 更多功能慢慢发现吧;D

## 3.0.1
### Changed
- 增加了划译开关
- 增加了 urban 词典的例子
- 增加了必应搜索图标
- 搜索图标右击可以变成翻译搜索
- 修复了几处错误并加速了结果显示

[Unreleased]: https://github.com/crimx/crx-saladict/compare/v5.27.3...HEAD
[5.27.3]: https://github.com/crimx/crx-saladict/compare/v5.19.1...v5.27.3
[5.19.1]: https://github.com/crimx/crx-saladict/compare/v5.18.5...v5.19.1
[5.18.5]: https://github.com/crimx/crx-saladict/compare/v5.16.1...v5.18.5
[5.16.1]: https://github.com/crimx/crx-saladict/compare/v5.15.21...v5.16.1
[5.15.21]: https://github.com/crimx/crx-saladict/compare/v5.15.19...v5.15.21
[5.15.19]: https://github.com/crimx/crx-saladict/compare/v5.15.14...v5.15.19
[5.15.14]: https://github.com/crimx/crx-saladict/compare/v5.15.12...v5.15.14
[5.15.12]: https://github.com/crimx/crx-saladict/compare/v5.15.9...v5.15.12
[5.15.9]: https://github.com/crimx/crx-saladict/compare/v5.15.4...v5.15.9
[5.15.4]: https://github.com/crimx/crx-saladict/compare/v5.15.2...v5.15.4
[5.15.2]: https://github.com/crimx/crx-saladict/compare/v5.12.8...v5.15.2
[5.12.8]: https://github.com/crimx/crx-saladict/compare/v5.11.23...v5.12.8
[5.11.23]: https://github.com/crimx/crx-saladict/compare/v5.7.20...v5.11.23
[5.7.20]: https://github.com/crimx/crx-saladict/compare/v5.5.14...v5.7.20
[5.5.14]: https://github.com/crimx/crx-saladict/compare/v5.5.12...v5.5.14
[5.5.12]: https://github.com/crimx/crx-saladict/compare/v5.3.9...v5.5.12
[5.3.9]: https://github.com/crimx/crx-saladict/compare/v5.1.6...v5.3.9
[5.1.6]: https://github.com/crimx/crx-saladict/compare/v5.0.0...v5.1.6
[5.0.0]: https://github.com/crimx/crx-saladict/compare/v4.1.1...v5.0.0
[4.1.1]: https://github.com/crimx/crx-saladict/tree/v4.1.1
