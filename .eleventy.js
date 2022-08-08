/* eslint-env node */
const yaml = require("js-yaml");

module.exports = (eleventyConfig) => {
	eleventyConfig.ignores.add('.github');
	eleventyConfig.ignores.add('img/**.md');
	eleventyConfig.ignores.add('css/**.md');
	eleventyConfig.ignores.add('js/**.md');
	eleventyConfig.ignores.add('CHANGELOG.md');
	eleventyConfig.ignores.add('README.md');
	eleventyConfig.addPassthroughCopy('img');
	eleventyConfig.addPassthroughCopy('css');
	eleventyConfig.addPassthroughCopy('js');
	eleventyConfig.addPassthroughCopy('webapp.webmanifest');
	eleventyConfig.addPassthroughCopy('service-worker.js');
	eleventyConfig.addPassthroughCopy('sw-config.js');
	eleventyConfig.addPassthroughCopy('favicon.ico');
	eleventyConfig.addPassthroughCopy('browserconfig.xml');
	eleventyConfig.addDataExtension('yaml', contents => yaml.load(contents));
	eleventyConfig.addDataExtension('yml', contents => yaml.load(contents));
	eleventyConfig.addLiquidFilter('jsonify', function(data) {
		console.log({ jsonify: data });
		return JSON.stringify(data) || 'IDK';
	});

	return {
		environment: {
			ENVIRONMENT: process.env.environment || 'unknown',
		},
		dir: {
			layouts: '_layouts',
			includes: '_includes',
			data: '_data',
			input: './',
			output: '_site',
			dataTemplateEngine: 'liquid',
		},
		dynamicPartials: true,
	}
};
