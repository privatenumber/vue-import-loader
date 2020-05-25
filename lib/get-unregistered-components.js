const acorn = require('acorn');
const walk = require('acorn-walk');
const { compile, parseComponent } = require('vue-template-compiler');
const { pascalize, pluck } = require('./utils');

function detectTplTags(tplContent) {
	const tags = new Set();

	compile(tplContent, {
		modules: [{
			postTransformNode({ tag, component }) {
				if (tag === 'component') {
					walk.simple(acorn.parse(component), {
						Literal({ value }) {
							if (typeof value === 'string') {
								tags.add(pascalize(value));
							}
						},
					});
				} else {
					tags.add(pascalize(tag));
				}
			},
		}],
	});
	return Array.from(tags);
}

function findComponentHash(compNode) {
	if (compNode.type === 'ObjectExpression' && compNode.properties) {
		const componentHash = compNode.properties.find((p) => p.key.name === 'components');
		if (componentHash) {
			return componentHash.value;
		}
	}
}

function getLocallyRegisteredComponents(scriptContent) {
	const components = new Set();
	walk.simple(acorn.parse(scriptContent, { sourceType: 'module' }), {
		ExportDefaultDeclaration({ declaration }) {
			const componentHash = findComponentHash(declaration);

			if (!componentHash) { return; }

			componentHash.properties.forEach((property) => {
				if (property.type === 'Property') {
					if (
						property.computed
						&& property.key.type === 'Literal'
						&& typeof property.key.value === 'string'
					) {
						components.add(pascalize(property.key.value));
					}

					if (
						!property.computed
						&& property.key.type === 'Identifier'
					) {
						components.add(pascalize(property.key.name));
					}
				}
			});
		},
	});
	return components;
}

function getUnregisteredComponents(src) {
	const component = parseComponent(src);

	if (!component.template) { return []; }

	const unregisteredComponents = detectTplTags(component.template.content);

	if (component.script) {
		// eslint-disable-next-line no-restricted-syntax
		for (const comp of getLocallyRegisteredComponents(component.script.content)) {
			pluck(unregisteredComponents, comp);
		}
	}

	return unregisteredComponents;
}

module.exports = getUnregisteredComponents;
