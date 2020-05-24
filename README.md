<h1>
	🌐 Vue Import Loader
	<a href="https://npm.im/vue-import-loader"><img src="https://badgen.net/npm/v/vue-import-loader"></a>
	<a href="https://npm.im/vue-import-loader"><img src="https://badgen.net/npm/dm/vue-import-loader"></a>
	<a href="https://packagephobia.now.sh/result?p=vue-import-loader"><img src="https://packagephobia.now.sh/badge?p=vue-import-loader"></a>
	<a href="https://bundlephobia.com/result?p=vue-import-loader"><img src="https://badgen.net/bundlephobia/minzip/vue-import-loader"></a>
</h1>

Webpack loader to automatically detect & import used components. "Globally register" components without the bundling costs!

Credits to the [@nuxt/components](https://github.com/nuxt/components) for the idea ❤️

## 🙋‍♀️ Why?
- ⚡️ **Speed-up development** Automate registration concerns and focus on the logic!
- 🌳 **Tree-shaking** Only imports unregistered components detected in template!
- ❤️ **Chunking friendly** Locally registers components for optimal code-splitting!
- 💠 **Dynamic components** Supports `<component is="dynamic-comp">`! *
- 🔥 **Functional components** Supports components in [functional components](https://github.com/vuejs/vue-loader/issues/1013)!

_* The `is` attribute must contain the possible values inline_

## :rocket: Install
```sh
npm i vue-import-loader
```

## 🚦 Quick Setup
In your Webpack config, insert `vue-import-loader` before `vue-loader`:

**Before**
```js
{
	test: /\.vue$/,
	loader: 'vue-loader'
}
```

**After ✨**
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

				// ... or pass in a resolver function
				components({ kebab }, fromComponent) {
					const componentPath = `../components/${kebab}.vue`;
					if (fs.existsSync(componentPath)) {
						return `@/components/${kebab}`;
					}
				}
			}
		},
		'vue-loader'
	]
}
```

## ⚙️ Options
- `components` `Object|Function`
  - `Object`
    - Similar to Vue's `components` hash, where the key is the component tag in kebab-case or PascalCase, and the value is the component path (support aliases).

  - `Function` `({ kebab, pascal }, fromComponent)`
    - Use a function to dynamically resolve component tags to component paths. For example, this function resolves components to the "components" directory:
    ```js
    components({ kebab }, fromComponent) {
    	const componentPath = `../components/${kebab}.vue`;
    	if (fs.existsSync(componentPath)) {
    		return `@/components/${kebab}`;
    	}
    }
    ```

- `functional` (_Experimental_) `Boolean` (Default: `false`)
  - Whether to resolve components in functional components. Functional components are [known to not support the `components` hash](https://github.com/vuejs/vue-loader/issues/1013) but can be hacked around by registering the components to the parent instead. Since this feature mutates the parent's `component` hash, it is disabled by default.

## 💁‍♂️ FAQ
### How's this different from Vue's [global registration](https://vuejs.org/v2/guide/components-registration.html#Global-Registration)?
- **Global registration**
  - Bundles-in registered components regardless of whether they're actually used
  - Registers components to the Vue runtime, making them available to all-components
    - Could lead to component name collision in large code-bases

- **Vue Import loader**
  - Only bundles-in components that it detects in the app's Vue component templates
  - Components are registered locally per-component for optimal code-splitting
  - Nuanced control over which files get what components via resolution function

### How's this different from [Nuxt.js Components](https://github.com/nuxt/components)?
- **Nuxt.js Components**
  - Designed specifically for [Nuxt.js](https://nuxtjs.org)
  - Automatically resolves components in the "components" directory

- **Vue Import loader**
  - Supports any Webpack build
  - Resolves components using a user-configured component-map or a resolution function
  - Has built-in static analysis to detect registered components
  - Supports dynamic components if possible values are inline `<component :is="condition ? 'comp-a' : 'comp-b'">`
  - Supports [functional components](https://github.com/vuejs/vue-loader/issues/1013

### Why wouldn't I want to use this?
The costs of implicitly registering components locally is close to [registering components globally](https://vuejs.org/v2/guide/components-registration.html#Global-Registration).

- The benefit this has over global registration is that it doesn't import components blindly at the top-level of your App, but instead, imports them intelligently at each detected usage. Unused components will not be bundled-in.

- **Maintainability** Your components might become harder to maintain because of the lack of explicitly declared dependencies.
  - **Automation magic** It's better to have code you understand and can control than to leave it to _magic_.
  - **Debugging** If there's a bug in your resolver, it might not be an obvious place to look or troubleshoot.

- **Build-tool coupling** Module-level concerns are introduced into the build configuration; perhaps comparable to creating aliases. Doing this couples the app to the build via config and makes it harder to migrate to a different environment (new tools, upgrades, etc).

