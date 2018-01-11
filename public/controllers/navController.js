app.controller('navControl', ['$scope', '$mdSidenav', '$location',  function($scope, $mdSidenav, $location){
	$scope.togglesideNav = function(){
		$mdSidenav('left').toggle();
		console.log('SideNav toggled');
	};

	$scope.dashboard = function(){
		console.log('dashboard');
		$location.path('/dashboard');
		$mdSidenav('left').toggle();
	};
	$scope.matches = function(){
		console.log('matches');
		$location.path('/matches');
		$mdSidenav('left').toggle();
	};
	$scope.csv = function(){
		console.log('csv');
		$location.path('/download');
		$mdSidenav('left').toggle();
	};
	$scope.about = function(){
		console.log('about');
		$location.path('/about');
		$mdSidenav('left').toggle();
	};	
}]);
