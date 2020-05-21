const { compile } = require('vue-template-compiler');
const assert = require('assert');

// https://github.com/vuejs/vue/blob/dev/src/shared/util.js#L161-L167
const hyphenateRE = /\B([A-Z])/g
const hyphenate = (str) => str.replace(hyphenateRE, '-$1').toLowerCase();

const normalized = Symbol('normalized');
function normalizeComponents(components) {
	Object.keys(components).forEach((c) => {
		const kebab = hyphenate(c);
		if (kebab !== c) {
			assert(!components[kebab], 'Component name collision');
			components[kebab] = components[c];			
		}
	});
}

function detectUsedComponents(tplContent, components) {
	const imports = {};
	compile(tplContent, {
		modules: [{
			postTransformNode: ({ tag }) => {
				if (components[tag]) {
					imports[tag] = components[tag];
				}
			},
		}],
	});
	return Object.entries(imports);
}

module.exports = {
	hyphenate,
	normalizeComponents,
	detectUsedComponents,
};
