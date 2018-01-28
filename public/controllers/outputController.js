app.controller('outputControl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope){
	var db = firebase.firestore();
	$scope.options = [];
	$scope.csvArray = [];
	$scope.csvHeader = {a:"Scouting Team #", b:"Competition", c:"Team #", d:"Team Name", e:"Alliance Color", f:"Match #", 
						g:"Crossed Auto Line", h:"Cube in Low Switch(auto)", i:"Cube in High Switch(auto)", j:"Cube Wrong side(auto)", 
						k:"Cube Wrong side(tele)", l:"Exchange Cubes", m:"Opposite Switch", n:"High Scale", o:"Alliance Switch", 
						p:"Boost(sec into match)", q:"Force(sec into match)", r:"Levitate(sec into match)", s:"Parked on Platform", 
						t:"Climbed", u:"Played defense", v:"Delt with Defense", w:"Average Time Per Cube(sec)", x:"Alliance Member 1", 
						y:"Alliance Member 2"};

	$scope.getTeamCSV = function(element){
		element = element.substr(3);
		var teamName;
		var autoLow = 0, autoHigh = 0, climbed = 0, parked = 0;
		var teamRef = db.doc('/teams/'+element);
		var teamInfo = teamRef.get()
		.then(doc => {
			teamName = doc.data().nickname;
			console.log(doc.data());
			var rootRef = db.collection('/teams/'+element+'/events/'+$scope.exportCompetition.id+'/matches');
			var matches = rootRef.get()
			.then(snapshot => {
				snapshot.forEach(doc => {
					var jsonData = doc.data();
					console.log(jsonData);
					for(var p in jsonData){
						switch (jsonData[p].autoCube){
							case 'notry':

								break;
							case 'lowtry':
								autoLow = .1;
								break;
							case 'hightry':
								autoHigh = .1;
								break;
							case 'lowsuccess':
								autoLow = 1;
								break;
							case 'highsuccess':
								autoHigh = 1;
								break;
						}
						switch (jsonData[p].endClimb){
							case 'noTryPark':
								parked = 0;
								break;
							case 'parked':
								parked = 1;
								break;
							case 'atmptHook':
								climbed = .05;
								break;
							case 'atmptAttach':
								climbed = .2;
								break;
							case 'atmptCarry':
								climbed = .3;
								break;
							case 'atmptclimb':
								climbed = .1;
								break;
							case 'successAttach':
								climbed = 2;
								break;
							case 'successCarry':
								climbed = 3;
								break;
							case 'successSolo':
								climbed = 1;
								break;
						}
						var row = {
							scoutingTeam:$rootScope.userTeam,
							competition:$scope.exportCompetition.id,
							teamNum:element,
							teamName:teamName,
							allianceColor:jsonData[p].color,
							matchNum:doc.id,
							autoCross:jsonData[p].autoCross,
							autoLowCube:autoLow,
							autoHighCube:autoHigh,
							autoWrongCube:jsonData[p].autoWtong,
							teleWrongCube:jsonData[p].teleWrong,
							exchangeCubes:jsonData[p].exchangeCounter,
							oppositeSwitch:jsonData[p].opponentScaleCounter,
							highScale:jsonData[p].centerScaleCounter,
							allianceSwitch:jsonData[p].allianceScaleCounter,
							boost:jsonData[p].boost,
							force:jsonData[p].force,
							levitate:jsonData[p].levitate,
							parkedOnPlatform:parked,
							climbed:climbed,
							playedDefense:jsonData[p].defender,
							defendedAgainst:jsonData[p].defended,
							averageCubeTime:'',
							allianceMember1:'',
							allianceMember2:''
						};
						$scope.csvArray.push(row);
					};
				});
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
			$scope.exportCompetition = $scope.options[0];
		})
	}
	$scope.init();
}]);