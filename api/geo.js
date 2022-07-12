/* eslint-env node */

function getTimestamp(ts = Date.now(), ns = 0) {
	const { Timestamp } = require('firebase-admin/firestore');
	return new Timestamp(Math.floor(ts / 1000), ns);
}

function getApp() {
	if (typeof process.env.serviceAccount !== 'string') {
		throw new Error('No Service Account set in `process.env`');
	} else {
		const { initializeApp, cert } = require('firebase-admin/app');
		const serviceAccount = JSON.parse(process.env.serviceAccount);
		const app = initializeApp({
			credential: cert(serviceAccount),
		}, 'temp-' + Date.now());

		return app;
	}
}

function parseGeoItem(data) {
	return {
		battery: data.battery,
		timestamp: data.timestamp._seconds,
		gps_status: data.gps_status,
		report_type: data.report_type,
		tracker_id: data.tracker_id,
		coords: {
			latitude: data.coords._latitude,
			longitude: data.coords._longitude,
		},
	};
}

exports.handler = async function(event) {
	switch(event.httpMethod.toLowerCase()) {
		case 'get': {
			try {
				const app = getApp();
				const { getFirestore } = require('firebase-admin/firestore');
				const db = getFirestore(app);
				// @TODO check authentication / ownership

				if ('id' in event.queryStringParameters) {
					const doc = await db.collection('geo').doc(event.queryStringParameters.id).get();

					if (doc.exists) {
						// @TODO use `parseGeoItem(doc.data())` if valid item
						return {
							statusCode: 200,
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								uuid: doc.id,
								...doc.data(),
								// ...parseGeoItem(doc.data()),
							})
						};
					} else {
						return {
							statusCode: 404,
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								error: `No results for ID of ${event.queryStringParameters.id}`,
							})
						};
					}
				} else {
					// @TODO Only select the most recent entry by device ID
					const docs = await db.collection('geo').get();
					// `docs.map()` won't work
					const entries = [];
					docs.forEach(doc => {
						const uuid = doc.id;
						const data = doc.data();

						if (typeof data.coords === 'object') {
							entries.push({ uuid, ...parseGeoItem(data)});
						}
					});

					return {
						statusCode: 200,
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(entries),
					};
				}
			} catch(err) {
				console.error(err);
				return {
					statusCode: 500,
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ error: err.message }),
				};
			}
		}

		case 'post': {
			try {
				const { getFirestore, GeoPoint } = require('firebase-admin/firestore');
				const app = getApp();
				const db = getFirestore(app);
				const body = JSON.parse(event.isBase64Encoded ? atob(event.body) : event.body);
				const { v4: uuidv4 } = require('uuid');
				const {
					dev_eui: tracker_id,
					decoded: {
						payload: {
							battery,
							gps_status: { value: gps_status },
							report_type: { value: report_type },
							position: { latitude, longitude },
						}
					},
				} = body;

				const id = uuidv4();
				await db.collection('geo').doc(id).set({
					battery,
					timestamp: getTimestamp(),
					coords: new GeoPoint(latitude, longitude),
					gps_status,
					report_type,
					tracker_id,
				});

				return {
					statusCode: 201,
					headers: {
						'Content-Type': 'application/json',
						'Location': `${event.rawUrl}?id=${id}`,
					},
					body: JSON.stringify({ id }),
				};
			} catch(err) {
				console.error(err);
				return {
					statusCode: 500,
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ error: err.message }),
				};
			}
		}


		case 'delete':
			if ('id' in event.queryStringParameters) {
				try {
					const app = getApp();
					const { getFirestore } = require('firebase-admin/firestore');
					const db = getFirestore(app);
					await db.collection('geo').doc(event.queryStringParameters.id).delete();
					return { statusCode: 204 };
				} catch(err) {
					console.error(err);
					return {
						statusCode: 500,
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ error: 'Error deleting record'}),
					};
				}
			} else {
				return {
					statusCode: 400,
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ error: 'Missing required param: `id`' }),
				};
			}

		case 'patch':
		case 'put': return { statusCode: 501 };

		default:
			return { statusCode: 405 };
	}
};
