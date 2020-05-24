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
				UnusedComp: '/should-not-exist.vue',
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
						<h1>Hello <world-el /></h1>
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
				<h1>goodbye <WorldEl /></h1>
			</template>
			`
		}, {
			components: {
				'world-el': '/world.vue',
				'goodbye-world': '/goodbyeWorld.vue',
				UnusedComp: '/should-not-exist.vue',
			},
		});

		const vm = mount(Vue, built);
		expect(vm.$el.outerHTML).toBe('<div><h1>Hello <span>world</span></h1> <h1>goodbye <span>world</span></h1></div>');
	});

	test('Component collision w/ Pascal', async () => {
		const built = await build({
			'/index.vue': outdent`
				<template>
					<div>
						<hello-world />
					</div>
				</template>
				<script>
				import HelloWorld from './hello-world-real.vue';

				export default {
					components: {
						HelloWorld
					}
				}
				</script>
			`,
			'/hello-world-real.vue': outdent`
			<template>
				<span>hello world real</span>
			</template>
			`,
			'/hello-world-fake.vue': outdent`
			<template>
				<span>hello world fake</span>
			</template>
			`,
		}, {
			components: {
				'hello-world': '/hello-world-fake.vue',
			},
		});

		const vm = mount(Vue, built);
		expect(vm.$el.outerHTML).toBe('<div><span>hello world real</span></div>');
	});

	test('Component collision w/ kebab', async () => {
		const built = await build({
			'/index.vue': outdent`
				<template>
					<div>
						<hello-world />
					</div>
				</template>
				<script>
				import HelloWorld from './hello-world-real.vue';

				export default {
					components: {
						'hello-world': HelloWorld
					}
				}
				</script>
			`,
			'/hello-world-real.vue': outdent`
			<template>
				<span>hello world real</span>
			</template>
			`,
			'/hello-world-fake.vue': outdent`
			<template>
				<span>hello world fake</span>
			</template>
			`,
		}, {
			components: {
				'hello-world': '/hello-world-fake.vue',
			},
		});

		const vm = mount(Vue, built);
		expect(vm.$el.outerHTML).toBe('<div><span>hello world real</span></div>');
	});

	test('Dynamic component', async () => {
		const built = await build({
			'/index.vue': outdent`
				<template>
					<div>
						<component :is="true ? 'world' : undefined" />
						<component is="goodbye-world" />
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
		expect(vm.$el.outerHTML).toBe('<div><span>world</span> <h1>goodbye <span>world</span></h1></div>');
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

	test('Resolve function', async () => {
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
			'/components/goodbye-world.vue': outdent`
			<template>
				<h1>goodbye <world /></h1>
			</template>
			`
		}, {
			components({ kebab }) {
				if (['world', 'goodbye-world'].includes(kebab)) {
					return `/components/${kebab}.vue`;
				}
			},
		});

		const vm = mount(Vue, built);
		expect(vm.$el.outerHTML).toBe('<div><h1>Hello <span>world</span></h1> <h1>goodbye <span>world</span></h1></div>');
	});
});

describe('Functional components', () => {
	test('Functional mode disabled', async () => {
		const built = await build({
			'/index.vue': outdent`
				<template>
					<goodbye-world/>
				</template>
			`,
			'/components/goodbye-world.vue': outdent`
			<template functional>
				<h1><goodbye /> <world /></h1>
			</template>
			`,
			'/components/goodbye.vue': outdent`
			<template functional>
				<span>good<bye /></span>
			</template>
			`,
			'/components/bye.vue': outdent`
			<template functional>
				<span>bye</span>
			</template>
			`,
			'/components/world.vue': outdent`
			<template functional>
				<span>world</span>
			</template>
			`,
		}, {
			components: {
				GoodbyeWorld: '/components/goodbye-world.vue',
				Goodbye: '/components/goodbye.vue',
				Bye: '/components/bye.vue',
				World: '/components/world.vue',
			},
		});

		const vm = mount(Vue, built);
		expect(vm.$el.outerHTML).toBe('<h1><goodbye></goodbye> <world></world></h1>');
	});

	test('Functional mode enabled', async () => {
		const built = await build({
			'/index.vue': outdent`
				<template>
					<goodbye-world/>
				</template>
			`,
			'/components/goodbye-world.vue': outdent`
			<template functional>
				<h1><goodbye /> <world /></h1>
			</template>
			`,
			'/components/goodbye.vue': outdent`
			<template functional>
				<span>good<bye /></span>
			</template>
			`,
			'/components/bye.vue': outdent`
			<template functional>
				<span>bye</span>
			</template>
			`,
			'/components/world.vue': outdent`
			<template functional>
				<span>world</span>
			</template>
			`,
		}, {
			functional: true,
			components: {
				GoodbyeWorld: '/components/goodbye-world.vue',
				Goodbye: '/components/goodbye.vue',
				Bye: '/components/bye.vue',
				World: '/components/world.vue',
			},
		});

		const vm = mount(Vue, built);
		expect(vm.$el.outerHTML).toBe('<h1><span>good<span>bye</span></span> <span>world</span></h1>');
	});

});

describe('Unused component detection', () => {
	test('Don\'t import fake component - Pascal', async () => {
		const built = await build({
			'/index.vue': outdent`
				<template>
					<div>
						<hello-world />
					</div>
				</template>
				<script>
				import HelloWorld from './hello-world-real.vue';

				export default {
					components: {
						HelloWorld,
						['random-comp']: {},
						...({})
					}
				}
				</script>
			`,
			'/hello-world-real.vue': outdent`
			<template>
				<span>hello world real</span>
			</template>
			`,
		}, {
			components: {
				'hello-world': '/hello-world-non-existent.vue',
			},
		});

		const vm = mount(Vue, built);
		expect(vm.$el.outerHTML).toBe('<div><span>hello world real</span></div>');
	});

	test('Don\'t import fake component - kebab', async () => {
		const built = await build({
			'/index.vue': outdent`
				<template>
					<div>
						<hello-world />
					</div>
				</template>
				<script>
				import HelloWorld from './hello-world-real.vue';

				export default {
					components: {
						['hello-world']: HelloWorld,
					}
				}
				</script>
			`,
			'/hello-world-real.vue': outdent`
			<template>
				<span>hello world real</span>
			</template>
			`,
		}, {
			components: {
				'hello-world': '/hello-world-non-existent.vue',
			},
		});

		const vm = mount(Vue, built);
		expect(vm.$el.outerHTML).toBe('<div><span>hello world real</span></div>');
	});

	test('Won\'t detect registered', (cb) => {
		build({
			'/index.vue': outdent`
				<template>
					<div>
						<hello-world />
					</div>
				</template>
				<script>
				import HelloWorld from './hello-world-real.vue';

				const component = {
					components: {
						['hello-world']: HelloWorld,
					}
				};

				export default component;
				</script>
			`,
			'/hello-world-real.vue': outdent`
			<template>
				<span>hello world real</span>
			</template>
			`,
		}, {
			components: {
				'hello-world': '/hello-world-trap.vue',
			},
		}).catch(err => {
			// Expect error
			cb();
		});
	});
});


