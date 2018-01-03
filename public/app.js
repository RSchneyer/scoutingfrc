var app = angular.module('scoutingfrc', ['ngMaterial', 'firebase']);

app.controller('navControl', ['$mdSidenav', function($mdSidenav){
	$scope.togglesideNav = function(){
		$mdSidenav('left').toggle();
		console.log('SideNav toggled');
		console.log($scope.userPhoto);
	};	
}])


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.controller('outputControl', ['$scope', '$http', function($scope, $http){
	var db = firebase.firestore();
	$scope.options = [];
	$scope.downloadEvent = function(){

	};
	//initialiaze the competitions to pick in the dropdown box
	var init = function(){
		var rootRef = db.collection("events/");
		var evets = rootRef.get()
		.then(snapshot => {
			snapshot.forEach(doc => {
				docData = doc.data();
				var element = {};
				element.name = docData.short_name;
				element.id = doc.id;
				$scope.options.push(element);
				$scope.$apply();
			})
		})
	}
	init();
}]);




//Directives ///////////////////////////////////////////////////////////////////////////////////////////////////////////
app.directive('teamInputCard', function(){
	return {
		templateUrl: 'directives/teamInputCard.html',
	}
});

app.directive('loadTeamDataCard', function() {
	return {
		templateUrl: 'directives/loadTeamDataCard.html',
	}
});

app.directive('scoutMatchCard', function(){
	return {
		templateUrl: 'directives/scoutMatchCard.html',
	}
});

app.directive('teamStatsCard', function(){
	return {
		templateUrl: 'directives/teamStatsCard.html',
	}
});

app.directive('sideNav', function(){
	return {
		templateUrl: 'directives/sideNav.html',
	}
});

app.directive('exportCSVCard', function(){
	return {
		templateUrl: 'directives/exportCSVCard.html',
	}
});