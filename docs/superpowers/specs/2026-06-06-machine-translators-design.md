# 新增阿里、火山、小牛机器翻译设计

日期：2026-06-06

## 背景

Saladict 现有机器翻译源按 `src/components/dictionaries/<id>/` 组织，每个翻译源包含配置、认证字段、翻译逻辑、展示组件、本地化和样式。百度、腾讯、彩云、有道翻译已经提供可复用模式：

- `config.ts` 定义词典配置和机器翻译语言选项。
- `auth.ts` 定义用户可在“词典帐号”页面填写的凭证字段。
- `engine.ts` 发起翻译请求并返回 `MachineTranslateResult`。
- `View.tsx` 和 `_style.shadow.scss` 复用 `MachineTrans` 展示。
- `src/app-config/dicts.ts` 和 `src/app-config/auth.ts` 统一注册词典与认证字段。

本次新增三个可配置个人 API 的机器翻译源：阿里翻译、火山翻译、小牛翻译。

## 范围

新增翻译源会出现在：

- “词典设置”：可添加、排序、启用、调整展开和语言等通用词典设置。
- “词典帐号”：可输入用户自行申请的 API 凭证。

新增翻译源不会出现在：

- “上下文翻译引擎”。
- 默认上下文翻译配置 `ctxTrans`。

## 翻译源

### 阿里翻译

- 词典 ID：`alibaba`
- 显示名称：阿里翻译 / Alibaba Translate
- 凭证字段：`accessKeyId`、`accessKeySecret`
- API：阿里云机器翻译 `TranslateGeneral`
- 文档依据：阿里云机器翻译 API 概览说明该产品使用 `2018-10-12` OpenAPI 和 RPC 签名机制；通用版调用指南说明 `TranslateGeneral` 的请求字段和 5000 字符限制。

### 火山翻译

- 词典 ID：`volc`
- 显示名称：火山翻译 / Volcengine Translate
- 凭证字段：`accessKeyId`、`secretAccessKey`
- API：火山引擎机器翻译 `TranslateText`
- 文档依据：火山文本翻译 API 使用 `POST`，`Host = translate.volcengineapi.com`，`Action=TranslateText&Version=2020-06-01`，请求体包含 `SourceLanguage`、`TargetLanguage`、`TextList`。

### 小牛翻译

- 词典 ID：`niutrans`
- 显示名称：小牛翻译 / NiuTrans
- 凭证字段：`apikey`
- API：小牛文本翻译 HTTP 接口
- 文档依据：小牛开发文档说明 API Key 可在控制台 API 应用中查看，文本翻译接口使用 `apikey` 和源/目标语言参数。

## 语言范围

第一版只支持常用语言列表，保持配置简单：

- `zh-CN`
- `zh-TW`
- `en`
- `ja`
- `ko`
- `fr`
- `de`
- `es`
- `ru`

各服务如果使用不同语言代码，在对应 `engine.ts` 中做双向映射。`auto` 仅作为源语言自动检测值，不作为目标语言选项。

## 架构

采用项目内轻量 provider 实现，不新增 `@opentranslate/*` 依赖。

新增目录：

- `src/components/dictionaries/alibaba/`
- `src/components/dictionaries/volc/`
- `src/components/dictionaries/niutrans/`

每个目录包含：

- `auth.ts`
- `config.ts`
- `engine.ts`
- `View.tsx`
- `_locales.ts`
- `_style.shadow.scss`
- `favicon.png`

注册点：

- `src/app-config/dicts.ts`：导入并加入 `defaultAllDicts`。
- `src/app-config/auth.ts`：导入并加入 `defaultDictAuths` 和 `defaultDictAuthUrls`。

不修改：

- `src/app-config/index.ts` 的 `ctxTrans`。
- `src/_helpers/translateCtx.ts` 的上下文翻译类型和行为。

## 数据流

1. 用户在“词典帐号”保存凭证。
2. 用户在“词典设置”添加并启用对应翻译源。
3. 查词时 `search(rawText, config, profile, payload)` 被调用。
4. `getMTArgs` 根据文本、源语言、目标语言和换行设置生成翻译参数。
5. `engine.ts` 检查凭证是否完整。
6. 凭证缺失时返回 `requireCredential: true`，复用现有提示。
7. 凭证完整时发起 API 请求。
8. 响应被规范化成 `MachineTranslateResult`，由 `MachineTrans` 展示。

## 错误处理

- 缺少凭证：显示现有“词典帐号”配置提示。
- API 参数、签名、额度、频率或网络错误：返回空机器翻译结果，沿用现有机器翻译源的失败体验。
- 不支持语向：返回空结果，不自动改写用户选择。
- 超长文本：依赖服务端限制返回错误；第一版不做自动分段，避免改变现有查词交互。

## TTS

第一版不为三个新源实现专属 TTS。结果中的 `tts` 可以留空，避免引入额外额度、额外 API 或跨服务副作用。机器翻译正文仍可正常复制和展示。

## 测试

至少覆盖：

- 默认配置包含三个新词典。
- 默认认证配置包含三个新词典的字段。
- `mergeConfig` 能把老配置合并到带新增认证字段的新默认配置。
- 三个 provider 的请求参数和签名构造可通过单元测试验证。
- 缺少凭证时返回 `requireCredential: true`。

网络真实调用不作为单元测试要求，避免依赖用户凭证和外部服务稳定性。

## 资料链接

- 阿里云机器翻译 API 概览：https://help.aliyun.com/zh/machine-translation/developer-reference/api-alimt-2018-10-12-overview
- 阿里云 TranslateGeneral 调用指南：https://help.aliyun.com/zh/machine-translation/developer-reference/api-reference-machine-translation-universal-version-call-guide
- 火山引擎文本翻译 API：https://www.volcengine.com/docs/4640/65067
- 小牛翻译开发文档：https://niutrans.com/documents/contents/trans_detection
