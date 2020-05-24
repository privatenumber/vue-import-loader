// Source: https://github.com/vuejs/vue/blob/dev/src/shared/util.js
const hyphenateRE = /\B([A-Z])/g
const hyphenate = (pascal) => pascal.replace(hyphenateRE, '-$1').toLowerCase();

const capitalize = (str) => str[0].toUpperCase() + str.slice(1);

const camelizeRE = /-(\w)/g
const pascalize = (kebab) => capitalize(kebab.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : ''));

const { hasOwnProperty } = Object.prototype;
const hasOwn = (obj, prop) => hasOwnProperty.call(obj, prop);

const pluck = (arr, el) => {
	const idx = arr.indexOf(el);
	if (idx > -1) {
		arr.splice(idx, 1);
	}
};

module.exports = {
	pascalize,
	hyphenate,
	hasOwn,
	pluck,
};
