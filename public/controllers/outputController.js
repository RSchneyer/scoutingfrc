app.controller('outputControl', ['$scope', '$http', function($scope, $http){
	var db = firebase.firestore();
	$scope.options = [];
	$scope.csvArray = [];
	$scope.csvHeader = {a:"Team #", b:"Match", c:"Auto Shot", d:"Tele Scores", e:"Tele Flag"};

	$scope.getTeamCSV = function(element){
		element = element.substr(3);
		var rootRef = db.collection('/teams/'+element+'/events/'+$scope.exportCompetition.id+'/matches');
		var matches = rootRef.get()
		.then(snapshot => {
			snapshot.forEach(doc => {
				var jsonData = doc.data();
				console.log(jsonData);
				for(var p in jsonData){
					var row = {
						teamNum:element,
						matchNum:doc.id,
						autoShot:jsonData[p].autoShot,
						teleScores:jsonData[p].teleScores,
						teleFlag:jsonData[p].teleFlag
					};
					$scope.csvArray.push(row);
				};
			});
		});
	};
	$scope.csvCompChange = function(){
		var rootRef = db.doc("events/"+$scope.exportCompetition.id);
		var teams = rootRef.get()
		.then(doc => {
			data = doc.data();
			console.log(data.teams);
			data.teams.forEach($scope.getTeamCSV);
		});
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