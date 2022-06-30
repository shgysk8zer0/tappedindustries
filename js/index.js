import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/js/std-js/theme-cookie.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/current-year.js';
import 'https://cdn.kernvalley.us/components/install/prompt.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/app/stores.js';
import 'https://cdn.kernvalley.us/components/leaflet/map.js';
import 'https://cdn.kernvalley.us/components/leaflet/marker.js';
import { TILES } from 'https://cdn.kernvalley.us/components/leaflet/tiles.js';
import { ready, loaded, toggleClass, on, create } from 'https://cdn.kernvalley.us/js/std-js/dom.js';
import { getCustomElement } from 'https://cdn.kernvalley.us/js/std-js/custom-elements.js';
import { init } from 'https://cdn.kernvalley.us/js/std-js/data-handlers.js';
import { importGa, externalHandler, telHandler, mailtoHandler } from 'https://cdn.kernvalley.us/js/std-js/google-analytics.js';
import { GA } from './consts.js';

toggleClass([document.documentElement], {
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
	'js': true,
	'no-js': false,
});

if (typeof GA === 'string') {
	loaded().then(() => {
		requestIdleCallback(() => {
			importGa(GA).then(async ({ ga, hasGa }) => {
				if (hasGa()) {
					ga('create', GA, 'auto');
					ga('set', 'transport', 'beacon');
					ga('send', 'pageview');

					on('a[rel~="external"]', ['click'], externalHandler, { passive: true, capture: true });
					on('a[href^="tel:"]', ['click'], telHandler, { passive: true, capture: true });
					on('a[href^="mailto:"]', ['click'], mailtoHandler, { passive: true, capture: true });
				}
			});
		});
	});
}

Promise.all([
	getCustomElement('install-prompt'),
	getCustomElement('leaflet-map'),
	ready(),
]).then(([HTMLInstallPromptElement, HTMLLeafletMapElement]) => {
	init();

	document.getElementById('nav').replaceChildren(
		...Object.entries(TILES).map(([key, { tileSrc, attribution }], i) => create('button', {
			text: `${key} [${i}]`,
			accesskey: i,
			classList: ['btn', 'btn-primary', 'capitalize'],
			dataset: { tileSrc, attribution },
			events: {
				click: ({ target: { dataset: { tileSrc, attribution: html }}}) => {
					const map = document.querySelector('leaflet-map');
					const sanitizer = new Sanitizer();
					map.tileSrc = tileSrc;
					map.attribution = create('span', { html, sanitizer, slot: 'attribution' });
				}
			}
		}))
	);

	document.getElementById('main').replaceChildren(
		new HTMLLeafletMapElement({ crossOrigin: 'anonymous', detectRetina: true })
	);

	on('#install-btn', ['click'], () => new HTMLInstallPromptElement().show())
		.forEach(el => el.hidden = false);
});
