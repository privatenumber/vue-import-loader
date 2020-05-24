<h1>
	🌐 Vue Import Loader
	<a href="https://npm.im/vue-import-loader"><img src="https://badgen.net/npm/v/vue-import-loader"></a>
	<a href="https://npm.im/vue-import-loader"><img src="https://badgen.net/npm/dm/vue-import-loader"></a>
	<a href="https://packagephobia.now.sh/result?p=vue-import-loader"><img src="https://packagephobia.now.sh/badge?p=vue-import-loader"></a>
	<a href="https://bundlephobia.com/result?p=vue-import-loader"><img src="https://badgen.net/bundlephobia/minzip/vue-import-loader"></a>
</h1>

Webpack loader to automatically detect & import used components!

Credits to the [@nuxt/components](https://github.com/nuxt/components) team for the idea ❤️

## 🙋‍♀️ Why?
- ⚡️ **Speed-up development** Automate registration concerns and focus on the logic!
- 🌳 **Tree-shaking** Only imports unregistered components detected in template!
- ❤️ **Chunking friendly** Locally registers components for optimal code-splitting!
- 💠 **Dynamic Components** Supports `<component is="dynamic-comp">`! *
- 🔥 **Functional-components** Supports components in [functional-components](https://github.com/vuejs/vue-loader/issues/1013)!

_* The `is` attribute must contain the possible values inline_

## :rocket: Install
```sh
npm i vue-import-loader
```

## 🚦 Quick Setup
In your Webpack config, insert `vue-import-loader` before `vue-loader`

**From**
```js
{
	test: /\.vue$/,
	loader: 'vue-loader'
}
```

**To**
```js
{
	test: /\.vue$/,
	use: [
		{
			loader: 'vue-import-loader',
			options: {

				// Similar to Vue's "components" hash
				components: {
					ComponentTag: 'component/path/component-tag.vue',
					...
				}

				// ... or pass in a resolver
				components({ kebab }, fromComponent) {
					const componentPath = `../components/${kebab}.vue`;
					if (fs.existsSync(componentPath)) {
						return componentPath;
					}
				}
			}
		},
		'vue-loader'
	]
}
```


## ⚙️ Options
- `components`
- `functional` (_Experimental_) `Boolean` (Default: `false`)
  Whether to resolve components in functional components. Functional components are [known to not support the `components` hash](https://github.com/vuejs/vue-loader/issues/1013) but can be hacked around by registering the components to the parent instead. Since it mutates the parent's `component` hash, it is disabled by default.

## 💁‍♂️ FAQ
### How's this different from Vue's global registration?
- **Vue's [Global registration](https://vuejs.org/v2/guide/components-registration.html#Global-Registration)**
  - Bundles-in registered components regardless of whether they're actually used
  - Registers components to the Vue runtime, making them available to all-components
    - Could lead to component name collision in large code-bases

- **Vue Import loader**
  - Only bundles-in components that it detects in the app's Vue component templates
  - Components are registered locally per-component for optimal code-splitting
  - Nuanced control over which files get what components via resolution function

## How's this different from Nuxt.js Components?
- [Nuxt.js Components](https://github.com/nuxt/components)
  - Designed specifically for Nuxt.js
  - Automatically resolves components in "components" directory

- **Vue Import loader** (Inspired by Nuxt.js Components)
  - Supports any Webpack build
  - Resolves components using a passed-in component-map or a resolution function
  - Has built-in static analysis to detect registered components
  - Supports `<component :is=`
  - Supports functional components

### So, what's the cost?
- **App concerns in build config**
- **Maintainability**



