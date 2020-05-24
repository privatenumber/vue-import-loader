const { compile } = require('vue-template-compiler');
const assert = require('assert');
const acorn = require('acorn');
const walk = require('acorn-walk');

// https://github.com/vuejs/vue/blob/dev/src/shared/util.js
const hyphenateRE = /\B([A-Z])/g
const hyphenate = (pascal) => pascal.replace(hyphenateRE, '-$1').toLowerCase();

const capitalize = (str) => str[0].toUpperCase() + str.slice(1);

const camelizeRE = /-(\w)/g
const pascalize = (kebab) => capitalize(kebab.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : ''));

const { hasOwnProperty } = Object.prototype;
const hasOwn = (obj, prop) => hasOwnProperty.call(obj, prop);

function addTag(resourcePath, imports, tag, components) {
	const pascal = pascalize(tag);

	if (imports[pascal]) { return; }

	const kebab = hyphenate(tag);

	let resolved;

	if (typeof components === 'function') {
		resolved = components({ tag, pascal, kebab }, resourcePath);
	} else {
		if (hasOwn(components, kebab)) {
			resolved = components[kebab];
		} else if (hasOwn(components, pascal)) {
			resolved = components[pascal];
		}
	}

	if (resolved) {
		imports[pascal] = resolved;
	}
}

function detectUsedComponents(resourcePath, tplContent, components) {
	const imports = {};
	compile(tplContent, {
		modules: [{
			postTransformNode({ tag, component }) {
				if (tag === 'component') {
					walk.simple(acorn.parse(component), {
						Literal({ value }) {
							if (typeof value === 'string') {
								addTag(resourcePath, imports, value, components);
							}
						},
					});
				} else {
					addTag(resourcePath, imports, tag, components);
				}
			},
		}],
	});
	return Object.entries(imports);
}


const optionRegistry = [];
optionRegistry.register = function(el) {
	const idx = this.indexOf(el);
	return idx > -1 ? idx : (this.push(el) - 1);
};

module.exports = {
	hyphenate,
	hasOwn,
	detectUsedComponents,
	optionRegistry,
};
