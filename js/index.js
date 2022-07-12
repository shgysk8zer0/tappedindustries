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
import { get as getLocation } from 'https://cdn.kernvalley.us/js/std-js/geo.js';
import { useSVG } from 'https://cdn.kernvalley.us/js/std-js/svg.js';
import { getJSON } from 'https://cdn.kernvalley.us/js/std-js/http.js';
import { loadImage } from 'https://cdn.kernvalley.us/js/std-js/loader.js';
import { TILES } from 'https://cdn.kernvalley.us/components/leaflet/tiles.js';
import { ready, loaded, toggleClass, on, create, css } from 'https://cdn.kernvalley.us/js/std-js/dom.js';
import { getCustomElement } from 'https://cdn.kernvalley.us/js/std-js/custom-elements.js';
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
	getCustomElement('leaflet-marker'),
	loadImage('/img/cow.svg', { height: 28, width: 28, slot: 'icon' }),
	ready(),
]).then(([HTMLInstallPromptElement, HTMLLeafletMapElement, HTMLLeafletMarkerElement, cow]) => {
	css('#sidebar > .btn', { width: '100%', 'margin-bottom': '0.6em' });
	on('#sidebar > .btn[data-theme-set]', 'click', ({ target: { dataset: { themeSet: value }}}) => {
		cookieStore.set({ name: 'theme', value }).catch(console.error);
	});

	document.getElementById('logo').after(
		...Object.entries(TILES).map(([key, { tileSrc, attribution }], i) => create('button', {
			text: `${key} [${(i + 1).toString()}]`,
			accesskey: (i + 1).toString(),
			classList: ['btn', 'btn-primary', 'capitalize'],
			dataset: { tileSrc, attribution },
			events: {
				click: ({ target: { dataset: { tileSrc, attribution: html }}}) => {
					const map = document.querySelector('leaflet-map');
					const attr = document.createElement('span');
					attr.slot = 'attribution';
					attr.setHTML(html);
					map.tileSrc = tileSrc;
					map.attribution = attr;
				}
			}
		}))
	);

	document.getElementById('main').replaceChildren(new HTMLLeafletMapElement({
		crossOrigin: 'anonymous',
		detectRetina: true,
		zoomControl: true,
	}));

	getJSON('/api/geo').then(items => {
		if (items.error) {
			throw new Error(items.error);
		}

		const map = document.querySelector('leaflet-map');
		const [{ coords: { latitude, longitude }}] = items;

		map.center = { latitude, longitude };
		css(map, { '--map-height': '85vh', '--map-width': '100%' });
		map.append(
			...items.filter(({ coords }) => typeof coords === 'object')
				.map(({ uuid, coords, timestamp, battery, tracker_id, }) => {
					const marker = new HTMLLeafletMarkerElement(coords);
					const content = document.createElement('div');
					const date = new Date(timestamp * 1000);
					content.setHTML(`
						<h3>Sample Data</h3>
						<center>
							<img src="https://cdn.kernvalley.us/img/raster/missing-image.png" height="160" width="320" loading="lazy" alt="" crossorigin="anonymous" referrerpolicy="no-referrer" />
						</center>
						<b>Tracker ID:</b> <span>${tracker_id}</span><br>
						<b>Latitude:</b> <span>${latitude}</span><br>
						<b>Longitude:</b> <span>${longitude}</span><br>
						<b>Battery:</b> <span>${battery} %</span><br>
						<b>DateTime</b>: <time datetime="${date.toISOString()}">${date.toLocaleString()}</time>
					`);

					content.slot = 'popup';
					marker.id = uuid;
					marker.append(content, cow.cloneNode());
					return marker;
				})
		);
	}).catch(err => {
		console.error(err);
		const dialog = create('dialog', {
			events: { close: ({ target }) => target.remove() },
			children: [
				create('button', {
					type: 'button',
					classList: ['btn', 'btn-reject'],
					children: [useSVG('x', {
						width: 16,
						height: 16,
						fill: 'currentColor',
						classList: ['icon']
					})],
					events: { click: ({ target }) => target.closest('dialog').close() },
				}),
				create('div', {
					classList: ['status-box', 'error'],
					text: err.message,
				}),
			]
		});

		document.body.append(dialog);
		dialog.showModal();
	});

	on('#install-btn', ['click'], () => new HTMLInstallPromptElement().show())
		.forEach(el => el.hidden = false);

	document.getElementById('sidebar').append(create('button', {
		type: 'button',
		classList: ['btn', 'btn-primary'],
		styles: { width: '100%' },
		children: [
			useSVG('mark-location', { height: 20, width: 20, fill: 'currentColor', classList: ['icon'] }),
			create('span', { text: 'Current Location' }),
		],
		events: {
			click: async () => {
				const { coords: { latitude, longitude }} = await getLocation({ enableHightAccuracy: true });
				document.querySelector('leaflet-map').flyTo({ latitude, longitude });
			},
		}
	}));
});
