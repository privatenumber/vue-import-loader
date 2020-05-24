const { hasOwn, hyphenate } = require('./utils');

function resolveComponents(resourcePath, unresolved, components) {
	const importMap = {};

	unresolved.forEach((tag) => {
		if (importMap[tag]) { return; }

		const kebab = hyphenate(tag);

		let resolved;

		if (typeof components === 'function') {
			resolved = components({ pascal: tag, kebab }, resourcePath);
		} else {
			const key = hasOwn(components, kebab) ? kebab : (hasOwn(components, tag) ? tag : undefined);
			if (key) {
				resolved = components[key];
			}
		}

		if (resolved) {
			importMap[tag] = resolved;
		}
	});

	return Object.entries(importMap);
}


module.exports = resolveComponents;
