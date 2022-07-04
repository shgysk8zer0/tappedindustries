/* eslint-env node */

function getTimestamp(ts = Date.now(), ns = 0) {
	const { Timestamp } = require('firebase-admin/firestore');
	return new Timestamp(ts, ns);
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

exports.handler = async function(event) {
	switch(event.httpMethod.toLowerCase()) {
		case 'get': {
			try {
				const app = getApp();
				const { getFirestore } = require('firebase-admin/firestore');
				const db = getFirestore(app);
				const docs = await db.collection('geo').get();
				// `docs.map()` won't work
				const entries = [];
				docs.forEach(doc => {
					const uuid = doc.id;
					const data = doc.data();

					if (typeof data.coords === 'object') {
						entries.push({
							uuid,
							battery: data.battery,
							timestamp: data.timestamp._seconds,
							gps_status: data.gps_status,
							report_type: data.report_type,
							tracker_id: data.tracker_id,
							coords: {
								latitude: data.coords._latitude,
								longitude: data.coords._longitude,
							},
						});
					}
				});

				return {
					statusCode: 200,
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(entries),
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

		case 'post': {
			try {
				const { getFirestore } = require('firebase-admin/firestore');
				// const { getFirestore, GeoPoint } = require('firebase-admin/firestore');
				const app = getApp();
				const db = getFirestore(app);
				const body = JSON.parse(event.body);
				const { v4: uuidv4 } = require('uuid');
				// const coords = new GeoPoint(latitude, longitude);
				const timestamp = getTimestamp();

				await db.collection('geo').doc(uuidv4()).set({ timestamp, body });

				return {
					statusCode: 200,
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ body, timestamp }),
				};
			} catch(err) {
				console.error(err);
				return {
					statusCode: 500,
					body: JSON.stringify({ error: err.message }),
				};
			}
		}

		case 'delete':
		case 'put':
			return { statusCode: 501 };

		default:
			return { statusCode: 405 };
	}
};
