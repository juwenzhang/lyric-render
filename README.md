* 核心包：

  * `@lyric-render/core`：内部包含了一些歌词解析的工具，例如：parser，cache 等通用的工具，以及一些类型的定义和常用 utils 吧

  * `@lyric-render/react`：基于 core 包实现 react 的 hooks 和 components 吧

  * `@lyric-render/vue`：基于 core 包实现 vue 的 components ，但是 vue 这里只是简单的实现

* 技术栈使用

    * 打包工具：rollup，typescript，vite(核心解决的是 vue 的打包的问题)

    * UI渲染层框架使用：react 和 vue

    * 语言：typescript

* 后期功能升级计划

    * [x] 去除 React 使用的CSS方案，选择一个更加适配的方案来替代 styled-components，打包后存在资源过大的问题

    * [x] 组件适配 SSR 和 SSG 常见下渲染

    * [x] 新增其他可扩展的功能，以及一些缓存优化，目前未实现开启 indexedDB 缓存功能