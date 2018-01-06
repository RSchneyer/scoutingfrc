const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.userCreate = functions.auth.user().onCreate(event => {
	const user = event.data;
	const displayName = user.displayName;
	const uid = user.uid;
	console.log('new user Created:'+ displayName+' UID: '+uid);
	return 0;
});
// exports.loadTeamData = functions.database.ref('').onWrite(event => {

// });
//exports.updateMatchAverage = functions.database.ref('file/path/').onWrite(event => {
//
//});