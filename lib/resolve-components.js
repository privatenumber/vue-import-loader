const { hasOwn, hyphenate } = require('./utils');

function resolveComponents(resourcePath, unresolved, components) {
	const importMap = {};

	unresolved.forEach((tag) => {
		if (importMap[tag]) { return; }

		const kebab = hyphenate(tag);

		let resolved;

		if (typeof components === 'function') {
			resolved = components({ pascal: tag, kebab }, resourcePath);
		} else if (hasOwn(components, kebab)) {
			resolved = components[kebab];
		} else if (hasOwn(components, tag)) {
			resolved = components[tag];
		}

		if (resolved) {
			importMap[tag] = resolved;
		}
	});

	return Object.entries(importMap);
}


module.exports = resolveComponents;
