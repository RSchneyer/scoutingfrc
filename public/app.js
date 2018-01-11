var app = angular.module('scoutingfrc', ['ngMaterial', 'firebase', 'ngSanitize', 'ngCsv', 'ngRoute']);

app.run(function($rootScope, $location, $mdDialog){
	$rootScope.loggedIn = false;
	$rootScope.newUser = false;
	var db = firebase.firestore();
	firebase.auth().onAuthStateChanged(function(user){
		console.log('Auth State Changed');
		if (user) {
			var userDoc = db.collection('users').doc(user.uid);
			//If document with user's uid exists in users collection, otherwise create uid named document and ask for team affiliation
			var userCheck = userDoc.get()
			.then(doc => {
				if(doc.exists){
					//User already exists, log in as usual
					console.log('User exists in Firestore');
					console.log('userTeam: '+doc.data().team);
					$rootScope.userTeam = doc.data().team;
				}else{
					$rootScope.showPrompt();
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
			});
		}
		else {
			console.log('error: no user logged in');
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

	$rootScope.showPrompt = function() {
    // Appending dialog to document.body to cover sidenav in docs app
    	var confirm = $mdDialog.prompt()
		.title('What team are you apart of?')	
      	.textContent('Put zero if you are unaffiliated')
      	.placeholder('Team #')
      	.ariaLabel('Team #')
      	.initialValue('0')
//      	.targetEvent(ev)
      	.required(true)
	    .ok('Lets Go!')
	    .cancel('I\'d rather not be affiliated with a team');

		$mdDialog.show(confirm).then(function(result) {
	    	var ref = db.collection('users').doc($rootScope.user.uid);
	    	ref.set({
				team : result
			}, { merge: true });
			$rootScope.userTeam = result;
	    }, function() {
	    	var ref = db.collection('users').doc($rootScope.user.uid);
	    	ref.set({
				team : 0
			}, { merge: true });
			$rootScope.userTeam = 0;
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
	})
	.when('/matches', {
		templateUrl:'views/matches.html'
	})
	.when('/download', {
		templateUrl:'views/download.html'
	})
	.when('/about', {
		templateUrl: 'views/about.html'
	});
	$locationProvider.html5Mode(true);
});


// Directives ///////////////////////////////////////////////////////////////////////////////////////////////////////////
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