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