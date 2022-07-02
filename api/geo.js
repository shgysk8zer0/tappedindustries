/* eslint-env node */

exports.handler = async function(event) {
	switch(event.httpMethod.toLowerCase()) {
		case 'get': {
			// const timestamp = Date.now();
			const { initializeApp } = require('firebase-admin/app');
			const { getFirestore } = require('firebase-admin/firestore');
			// const app = initializeApp({
			// 	apiKey: process.env.apiKey,
			// 	authDomain: 'cattle-tracking-app.firebaseapp.com',
			// 	projectId: 'cattle-tracking-app',
			// 	storageBucket: 'cattle-tracking-app.appspot.com',
			// 	messagingSenderId: process.env.messagingSenderId,
			// 	appId: process.env.appId,
			// });
			const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } = require('./creds.js');
			const app = initializeApp({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId });
			const db = getFirestore(app);
			const entries = await db.collection('geo').get();
			return {
				statusCode: 200,
				body: JSON.stringify(entries.map(doc => ({ uuid: doc.id, ...doc.data() }))),
			};
		}

		case 'post': {
			try {
				const body = JSON.parse(event.body);
				const { v4: uuidv4 } = require('uuid');
				const { initializeApp } = require('firebase-admin/app');
				const { getFirestore } = require('firebase-admin/firestore');
				const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } = require('./creds.js');
				const app = initializeApp({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId });
				const db = getFirestore(app);

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
				return { statusCode: 500, body: { error: err.mesage }};
			}
		}

		case 'delete':
		case 'put':
			return { statusCode: 501 };

		default:
			return { statusCode: 405 };
	}
};
