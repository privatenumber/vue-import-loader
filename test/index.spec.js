const outdent = require('outdent');
const Vue = require('vue');
const { build, mount } = require('./utils');

Vue.config.productionTip = false;
Vue.config.devtools = false;

describe('Error handling', () => {
	test('No options', async () => {
		const built = await build({
			'/index.vue': outdent`
				<template>
					<h1>Hello <custom-comp /></h1>
				</template>
			`,
			'/CustomComp.vue': outdent`
			<template>
				<span>world</span>
			</template>
			`
		});

		const warnHandler = jest.fn();
		Vue.config.warnHandler = warnHandler

		const vm = mount(Vue, built);

		expect(warnHandler).toBeCalled();
		expect(vm.$el.outerHTML).toBe('<h1>Hello <custom-comp></custom-comp></h1>');
	});

	test('No options.components', async () => {
		const built = await build({
			'/index.vue': outdent`
				<template>
					<h1>Hello <custom-comp /></h1>
				</template>
			`,
			'/CustomComp.vue': outdent`
			<template>
				<span>world</span>
			</template>
			`
		}, {});

		const warnHandler = jest.fn();
		Vue.config.warnHandler = warnHandler

		const vm = mount(Vue, built);

		expect(warnHandler).toBeCalled();
		expect(vm.$el.outerHTML).toBe('<h1>Hello <custom-comp></custom-comp></h1>');
	});
});

describe('Component Registration', () => {
	test('Single component', async () => {
		const built = await build({
			'/index.vue': outdent`
				<template>
					<h1>Hello <custom-comp /></h1>
				</template>
			`,
			'/CustomComp.vue': outdent`
			<template>
				<span>world</span>
			</template>
			`
		}, {
			components: {
				CustomComp: '/CustomComp.vue',
			},
		});

		const vm = mount(Vue, built);

		expect(vm.$el.outerHTML).toBe('<h1>Hello <span>world</span></h1>');
	});

	test('Multiple components', async () => {
		const built = await build({
			'/index.vue': outdent`
				<template>
					<div>
						<h1>Hello <world /></h1>
						<goodbye-world/>
					</div>
				</template>
			`,
			'/world.vue': outdent`
			<template>
				<span>world</span>
			</template>
			`,
			'/goodbyeWorld.vue': outdent`
			<template>
				<h1>goodbye world</h1>
			</template>
			`
		}, {
			components: {
				world: '/world.vue',
				'goodbye-world': '/goodbyeWorld.vue',
				unusedComp: '/should-not-exist.vue',
			},
		});

		const vm = mount(Vue, built);
		expect(vm.$el.outerHTML).toBe('<div><h1>Hello <span>world</span></h1> <h1>goodbye world</h1></div>');
	});

	test('Multiple files', async () => {
		const built = await build({
			'/index.vue': outdent`
				<template>
					<div>
						<h1>Hello <world /></h1>
						<goodbye-world/>
					</div>
				</template>
			`,
			'/world.vue': outdent`
			<template>
				<span>world</span>
			</template>
			`,
			'/goodbyeWorld.vue': outdent`
			<template>
				<h1>goodbye <world /></h1>
			</template>
			`
		}, {
			components: {
				world: '/world.vue',
				'goodbye-world': '/goodbyeWorld.vue',
				UnusedComp: '/should-not-exist.vue',
			},
		});

		const vm = mount(Vue, built);
		expect(vm.$el.outerHTML).toBe('<div><h1>Hello <span>world</span></h1> <h1>goodbye <span>world</span></h1></div>');
	});

	test('Alias', async () => {
		const built = await build({
			'/index.vue': outdent`
				<template>
					<div>
						<h1>Hello <world /></h1>
						<goodbye-world/>
					</div>
				</template>
			`,
			'/components/world.vue': outdent`
			<template>
				<span>world</span>
			</template>
			`,
			'/components/goodbyeWorld.vue': outdent`
			<template>
				<h1>goodbye <world /></h1>
			</template>
			`
		}, {
			components: {
				world: '@/components/world.vue',
				'goodbye-world': '@/components/goodbyeWorld.vue',
				UnusedComp: '@/components/should-not-exist.vue',
			},
		});

		const vm = mount(Vue, built);
		expect(vm.$el.outerHTML).toBe('<div><h1>Hello <span>world</span></h1> <h1>goodbye <span>world</span></h1></div>');
	});

// resolve fn
// async components
});
