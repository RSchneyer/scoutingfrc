app.controller('navControl', ['$scope', '$mdSidenav', function($scope, $mdSidenav){
	$scope.togglesideNav = function(){
		$mdSidenav('left').toggle();
		console.log('SideNav toggled');
	};	
}]);