const loaderUtils = require('loader-utils');
const outdent = require('outdent');
const getUnregisteredComponents = require('./get-unregistered-components');
const resolveComponents = require('./resolve-components');
const generateComponentImports = require('./generate-component-imports');

const exportDefault = 'export default';
function injectPayload(src, payload) {
	const foundExport = src.indexOf(exportDefault);
	return (foundExport > -1) ? `${src.slice(0, foundExport) + payload}\n\n${src.slice(foundExport)}` : src;
}

const defaultOpts = {
	components: undefined,
	functional: false,
};

function vueImportLoader(src) {
	const params = loaderUtils.parseQuery(this.resourceQuery || '?');
	const options = { ...defaultOpts, ...loaderUtils.getOptions(this) };

	if (
		params.vue
		|| !(options.components && ['object', 'function'].includes(typeof options.components))
	) {
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
		return injectPayload(src, outdent`

		/* vue-import-loader */
		${importStatements}
		var __components = {${componentsHash}};

		if (${options.functional} && component.exports.functional) {
			var __origRender = component.exports.render;
			component.exports.render = function(_, ctx) {
				ctx.parent.$options.components = Object.assign({}, __components, ctx.parent.$options.components);
				return __origRender.apply(this, arguments);
			};
		} else {
			component.exports.components = Object.assign({}, __components, component.exports.components);
		}
		`);
	}

	return src;
}

module.exports = vueImportLoader;
