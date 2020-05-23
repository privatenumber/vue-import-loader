const { compile } = require('vue-template-compiler');
const assert = require('assert');
const acorn = require('acorn');
const walk = require('acorn-walk');

// https://github.com/vuejs/vue/blob/dev/src/shared/util.js
const hyphenateRE = /\B([A-Z])/g
const hyphenate = (str) => str.replace(hyphenateRE, '-$1').toLowerCase();

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const camelizeRE = /-(\w)/g
const pascalize = (str) => capitalize(str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : ''));

const { hasOwnProperty } = Object.prototype;
const hasOwn = (obj, prop) => hasOwnProperty.call(obj, prop);

function normalizeComponents(components) {
	Object.keys(components).forEach((c) => {
		const kebab = hyphenate(c);
		const pascal = pascalize(c);

		if (c === kebab) {
			components[pascal] = components[c];
		} else if (c === pascal) {
			components[kebab] = components[c];
		} else {
			throw new Error(`Component key "${c}" must be PascalCase or kebab-case`);
		}
	});
}


function addTag(resourcePath, imports, tag, components) {
	if (imports[tag]) { return; }
	const resolved = (typeof components === 'function') ? components(tag, resourcePath) : (hasOwn(components, tag) && components[tag]);

	if (resolved) {
		imports[tag] = resolved;
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
							addTag(resourcePath, imports, value, components);
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
	if (idx === -1) {
		if (typeof el.components === 'object') {
			normalizeComponents(el.components);
		}
		return this.push(el) - 1;
	} else {
		return idx;
	}
};


module.exports = {
	hyphenate,
	hasOwn,
	normalizeComponents,
	detectUsedComponents,
	optionRegistry,
};
