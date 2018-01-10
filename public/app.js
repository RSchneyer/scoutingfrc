var app = angular.module('scoutingfrc', ['ngMaterial', 'firebase', 'ngSanitize', 'ngCsv', 'ngRoute']);

app.run(function($rootScope, $location){
	$rootScope.loggedIn = false;
	$rootScope.newUser = false;
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
				//Set flag to display team register directive
				$rootScope.$apply(function(){
					$rootScope.newUser = true;
				});
			}
			//Set $scope variables
			$rootScope.$apply(function(){
				$rootScope.user = user;
				$rootScope.loggedIn = true;
				$location.path('/dashboard'); //Direct user to scoutingfrc.com/dashboard if user is logged in
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
			$rootScope.$apply(function(){
				$rootScope.user = {};
				$rootScope.loggedIn = false;
				$location.path('/');
			});
		});
	};
});
	
// Angular Routing /////////////////////////////

app.config(function($routeProvider, $locationProvider){
	$routeProvider
	.when('/', {
		templateUrl: 'views/register.html',
	})
	.when('/dashboard', {
		templateUrl: 'views/dashboard.html'
	});
	$locationProvider.html5Mode(true);
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