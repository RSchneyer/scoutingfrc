app.controller('outputControl', ['$scope', '$http', function($scope, $http){
	var db = firebase.firestore();
	$scope.options = [];
	$scope.csvArray = [{a:1, c:"c", d:"d"}, {b:"1", c:"3", a:"5"}, {a:"h", b:"8", c:"d"}];
	
	$scope.csvCompChange = function(){
		
	};
	//initialiaze the competitions to pick in the dropdown box
	$scope.init = function(){
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
	$scope.init();
}]);