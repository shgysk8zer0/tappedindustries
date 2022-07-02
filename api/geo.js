/* eslint-env node */

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
				const entries = await db.collection('geo').get();

				return {
					statusCode: 200,
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(entries.map(doc => ({ uuid: doc.id, ...doc.data() }))),
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
				const app = getApp();
				const db = getFirestore(app);
				const body = JSON.parse(event.body);
				const { v4: uuidv4 } = require('uuid');

				await db.collection('geo').doc(uuidv4()).set({
					timestamp: Date.now(),
					body: body,
				});

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
