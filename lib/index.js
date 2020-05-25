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


function asyncImport(asyncObj, compName) {
	if (typeof asyncObj === 'object') {
		const magicComments = Array.isArray(asyncObj.magicComments)
			? asyncObj.magicComments.map(c => `/* ${c} */`).join(' ') : '';

		const importStatements = [];
		const asyncImport = [
			`component: import(${magicComments}${JSON.stringify(asyncObj.component)})`,
		];


		if (asyncObj.loading) {
			const name = `${compName}Loading`;
			importStatements.push(`import ${name} from '${asyncObj.loading}';`);
			asyncImport.push(`loading:${name}`);
		}

		if (asyncObj.error) {
			const name = `${compName}Error`;
			importStatements.push(`import ${name} from '${asyncObj.error}';`);
			asyncImport.push(`error:${name}`);
		}

		if (typeof asyncObj.delay === 'number') {
			asyncImport.push(`delay:${asyncObj.delay}`);
		}

		if (typeof asyncObj.timeout === 'number') {
			asyncImport.push(`timeout:${asyncObj.timeout}`);
		}

		return {
			importStatements,
			specifier : `() => ({${asyncImport.join(',')}})`,
		};
	}
}


function vueImportLoader (src) {
	const params = loaderUtils.parseQuery(this.resourceQuery || '?');
	const options = loaderUtils.getOptions(this);

	if (params.vue || !hasOwn(options, 'components')) {
		return src;
	}

	const unregistered = getUnregisteredComponents(this.fs.readFileSync(this.resourcePath).toString());

	const componentsHash = [];
	const importStatements = [];
	resolveComponents(this.resourcePath, unregistered, options.components)
		.forEach(([name, specifier], idx) => {
			const compName = `c${idx}`;
			const isAsync = asyncImport(specifier, compName);

			if (isAsync) {
				importStatements.push(...isAsync.importStatements);
				componentsHash.push(`${name}: ${isAsync.specifier}`);

			} else if (typeof specifier === 'string') {
				importStatements.push(`import ${compName} from '${specifier}';`);
				componentsHash.push(`${name}:${compName}`);
			}
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

	return src;
};

module.exports = vueImportLoader;
