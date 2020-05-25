const loaderUtils = require('loader-utils');
const getUnregisteredComponents = require('./get-unregistered-components');
const resolveComponents = require('./resolve-components');
const generateComponentImports = require('./generate-component-imports');
const { hasOwn } = require('./utils');

const hotReloadComment = '/* hot reload */';
function injectPayload(src, payload) {
	const hotReloadIdx = src.indexOf(hotReloadComment);
	return (hotReloadIdx > -1) ? `${src.slice(0, hotReloadIdx) + payload}\n\n${src.slice(hotReloadIdx)}` : src;
}

function vueImportLoader(src) {
	const params = loaderUtils.parseQuery(this.resourceQuery || '?');
	const options = loaderUtils.getOptions(this);

	if (params.vue || !hasOwn(options, 'components')) {
		return src;
	}

	const unregistered = getUnregisteredComponents(
		this.fs.readFileSync(this.resourcePath).toString(),
	);

	const { componentsHash, importStatements } = generateComponentImports(resolveComponents(
		this.resourcePath,
		unregistered,
		options.components,
	));

	if (componentsHash.length) {
		return injectPayload(src, `
		/* vue-global-component-loader */
		${importStatements}
		const __components = {${componentsHash}};

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

	return src;
}

module.exports = vueImportLoader;
