/* eslint-env node */

exports.handler = async function(event) {
	console.log(event);
	switch(event.httpMethod.toLowerCase()) {
		case 'post': {
			try {
				const { initializeApp } = require('firebase-admin/app');
				// const { getFirestore } = require('firebase-admin/firestore');
				// const db = getFirestore();
				initializeApp({
					apiKey: process.env.apiKey,
					authDomain: 'cattle-tracking-app.firebaseapp.com',
					projectId: 'cattle-tracking-app',
					storageBucket: 'cattle-tracking-app.appspot.com',
					messagingSenderId: process.env.messagingSenderId,
					appId: process.env.appId,
				});

				// await db.collection('users').doc('aturing').set({
				// 	timestamp: Date.now(),
				//  });
				return {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(event),
				};
			} catch(err) {
				console.error(err);
				return { status: 500, body: err.mesage };
			}
		}

		case 'get':
		case 'put':
		case 'delete':
			return { status: 501 };

		default:
			return { status: 405 };
	}
};
