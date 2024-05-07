/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.js');
const path = require('path');

/** @type {import("next").NextConfig} */
const config = {
	webpack(config) {
		config.resolve.alias = {
			...config.resolve.alias,
			// o1js: path('node_modules/o1js'),
			// o1js: path.resolve('node_modules/o1js'),
		};
		config.experiments = { ...config.experiments, topLevelAwait: true };
		config.optimization.minimizer = [];
		return config;
	},
	// To enable o1js for the web, we must set the COOP and COEP headers.
	// See here for more information: https://docs.minaprotocol.com/zkapps/how-to-write-a-zkapp-ui#enabling-coop-and-coep-headers
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'Cross-Origin-Opener-Policy',
						value: 'same-origin',
					},
					{
						key: 'Cross-Origin-Embedder-Policy',
						value: 'require-corp',
					},
				],
			},
		];
	},
};

export default config;
