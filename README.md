<h1>
	🌐 Vue Global Component Loader
	<a href="https://npm.im/vue-global-component-loader"><img src="https://badgen.net/npm/v/vue-global-component-loader"></a>
	<a href="https://npm.im/vue-global-component-loader"><img src="https://badgen.net/npm/dm/vue-global-component-loader"></a>
	<a href="https://packagephobia.now.sh/result?p=vue-global-component-loader"><img src="https://packagephobia.now.sh/badge?p=vue-global-component-loader"></a>
	<a href="https://bundlephobia.com/result?p=vue-global-component-loader"><img src="https://badgen.net/bundlephobia/minzip/vue-global-component-loader"></a>
</h1>

Webpack loader to automatically register Vue components at build-time ([@nuxt/components](https://github.com/nuxt/components) for any Webpack build).

Credits to the Nuxt.js team for the idea ❤️

## :raising_hand: Why?
- ⚡️ **Speed-up dev** Remove registration concerns and focus on the logic!
- 🌳 **Tree-shaking** Only imports components detected in template!
- ❤️ **Chunking friendly** Locally registers components for optimal code-splitting!
- 💠 **Dynamic Components** Supports `<component is="dynamic-comp">`! *

_* The `is` attribute must contain the possible values inline_

### How's this different from Vue's global registration?
- **Vue's [Global registration](https://vuejs.org/v2/guide/components-registration.html#Global-Registration)** bundles-in registered components regardless of whether they're actually used. It registers components to the Vue runtime, making them available to all-components, and could lead to collision in a large code-bases.

- **Global-component loader** only bundles-in components that it detects in the app's Vue component templates. The components are registered locally per-component for optimal code-splitting. You can use a function for nuanced control over which files get what components.

### So, what's the trade-off?
- **App concerns in build config**
- **Maintainability**


## :rocket: Install
```sh
npm i vue-global-component-loader
```

