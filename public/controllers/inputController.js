app.controller('inputControl', ['$scope', '$http', function($scope, $http){

	var db = firebase.firestore();
	var usersDB = db.collection('users')

	$scope.getTeamData = function(){
		var team = 'frc' + $scope.frcTeam;
		var info = $http.get('https://www.thebluealliance.com/api/v3/team/'+team+'/simple?X-TBA-Auth-Key=sLym63lk04kq6G9IwWsvzNxrSl7DYNoyH09RRHfj7trmskoWE8bTrVTjQ8nByZ8Z')
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
			var eventTeams = $http.get('https://www.thebluealliance.com/api/v3/event/2018'+eventVar.event_code+'/teams/keys?X-TBA-Auth-Key=sLym63lk04kq6G9IwWsvzNxrSl7DYNoyH09RRHfj7trmskoWE8bTrVTjQ8nByZ8Z')
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
		.then(function(response){
			$scope.teamDataBlock = response.data;
			for(var i = 0; i < $scope.teamDataBlock.length; i++){
				dbCalls($scope.teamDataBlock[i]);
			}
		});
	};
	
	// TODO: GET OUT OF THiS CONTROLLER!!!
	/*
	 * Takes data from the input fields and saves it under the username at the 
	 * appropriate path in the db for the chosen match and team info
	 */
	$scope.putMatchData = function(){
		//location to save data
		var rootRef = db.doc("teams/"+$scope.teamNum+"/events/"+$scope.competition+"/matches/"+$scope.matchNum);

		//create the object of game data to be saved
		var scoutedData = { teleScores:$scope.teleScores, 
							autoShot:$scope.autoShot,
							teleFlag:$scope.teleFlag,
							color:$scope.scoutedColor
							};
		rootRef.set({
			[$scope.currUser] : scoutedData,
		}, { merge: true });
	// TODO catch if team not found, give option for change info(team number or match number)
	};
	//TODO move into cloud function?
	/*
	 * Takes data from the input fields and calculates averages from the data set
	 */
	$scope.calculateAverage = function(){
		$scope.datapoints = 0;
		var totalTeleScores = 0;
		var trueAutoShot = 0;
		$scope.autoShotPercent = 0;
		$scope.avgTeleScores = 0;
		var jsonData;

		if($scope.statTeamCompetition.value == 'all' || $scope.statTeamCompetition == null){
			var path = "teams/"+$scope.teamStatNum+"/events/";
			var rootRef = db.collection(path);
			var numEvents = 0;
			var comps = rootRef.get()
			.then(snapshot => {
				//for each event
				snapshot.forEach(doc => {
					if (!doc.exists) {
						console.log('No such document!');
					}else{
						console.log('Event: '+doc.id);
						var numMatches = 0;
						var autoShotEvent = 0.0;
						var teleScoreEvent = 0.0;
						db.collection(path+doc.id+"/matches/").get()
						.then(snapshot => {
							//for each match
							snapshot.forEach(doc => {
								if (!doc.exists) {
									console.error('No such document!');
								} else {
									var autoShotMatch = 0;
									var teleScoreMatch = 0.0;
									var entriesMatch = 0.0;
									jsonData = doc.data();
									//for each scouting entry
									for(var p in jsonData){
										if(jsonData[p].autoShot){
											autoShotMatch++;
										}
										teleScoreMatch += jsonData[p].teleScores;
										entriesMatch++;
										$scope.datapoints++;
									}
									numMatches++;
									autoShotEvent+=autoShotMatch/entriesMatch;
									teleScoreEvent+=teleScoreMatch/entriesMatch;
								};
							})
							numEvents++;
							trueAutoShot+=autoShotEvent/numMatches;
							totalTeleScores+=teleScoreEvent/numMatches;
							$scope.autoShotPercent = (trueAutoShot/numEvents)*100;
							$scope.avgTeleScores = totalTeleScores/numEvents;
							$scope.$apply();
						})
					}
				})
			})
			.catch(err => {
				console.log('Error getting document', err);
			});
		}else if($scope.statMatchNum.value == 'all' || $scope.statMatchNums == null){
			var path = "teams/"+$scope.teamStatNum+"/events/"+$scope.statTeamCompetition.value+"/matches/";
			var rootRef = db.collection(path);
			var numMatches = 0;
			var matches = rootRef.get()
			.then(snapshot => {
				//for each match
				snapshot.forEach(doc => {
					if (!doc.exists) {
						console.log('No such document!');
					} else {
						var autoShot = 0;
						var teleScore = 0;
						var entries = 0;
						jsonData = doc.data();
						//for each scouting entry
						for(var p in jsonData){
							if(jsonData[p].autoShot){
								autoShot++;
							}
							teleScore += jsonData[p].teleScores;
							entries++;
							$scope.datapoints++;
						}
						numMatches++;
						trueAutoShot+=autoShot/entries;
						totalTeleScores+=teleScore/entries;
					};
				})
				$scope.autoShotPercent = (trueAutoShot/numMatches)*100;
				$scope.avgTeleScores = totalTeleScores/numMatches;
				$scope.$apply();
			})
			.catch(err => {
				console.log('Error getting document', err);
			});
		}else{
			var rootRef = db.doc("teams/"+$scope.teamStatNum+"/events/"+$scope.statTeamCompetition.value+"/matches/"+$scope.statMatchNum.value);
			var matchData = rootRef.get()
			.then(doc => {
				if (!doc.exists) {
					console.log('No such document!');
				} else {
					jsonData = doc.data();
					for(var p in jsonData){
						if(jsonData[p].autoShot){
							trueAutoShot++;
						}
						totalTeleScores += jsonData[p].teleScores;
						$scope.datapoints ++;
					}
					$scope.autoShotPercent = (trueAutoShot/$scope.datapoints)*100;
					$scope.avgTeleScores = totalTeleScores/$scope.datapoints;
					$scope.$apply();
				}
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