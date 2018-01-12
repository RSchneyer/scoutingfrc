app.controller('inputControl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope){
//app.controller('inputControl', ['$scope', '$http', 'tbaApi', function($scope, tbaApi, $http){
    $scope.quantity1 = 0;
	$scope.quantity2 = 0;
	$scope.quantity3 = 0;
	var db = firebase.firestore();
	var usersDB = db.collection('users');

	$scope.getTeamData = function(){
		var team = 'frc' + $scope.frcTeam;
		var info = $http.get('https://www.thebluealliance.com/api/v3/team/'+team+'/simple?X-TBA-Auth-Key=sLym63lk04kq6G9IwWsvzNxrSl7DYNoyH09RRHfj7trmskoWE8bTrVTjQ8nByZ8Z')
//		var info = tbaApi.getTeamSimple($scope.frcTeam)
		.then(function(response){
			$scope.teamData = response.data;
		});
	};

	/*
	 * loads basic team information from the variable loadTeamNumber
	 * Should be called the first time a user joins a team, thus creating the team in the database.
	 * Also called the first time that a team has info scouted about them.
	 */
	$scope.loadTeamData = function(){
		var teamKey = 'frc' + $scope.loadTeamNumber;
		var info = $http.get('https://www.thebluealliance.com/api/v3/team/'+teamKey+'?X-TBA-Auth-Key=sLym63lk04kq6G9IwWsvzNxrSl7DYNoyH09RRHfj7trmskoWE8bTrVTjQ8nByZ8Z')
//		var info = tbaApi.getTeam($scope.loadTeamNumber)
		.then(function(response){
			$scope.teamDataBlock = response.data;
			var rootRef = db.doc("teams/"+$scope.loadTeamNumber);
			rootRef.set({
				city:$scope.teamDataBlock.city,
				country:$scope.teamDataBlock.country,
				key:$scope.teamDataBlock.key,
				nickname:$scope.teamDataBlock.nickname,
				state_prov:$scope.teamDataBlock.state_prov,
				team_number:$scope.teamDataBlock.team_number
			});
		});
		$scope.loadTeamEventData();
		console.log("Finished initializing team information!");
	};
	
	/*
	 * loads basic event information from the variable loadTeamNumber
	 * Should be called the first time a user joins a team, thus creating the team events in the database.
	 * Also called the first time that a team has info scouted about them.
	 */
	$scope.loadTeamEventData = function(){
		var dbCalls = function(eventVar){
			console.log(eventVar.event_code);
//			var eventCode = '2018'+eventVar.event_code;
			var eventTeams = $http.get('https://www.thebluealliance.com/api/v3/event/2018'+eventVar.event_code+'/teams/keys?X-TBA-Auth-Key=sLym63lk04kq6G9IwWsvzNxrSl7DYNoyH09RRHfj7trmskoWE8bTrVTjQ8nByZ8Z')
//			var eventTeams = tbaApi.getEventTeams(eventCode)
			.then(function(resp){
				console.warn(resp.data);
				// TODO edit to also add each match and teams on which alliance for each match
				var rootRef = db.doc("events/"+eventVar.event_code);
				console.log("events/"+eventVar.event_code);
				rootRef.set({
					address:eventVar.address,
					city:eventVar.city,
					country:eventVar.country,
					short_name:eventVar.short_name,
					week:eventVar.week,
					start_date:eventVar.start_date,
					end_date:eventVar.end_date,
					event_code:eventVar.event_code,
					teams:resp.data
				}, { merge: true });
				var teamRef = db.doc("teams/"+$scope.loadTeamNumber+"/events/"+eventVar.event_code);
				teamRef.set({
					name:eventVar.short_name
				});
			});
		};
		var teamKey = 'frc' + $scope.loadTeamNumber;
		var info = $http.get('https://www.thebluealliance.com/api/v3/team/'+teamKey+'/events/2018?X-TBA-Auth-Key=sLym63lk04kq6G9IwWsvzNxrSl7DYNoyH09RRHfj7trmskoWE8bTrVTjQ8nByZ8Z')
//		var info = tbaApi.getTeamEvents($scope.loadTeamNumber, 2018)
		.then(function(response){
			$scope.teamDataBlock = response.data;
			for(var i = 0; i < $scope.teamDataBlock.length; i++){
				dbCalls($scope.teamDataBlock[i]);
			}
		});
	};
	
	/*
	 * Takes data from the input fields and saves it under the username at the 
	 * appropriate path in the db for the chosen match and team info
	 */
	$scope.putMatchData = function(){
		console.log("Match data sent!");
		//location to save data
		var rootRef = db.doc("teams/"+$scope.teamNum+"/events/"+$scope.competition.value+"/matches/"+$scope.matchNum);
		//create the object of game data to be saved
		var scoutedData = { teleScores:$scope.teleScores, 
							autoShot:$scope.autoShot,
							teleFlag:$scope.teleFlag,
							color:$scope.scoutedColor,
							timestamp: firebase.firestore.FieldValue.serverTimestamp()
							};
		rootRef.set({
			[$rootScope.user.uid] : scoutedData,
		}, { merge: true });
	// TODO catch if team not found, give option for change info(team number or match number)
	};

	$scope.scoutableComps = [];
	$scope.competitionOptions = function(){
		var Comps = [];
		//Can only choose loaded events
		//TODO - choose only events that the user's team is attending
//		console.log('compOptions run!');
		if($rootScope.userTeam != 0){
			var rootRef = db.collection("teams/"+$rootScope.userTeam+"/events/");
		}else{
			var rootRef = db.collection("events/");
		}
		var teamComps = rootRef.get()
		.then(snapshot => {
			snapshot.forEach(doc => {
				docData = doc.data();
//				console.log(docData);
				var element = {};
				if(docData.name != null){
					element.name = docData.name;
				}else{
					element.name = docData.short_name;
				}
				element.value = doc.id;
				Comps.push(element);
			});
			$scope.scoutableComps = Comps;
			$scope.$apply();
//			console.log($scope.scoutableComps);
		})
	};

//  This will be triggered when the userTeam is changed
	$scope.$watch(function() {
  		return $rootScope.userTeam;
	}, function() {
//  		console.log('Watch saw change');
  		$scope.competitionOptions();
	}, true);
	
	/*
	 * Takes data from the input fields displays the appropriate average
	 */
	$scope.calculateAverage = function(){
		var jsonData;
		//all season
		if($scope.statTeamCompetition.value == 'all' || $scope.statTeamCompetition == null){
			var rootRef = db.doc("teams/"+$scope.teamStatNum);
			var data = rootRef.get()
			.then(doc => {
				jsonData = doc.data().seasonAverage;
				$scope.autoShotPercent = jsonData.autoShotPercent;
				$scope.avgTeleScores = jsonData.avgTeleScores;
				$scope.datapoints = jsonData.datapoints;
				$scope.$apply();
			})
			.catch(err => {
				console.log('Error getting document', err);
			});
		//all competition
		}else if($scope.statMatchNum.value == 'all' || $scope.statMatchNums == null){
			var rootRef = db.doc("teams/"+$scope.teamStatNum+"/averages/"+$scope.statTeamCompetition.value);
			var data = rootRef.get()
			.then(doc => {
				jsonData = doc.data();
				$scope.autoShotPercent = jsonData.autoShotPercent;
				$scope.avgTeleScores = jsonData.avgTeleScores;
				$scope.datapoints = jsonData.datapoints;
				$scope.$apply();
			})
			.catch(err => {
				console.log('Error getting document', err);
			});
		//one match
		}else{
			var rootRef = db.doc("teams/"+$scope.teamStatNum+"/events/"+$scope.statTeamCompetition.value+"/averages/"+$scope.statMatchNum.value);
			var data = rootRef.get()
			.then(doc => {
				jsonData = doc.data();
				$scope.autoShotPercent = jsonData.autoShotPercent;
				$scope.avgTeleScores = jsonData.avgTeleScores;
				$scope.datapoints = jsonData.datapoints;
				$scope.$apply();
			})
			.catch(err => {
				console.log('Error getting document', err);
			});
		};
	};
	$scope.statTeamCompetition = {name:'All Seasons', value:'all'};
	$scope.statMatchNum = {number:'All Matches', value:'all'};
	$scope.teamStatNumChange = function(){
		var rootRef = db.collection("teams/"+$scope.teamStatNum+"/events/");
		var competitions = [{name:'All Events', value:'all'}];
		var teamComps = rootRef.get()
		.then(snapshot => {
			snapshot.forEach(doc => {
				docData = doc.data();
				var element = {};
				element.name = docData.name;
				element.value = doc.id;
				competitions.push(element);
			})
			$scope.statTeamComps = competitions;
			$scope.statTeamCompetition = $scope.statTeamComps[0];
			$scope.calculateAverage();
		})
	};
	$scope.statTeamCompetitionChange = function(){
		var rootRef = db.collection("teams/"+$scope.teamStatNum+"/events/"+$scope.statTeamCompetition.value+"/matches/");
		var competitions = [{number:'All Matches', value:'all'}];
		var teamComps = rootRef.get()
		.then(snapshot => {
			snapshot.forEach(doc => {
				docData = doc.data();
				var element = {};
				element.number = doc.id;
				element.value = doc.id;
				competitions.push(element);
			})
			$scope.statMatchNums = competitions;
			$scope.statMatchNum = $scope.statMatchNums[0];
			$scope.calculateAverage();
		})
	};
}]);