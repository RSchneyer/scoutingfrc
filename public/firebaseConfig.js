// Initialize Firebase
var config = {
	apiKey: "AIzaSyCUCYkr-YZSJAzRDOsgzm5FuMd4uaK2P6U",
	authDomain: "scoutingfrc-189201.firebaseapp.com",
	databaseURL: "https://scoutingfrc-189201.firebaseio.com",
	projectId: "scoutingfrc-189201",
	storageBucket: "scoutingfrc-189201.appspot.com",
	messagingSenderId: "458144233871"
};
firebase.initializeApp(config);

firebase.firestore().enablePersistence()
.then(function() {
	// Initialize Cloud Firestore through firebase
    var db = firebase.firestore();
})
.catch(function(err) {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled
        // in one tab at a a time.
        // ...
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
        // ...
    }
});