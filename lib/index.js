const loaderUtils = require('loader-utils');
const getUnregisteredComponents = require('./get-unregistered-components');
const resolveComponents = require('./resolve-components');
const { hasOwn } = require('./utils');

// Source: https://github.com/nuxt/components/blob/master/src/loader.ts#L18
const hotReloadComment = '/* hot reload */';
function injectPayload(src, payload) {
	const hotReloadIdx = src.indexOf(hotReloadComment);
	if (hotReloadIdx > -1) {
		src = src.slice(0, hotReloadIdx) + payload + '\n\n' + src.slice(hotReloadIdx);
	}
	return src;	
}

function vueImportLoader (src) {

	/* TODO: this.addDependency for watch? */
	const params = loaderUtils.parseQuery(this.resourceQuery || '?');

	if (!params.vue) {
		const options = loaderUtils.getOptions(this);

		if (hasOwn(options, 'components')) {
			const unregistered = getUnregisteredComponents(this.fs.readFileSync(this.resourcePath).toString());

			const componentsHash = [];
			const importStatements = [];
			resolveComponents(this.resourcePath, unregistered, options.components)
				.forEach(([name, specifier], idx) => {
					const compName = `c${idx}`;
					importStatements.push(`import ${compName} from '${specifier}';`);
					componentsHash.push(`${name}: ${compName}`);
				});

			if (componentsHash.length) {
				src = injectPayload(src, `
				/* vue-global-component-loader */
				${importStatements.join('')}
				const __components = {${componentsHash.join(',')}};

				if (${options.functional} && component.exports.functional) {
					const { render } = component.exports;
					component.exports.render = function(_, ctx) {
						ctx.parent.$options.components = Object.assign({}, __components, ctx.parent.$options.components);
						return render.apply(this, arguments);
					};
				} else {
					component.exports.components = Object.assign({}, __components, component.exports.components);
				}
				`);
			}
		}
	}

	return src;
};

module.exports = vueImportLoader;
