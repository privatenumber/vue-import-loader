const loaderUtils = require('loader-utils');
const {
	hyphenate,
	hasOwn,
	detectUsedComponents,
	optionRegistry,
} = require('./utils');

const thisLoader = require.resolve('.');
const vueLoader = require.resolve('vue-loader');

const tplImprtPtrn = /staticRenderFns } from "([^\"]+)"/;
const hotReloadComment = '/* hot reload */';

function globalComponentLoader (src) {

	/* TODO: this.addDependency for watch? */
	/* TODO: DIRECTLY USE this.query? */
	const params = loaderUtils.parseQuery(this.resourceQuery || '?');

	if (params.vue) {
		if (params.type === 'template' && params.components) {
			const { components } = optionRegistry[params.components];
			return detectUsedComponents(this.resourcePath, src, components)
				.map(([name, specifier], idx) => `export {default as ${name}} from '${specifier}';`)
				.join('');
		}
	} else {
		const options = loaderUtils.getOptions(this);

		if (hasOwn(options, 'components')) {
			const oId = optionRegistry.register(options);

			const foundTplImprt = src.match(tplImprtPtrn);
			if (foundTplImprt) {
				const injection = `
				/* vue-global-component-loader */
				import * as __components from '!${thisLoader}!${vueLoader}!${foundTplImprt[1]}&components=${oId}';

				/* TODO: SUPPORT FUNCTIONAL COMP */
				/* TODO: Don't import if there's a registered component that matches */

				component.exports.components = Object.assign({}, __components, component.exports.components);
				`;

				const hotReloadIdx = src.indexOf(hotReloadComment);
				if (hotReloadIdx > -1) {
					src = src.slice(0, hotReloadIdx) + injection + '\n\n' + src.slice(hotReloadIdx);
				}
			}
		}
	}

	return src;
};

module.exports = globalComponentLoader;
