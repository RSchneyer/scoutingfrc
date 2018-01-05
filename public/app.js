var app = angular.module('scoutingfrc', ['ngMaterial', 'firebase', 'ngSanitize', 'ngCsv']);

app.run(function($rootScope){
	$rootScope.loggedIn = false;
	var db = firebase.firestore();
	firebase.auth().onAuthStateChanged(function(user){
		console.log('Auth State Changed');
		if (user) {
			var userDoc = db.collection('users').doc(user.uid);
			//If document with user's uid exists in users collection, otherwise create uid named document and add displayname and email fields
			if (userDoc.exists) {
				//User already exists, log in as usual
				console.log('User exists in Firestore');
			} else {
				userDoc.set({
					userDisplayName: user.displayName,
					email: user.email
				});
			}
			//Set $scope variables
			$rootScope.$apply(function(){
				$rootScope.user = user;
				$rootScope.loggedIn = true;
			});
		} 
		else {
			console.log('error');
		}
	});

	$rootScope.signIn = function(){
		var provider = new firebase.auth.GoogleAuthProvider();

		firebase.auth().signInWithPopup(provider).then(function(result){
			$rootScope.$apply(function(){
				$rootScope.user = result.user;
				$rootScope.loggedIn = true;
			});
		});
	};

	$rootScope.signOut = function(){
		firebase.auth().signOut().then(function(){
			$rootScope.user = {};
			$rootScope.loggedIn = false;
		});
	};
});


//Directives ///////////////////////////////////////////////////////////////////////////////////////////////////////////
app.directive('teamInputCard', function(){
	return {
		templateUrl: 'directives/teamInputCard.html',
	};
});

app.directive('loadTeamDataCard', function() {
	return {
		templateUrl: 'directives/loadTeamDataCard.html',
	};
});

app.directive('scoutMatchCard', function(){
	return {
		templateUrl: 'directives/scoutMatchCard.html',
	};
});

app.directive('teamStatsCard', function(){
	return {
		templateUrl: 'directives/teamStatsCard.html',
	};
});

app.directive('sideNav', function(){
	return {
		templateUrl: 'directives/sideNav.html',
	};
});

app.directive('exportCSVCard', function(){
	return {
		templateUrl: 'directives/exportCSVCard.html',
	};
});

app.directive('signInCard', function(){
	return {
		templateUrl: 'directives/signInCard.html',
	};
});