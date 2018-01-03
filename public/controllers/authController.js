app.controller('authControl', ['$scope', '$rootScope', '$firebaseAuth', function($scope, $rootScope, $firebaseAuth){
	
	$scope.authStatus;
	var auth = $firebaseAuth();

	var db = firebase.firestore();
	var usersDB = db.collection('users')


	$scope.checkAuth = function(){
		var loggedIn = auth.$getAuth();
		if (loggedIn){
			$scope.authStatus = true;
		} else {
			$scope.authStatus = false;
		}
		console.log('checkAuth ran!');
		console.log(loggedIn);
	};
	$scope.checkAuth();


	$scope.signIn = function(){
		auth.$signInWithPopup('google').then(function(result){
			var authResult = result;
			usersDB.doc(authResult.user.uid).get().then(function(result){
				if (result.exists) {
					console.log("You Exist. Congrats.")
				} else {
					usersDB.doc(authResult.user.uid).set({
						userDisplayName: authResult.user.displayName
					})
					.then(function(){
						console.log('User created!')
					})
					.catch(function(error){
						console.log('An error occurred: ', error);
					})
				};
			})


			console.dir(result);
			$scope.currUser = result.user.uid;
			
			$scope.authStatus = true;
		}).catch(function(error){
			console.error("Authentication failed: ", error);
		});
	};

	$scope.signOut = function(){
		auth.$signOut().then(function(){
			console.log('Signed Out!');
			$scope.authStatus = false;
		});
	};
}]);