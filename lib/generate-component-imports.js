function asyncImport(asyncObj, compName) {
	if (
		typeof asyncObj !== 'object'
		|| typeof asyncObj.component !== 'string'
	) {
		return null;
	}

	const magicComments = Array.isArray(asyncObj.magicComments)
		? asyncObj.magicComments.map((c) => `/* ${c} */`).join(' ') : '';

	const importStatements = [];
	const asyncHash = [`component: import(${magicComments}${JSON.stringify(asyncObj.component)})`];

	if (asyncObj.loading) {
		const name = `${compName}Loading`;
		importStatements.push(`import ${name} from '${asyncObj.loading}';`);
		asyncHash.push(`loading:${name}`);
	}

	if (asyncObj.error) {
		const name = `${compName}Error`;
		importStatements.push(`import ${name} from '${asyncObj.error}';`);
		asyncHash.push(`error:${name}`);
	}

	if (typeof asyncObj.delay === 'number') {
		asyncHash.push(`delay:${asyncObj.delay}`);
	}

	if (typeof asyncObj.timeout === 'number') {
		asyncHash.push(`timeout:${asyncObj.timeout}`);
	}

	return {
		importStatements,
		component: `() => ({${asyncHash.join(',')}})`,
	};
}

function generateComponentImports(resolvedComponents) {
	const componentsHash = [];
	const importStatements = [];

	resolvedComponents.forEach(([name, specifier], idx) => {
		const compName = `c${idx}`;
		const isAsync = asyncImport(specifier, compName);

		if (isAsync) {
			importStatements.push(...isAsync.importStatements);
			componentsHash.push(`${name}: ${isAsync.component}`);
		} else if (typeof specifier === 'string') {
			importStatements.push(`import ${compName} from '${specifier}';`);
			componentsHash.push(`${name}:${compName}`);
		}
	});

	return {
		componentsHash: componentsHash.join(','),
		importStatements: importStatements.join(''),
	};
}

module.exports = generateComponentImports;
