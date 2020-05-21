const path = require('path');
const webpack = require('webpack');
const { Volume } = require('memfs');
const fs = require('fs');
const { ufs } = require('unionfs');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const loaderPath = require.resolve('..');

function build(volJson, loaderConfig = {}) {
	return new Promise((resolve, reject) => {
		const mfs = Volume.fromJSON(volJson);
		mfs.join = path.join.bind(path);

		const compiler = webpack({
			mode: 'production',
			optimization: {
				minimize: false,
				providedExports: false,
			},
			resolve: {
				alias: {
					'@': '/'
				},
			},
			resolveLoader: {
				alias: {
					'vue-global-component-loader': loaderPath,
				},
			},
			module: {
				rules: [
					{
						test: /\.vue$/,
						use: [
							{
								loader: 'vue-global-component-loader',
								options: loaderConfig,
							},
							'vue-loader',
						],
					},
				],
			},
			plugins: [
				new VueLoaderPlugin(),
			],
			entry: '/index.vue',
			output: {
				path: '/dist',
			},
		});

		compiler.inputFileSystem = ufs.use(fs).use(mfs);
		compiler.outputFileSystem = mfs;

		compiler.run((err, stats) => {
			if (err) {
				reject(err);
				return;
			}

			if (stats.compilation.errors.length > 0) {
				reject(stats.compilation.errors);
				return;
			}

			resolve(mfs.readFileSync('/dist/main.js').toString());
		});
	});
}

function mount(Vue, src) {
	const { default: Component } = eval(src);
	const vm = new Vue(Component);
	vm.$mount();
	return vm;
}

module.exports = {
	build,
	mount,
};
