var app = angular.module('scoutingfrc', ['ngMaterial', 'firebase']);

app.controller('authControl', ['$scope', '$rootScope', '$http', '$firebaseAuth', function($scope, $rootScope, $http, $firebaseAuth){
	$scope.authStatus = false;
	var auth = $firebaseAuth();

	var db = firebase.firestore();
	var usersDB = db.collection('users');

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

	// TODO: Move to appropriate Controller
	$scope.getTeamData = function(){
		var team = 'frc' + $scope.frcTeam;
		var info = $http.get('https://www.thebluealliance.com/api/v3/team/'+team+'/simple?X-TBA-Auth-Key=sLym63lk04kq6G9IwWsvzNxrSl7DYNoyH09RRHfj7trmskoWE8bTrVTjQ8nByZ8Z')
		.then(function(response){
			$scope.teamData = response.data;
		});
	};
	// TODO: GET OUT OF THiS CONTROLLER!!!
	$scope.loadTeamData = function(){
		var team = 'frc' + $scope.iowaTeamNumber;
		var info = $http.get('https://www.thebluealliance.com/api/v3/team/'+team+'?X-TBA-Auth-Key=sLym63lk04kq6G9IwWsvzNxrSl7DYNoyH09RRHfj7trmskoWE8bTrVTjQ8nByZ8Z')
		.then(function(response){
			$scope.teamDataBlock = response.data;
			var rootRef = firestore.doc("teams/"+$scope.iowaTeamNumber);
//			var teamRef = rootRef.collection('teams').doc($scope.iowaTeamNumber).collection('info');
			console.log("before root");
			rootRef.set({			
				city:$scope.teamDataBlock.city,
				country:$scope.teamDataBlock.country,
				nickname:$scope.teamDataBlock.nickname,
				state_prov:$scope.teamDataBlock.state_prov,
				team_number:$scope.teamDataBlock.team_number
			});
		});
	};
}]);

app.directive('teamInputCard', function(){
	return {
		templateUrl: 'teamInputCard.html',
	}
});

app.directive('loadTeamDataCard', function() {
	return {
		templateUrl: 'loadTeamDataCard.html',
	}
});