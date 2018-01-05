angular.module('scoutingfrc', ['ngMaterial', 'firebase'])

.controller('sideControl', ['$scope', '$mdSidenav', function($scope, $mdSidenav){
	$scope.togglesideNav = function() {
		$mdSidenav('leftNav').toggle();
		console.log('SideNav toggled');
	};	
}]);