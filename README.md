# 🌐 Vue Import Loader <a href="https://npm.im/vue-import-loader"><img src="https://badgen.net/npm/v/vue-import-loader"></a> <a href="https://npm.im/vue-import-loader"><img src="https://badgen.net/npm/dm/vue-import-loader"></a> <a href="https://packagephobia.now.sh/result?p=vue-import-loader"><img src="https://packagephobia.now.sh/badge?p=vue-import-loader"></a>

Webpack loader to automate local component registration by statically analyzing components in the template.

Credits to the [@nuxt/components](https://github.com/nuxt/components) for the idea ❤️

## ⭐️ Features
- 🌳 **Tree-shaking** Only imports unregistered components detected in the template
- ❤️ **Chunking friendly** Locally registers components for optimal code-splitting
- ⚡️ **Async components** Supports the full [async component API](https://vuejs.org/v2/guide/components-dynamic-async.html#Async-Components)
- 💠 **Dynamic components** Supports `<component is="dynamic-comp">` *
- 🔥 **Functional components** Supports components in [functional components](https://github.com/vuejs/vue-loader/issues/1013)

_* The `is` attribute must contain the possible values inline_

## :rocket: Install
```sh
npm i vue-import-loader
```

## 🚦 Quick Setup
In your Webpack config, insert `vue-import-loader` before `vue-loader`:

**Before**
```diff
{
     test: /\.vue$/,
-    loader: 'vue-loader'
}
```

**After <sup>✨</sup>**
```diff
{
     test: /\.vue$/,
+    use: [
+        {
+            loader: 'vue-import-loader',
+            options: {
+
+                // Similar to Vue's "components" hash
+                components: {
+                    ComponentTag: 'component/path/component-tag.vue',
+                    ...
+                }
+            }
+        },
+        'vue-loader'
+    ]
}
```

## 👨‍🏫 Examples

<details>
	<summary><strong>Dynamically resolve components to a directory</strong></summary>
	<br>

Use a resolver function to dynamically resolve components

```js
{
    test: /\.vue$/,
    use: [
        {
            loader: 'vue-import-loader',
            options: {
                components({ kebab }, fromComponent) {
                    if (exists(kebab)) {
                        return `@/components/${kebab}`;
                    }
                }
            }
        },
        'vue-loader'
    ]
}
```
</details>

<details>
	<summary><strong>Asynchronously load components with `components` hash</strong></summary>
	<br>

Map the component to an object to make it asynchronous. Refer to the **Options** section for the object schema.

```js
{
    test: /\.vue$/,
    use: [
        {
            loader: 'vue-import-loader',
            options: {
                components: {
                    SyncComp: '/components/sync-comp.vue',

                    // Mapping to an object makes it asynchronous
                    AsyncComp: {
                        component: '/components/async-comp.vue',

                        // Optional configs
                        loading: '/components/loading.vue',
                        error: '/components/error.vue',
                        magicComments: ['webpackChunkName: "async-comps"']
                    }
                }
            }
        },
        'vue-loader'
    ]
}
```
</details>

<details>
	<summary><strong>Asynchronously load components prefixed with `async-`</strong></summary>
	<br>

Return an object to make it asynchronous. Refer to the **Options** section for the object schema.

This demo shows how prefixing your components with `async-` in the template can make them asynchronously loaded.

```js
{
    test: /\.vue$/,
    use: [
        {
            loader: 'vue-import-loader',
            options: {
                components({ kebab }) {
                    if (kebab.startsWith('async-')) {
                        return {
                            component: `/components/${kebab.replace(/^async-/)}.vue`,

                            // Optional configs
                            loading: '/components/loading.vue',
                            error: '/components/error.vue',
                            magicComments: ['webpackChunkName: "async-comps"']
                        };
                    }

                    return `/components/${kebab}.vue`;
                }
            }
        },
        'vue-loader'
    ]
}
```
</details>


## ⚙️ Options
- `components` `Object|Function`
  - `Object` Similar to Vue's `components` hash. Key is the component tag in kebab-case or PascalCase. 
      - Value can be:
        - `String`: Component path for synchronous loading (supports aliases)
        - `Object`: Component data for [asynchronous loading](https://vuejs.org/v2/guide/components-dynamic-async.html#Async-Components) meeting the following schema:


  ```js
  {
      // Component path (Required)
      component: '...',

      // Loading component path
      loading: '...',

      // Error component path
      error: '...',

      // Delay in ms before Loading component is displayed
      delay: 200,

      // Timeout in ms before Error component is displayed
      timeout: Infinity,

      // Magic comments to configure the dynamic import:
      // https://webpack.js.org/api/module-methods/#magic-comments
      magicComponents: [
          'webpackChunkName: "my-chunk-name"'
      ]
  }
  ```

  - `Function` `({ kebab, pascal }, fromComponent)`
    - Use a function to dynamically resolve component tags to component paths. Supports outputting a string for synchronous, and an object for asynchronous imports as defined above. For example, this function resolves components to the "components" directory:
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
  - Supports async components but not the full API (eg. `loading`, `error`, `delay`, `timeout`)

- **Vue Import loader**
  - Supports any Webpack build
  - Resolves components using a user-configured component-map or a resolution function
  - Has built-in static analysis to detect registered components
  - Supports the full [async component API](https://vuejs.org/v2/guide/components-dynamic-async.html#Async-Components)
  - Supports dynamic components if possible values are inline
    - eg. `<component :is="condition ? 'comp-a' : 'comp-b'">`
  - Supports [functional components](https://github.com/vuejs/vue-loader/issues/1013)

### Why wouldn't I want to use this?
The costs of implicitly registering components locally is close to [registering components globally](https://vuejs.org/v2/guide/components-registration.html#Global-Registration).

- The benefit this has over global registration is that it doesn't import components blindly at the top-level of your App, but instead, imports them intelligently at each detected usage. Unused components will not be bundled-in.

- **Maintainability** Your components might become harder to maintain because of the lack of explicitly declared dependencies.
  - **Automation magic** It's better to have code you understand and can control than to leave it to _magic_.
  - **Debugging** If there's a bug in your resolver, it might not be an obvious place to look or troubleshoot.

- **Build-tool coupling** Module-level concerns are introduced into the build configuration; perhaps comparable to creating aliases. Doing this couples the app to the build via config and makes it harder to migrate to a different environment (new tools, upgrades, etc).

