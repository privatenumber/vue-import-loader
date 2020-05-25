const http = require('http');
const path = require('path');
const webpack = require('webpack');
const { Volume } = require('memfs');
const fs = require('fs');
const { ufs } = require('unionfs');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const loaderPath = require.resolve('..');

const httpServer = (() => {
	let builtFs;

	const server = http.createServer((req, res) => {
		res.write(builtFs.readFileSync(req.url));
		setTimeout(() => res.end(), 200);
	});

	return {
		setFs(_builtFs) {
			builtFs = _builtFs;
		},
		start() {
			return new Promise((resolve) => {
				this.listening = server.listen(0, resolve);
			});
		},
		get port() {
			return this.listening.address().port;
		},
		stop() {
			return new Promise((resolve) => {
				server.close(resolve);
			});
		},
	};
})();

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
					'@': '/',
				},
			},
			resolveLoader: {
				alias: {
					'vue-import-loader': loaderPath,
				},
			},
			module: {
				rules: [
					{
						test: /\.vue$/,
						use: [
							{
								loader: 'vue-import-loader',
								options: loaderConfig,
							},
							{
								loader: 'vue-loader',
								options: {
									productionMode: true,
								},
							},
						],
					},
				],
			},
			plugins: [
				new VueLoaderPlugin(),
			],
			entry: '/index.vue',
			output: {
				path: '/dist-[hash]',
				publicPath: `http://localhost:${httpServer.port}/dist-[hash]/`,
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

			httpServer.setFs(mfs);
			resolve(mfs.readFileSync(`/dist-${stats.hash}/main.js`).toString());
		});
	});
}

function mount(Vue, src) {
	// eslint-disable-next-line no-eval
	const { default: Component } = eval(src);
	const vm = new Vue(Component);
	vm.$mount();
	return vm;
}

module.exports = {
	httpServer,
	build,
	mount,
};
