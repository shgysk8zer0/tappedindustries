/* eslint-env node */

exports.handler = async function(event) {
	console.log(event);
	switch(event.httpMethod.toLowerCase()) {
		case 'get': {
			// const timestamp = Date.now();
			// const { initializeApp } = require('firebase-admin/app');
			// const { getFirestore } = require('firebase-admin/firestore');
			// initializeApp({
			// 	apiKey: process.env.apiKey,
			// 	authDomain: 'cattle-tracking-app.firebaseapp.com',
			// 	projectId: 'cattle-tracking-app',
			// 	storageBucket: 'cattle-tracking-app.appspot.com',
			// 	messagingSenderId: process.env.messagingSenderId,
			// 	appId: process.env.appId,
			// });
			// const db = getFirestore();
			const { v4: uuidv4 } = require('uuid');
			return {
				statusCode: 200,
				body: JSON.stringify([{
					uuid: uuidv4(),
					timestamp: Date.now(),
					coords: {
						latitude: 121.487685,
						longitude: 24.9965568,
					},
					battery: 67,
					report_type: 2,
					gps_status: 2,
				}]),
			};
		}

		case 'post': {
			try {
				const body = JSON.parse(event.body);
				const timestamp = Date.now();
				// const { initializeApp } = require('firebase-admin/app');
				// const { getFirestore } = require('firebase-admin/firestore');
				// initializeApp({
				// 	apiKey: process.env.apiKey,
				// 	authDomain: 'cattle-tracking-app.firebaseapp.com',
				// 	projectId: 'cattle-tracking-app',
				// 	storageBucket: 'cattle-tracking-app.appspot.com',
				// 	messagingSenderId: process.env.messagingSenderId,
				// 	appId: process.env.appId,
				// });
				// const db = getFirestore();

				// await db.collection('users').doc('aturing').set({
				// 	timestamp: Date.now(),
				//  });
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
