/* eslint no-unused-vars: 0 */
/* eslint-env serviceworker */

const config = {
	version: '1.0.0-07-18-2022',
	fresh: [
		'/',
		'/manifest.json',
		'/api/geo',
	].map(url => new URL(url, location.origin).href),
	stale: [
		/* HTML and Templates */
		'https://cdn.kernvalley.us/components/toast-message.html',
		'https://cdn.kernvalley.us/components/github/user.html',
		'https://cdn.kernvalley.us/components/install/prompt.html',

		/* JS */
		'/js/index.min.js',

		/* CSS */
		'/css/index.min.css',
		'https://cdn.kernvalley.us/components/toast-message.css',
		'https://cdn.kernvalley.us/components/github/user.css',
		'https://cdn.kernvalley.us/components/install/prompt.css',

		/* Images */
		'/img/icons.svg',
		'/img/neon.svg',
		'/img/cow.svg',
		'https://cdn.kernvalley.us/img/logos/play-badge.svg',
		'https://cdn.kernvalley.us/img/logos/itunes-badge.svg',
		'https://cdn.kernvalley.us/img/logos/windows-badge.svg',

		/* Fonts */
		'https://cdn.kernvalley.us/fonts/roboto.woff2',

		/* JSON/Data */
	].map(path => new URL(path, location.origin).href),
	allowed: [
		'https://secure.gravatar.com/avatar/',
		'https://i.imgur.com/',
		/https:\/\/*\.githubusercontent.com\/u\/*/,
		/\.(jpg|png|webp|svg|gif)$/,
	],
	allowedFresh: [
		'https://api.github.com/users/',
		/\.(html|css|js|json)$/,
	]
};
