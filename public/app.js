var app = angular.module('scoutingfrc', ['ngMaterial']);

app.controller('authControl', ['$scope', '$rootScope', '$log', '$http', function($scope, $log, $rootScope, $http){
	$scope.authStatus = false;

	var provider = new firebase.auth.GoogleAuthProvider();
	var db = firebase.firestore();

	$scope.signIn = function () {
		firebase.auth().signInWithPopup(provider).then(function(result){
			$rootScope.user = result.user;
			// $scope.authStatus = true;
		});
		$scope.authStatus = true;
	}

	$scope.signOut = function (){
		firebase.auth().signOut().then(function(){
			$scope.authStatus = false;
		}).catch(function(error){
			console.log("An error occured: ", error);
		});
	};

	$scope.getTeamData = function(){
		var team = 'frc' + $scope.frcTeam;
		var info = $http.get('https://www.thebluealliance.com/api/v3/team/'+team+'/simple?X-TBA-Auth-Key=sLym63lk04kq6G9IwWsvzNxrSl7DYNoyH09RRHfj7trmskoWE8bTrVTjQ8nByZ8Z')
		.then(function(response){
			$scope.teamData = response.data;
		});

	};
}]);