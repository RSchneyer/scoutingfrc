app.controller('inputControl', ['$scope', '$http', '$rootScope', '$mdDialog', function($scope, $http, $rootScope, $mdDialog){
    $scope.allianceScaleCounter = 0;
	$scope.centerScaleCounter = 0;
	$scope.opponentScaleCounter = 0;
	$scope.exchangeCounter = 0;
	var db = firebase.firestore();
	var usersDB = db.collection('users');

	/*
	 * loads basic team information from the Blue Alliance If team not in DataBase
	 */
	$scope.loadTeamData = function(teamNum){
		var rootRef = db.doc("teams/"+teamNum);
		rootRef.get()
		.then(doc => {
			if(!doc.exists && teamNum != null){
				console.log('loading team data to DataBase');
				var teamKey = 'frc' + teamNum;
				var info = $http.get('https://www.thebluealliance.com/api/v3/team/'+teamKey+'?X-TBA-Auth-Key=sLym63lk04kq6G9IwWsvzNxrSl7DYNoyH09RRHfj7trmskoWE8bTrVTjQ8nByZ8Z')
		//		var info = tbaApi.getTeam($scope.loadTeamNumber)
				.then(function(response){
					var jsonData = response.data;
					rootRef.set({
						city:jsonData.city,
						country:jsonData.country,
						key:jsonData.key,
						nickname:jsonData.nickname,
						state_prov:jsonData.state_prov,
						team_number:jsonData.team_number
					}, { merge: true });
				});
				console.log("Finished initializing team information!");
			}
		})
	};
	
	/*
	 * loads basic event information from the variable loadTeamNumber
	 * Should be called the first time a user joins a team, thus creating the team events in the database.
	 * Also called the first time that a team has info scouted about them.
	 */
	$scope.loadTeamEventData = function(teamNum){
		var dbCalls = function(eventVar){
			var eventTeams = $http.get('https://www.thebluealliance.com/api/v3/event/2018'+eventVar.event_code+'/teams/keys?X-TBA-Auth-Key=sLym63lk04kq6G9IwWsvzNxrSl7DYNoyH09RRHfj7trmskoWE8bTrVTjQ8nByZ8Z')
			//var eventTeams = tbaApi.getEventTeams(eventCode)
			.then(function(resp){
				console.log(resp.data);
				// TODO edit to also add each match and teams on which alliance for each match
				var rootRef = db.doc("events/"+eventVar.event_code);
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
				var teamRef = db.doc("teams/"+teamNum+"/events/"+eventVar.event_code);
				teamRef.set({
					name:eventVar.short_name
				}, { merge: true });
				console.warn(eventVar.event_code);
				//load team info for each team at the event(possible scoutable teams)
				for(var j = 0; j < resp.data.length; j++){
					$scope.loadTeamData(resp.data[j].substr(3));
				};
			});
		};

		var checkRef = db.collection("teams/"+teamNum+/events/);
		checkRef.get()
		.then(snapshot => {
			if(snapshot.docs.length > 0){
				console.log(teamNum+" has events loaded");
			}else{
				console.log("no events found, loading team events");
				var teamKey = 'frc' + teamNum;
				var info = $http.get('https://www.thebluealliance.com/api/v3/team/'+teamKey+'/events/2018?X-TBA-Auth-Key=sLym63lk04kq6G9IwWsvzNxrSl7DYNoyH09RRHfj7trmskoWE8bTrVTjQ8nByZ8Z')
				.then(function(response){
					$scope.teamDataBlock = response.data;
					for(var i = 0; i < $scope.teamDataBlock.length; i++){
						dbCalls($scope.teamDataBlock[i]);
						console.log($scope.teamDataBlock[i]);
					};
				});
			};
		});
	};
	
	$scope.pressedStartMatch = function(){
		$scope.matchStart = moment();
	}
	$scope.pressedForce = function(){
		$scope.force = moment().diff($scope.matchStart, 'seconds');
	}
	$scope.pressedBoost = function(){
		$scope.boost = moment().diff($scope.matchStart, 'seconds');
	}
	$scope.pressedLevitate = function(){
		$scope.levitate = moment().diff($scope.matchStart, 'seconds');
	}
	/*
	 * Shows Pop-Up when match is submitted
	 */
	$scope.checkSubmit = function(){
		if($scope.TeamNumber == null || $scope.competition.value == null){
			console.error('Team or Competition undefined');
		}else{
			var rootRef = db.doc("teams/"+$scope.TeamNumber+"/events/"+$scope.competition.value)
			rootRef.get()
			.then(doc => {
				if(doc.exists){
					$scope.confirmSubmit();
				}else{
					$scope.confirmTeam();
				}
			})
		}
	}
	$scope.confirmTeam = function() {
    	var confirm = $mdDialog.confirm()
        	.title('Are you sure this the right team number?')
        	.textContent('According to our records, team '+ $scope.TeamNumber + " is not attending the " + $scope.competition.name + " Regional")
          	.ariaLabel('Confirm Team')
          	.ok('I am sure')
          	.cancel('I will change that');

    	$mdDialog.show(confirm).then(function() {
			$scope.confirmSubmit();
    	}, function() {
      		$scope.autoBack();
    	});
  	};
  	$scope.confirmSubmit = function() {
    	var message = 'Are you sure you want to submit?';

    	var confirm = $mdDialog.confirm()
        	.title('Submission Confirmation')
        	//TODO make this actually interactive and look ok
			.textContent(message)
          	.ariaLabel('Confirm Submit')
          	.ok('Submit')
          	.cancel('Make a Change');

    	$mdDialog.show(confirm).then(function() {
			//ok
			$scope.putMatchData();
    	}, function() {
      		//cancel
    	});

  	};

	/*
	 * Takes data from the input fields and saves it under the username at the 
	 * appropriate path in the db for the chosen match and team info
	 */
	$scope.putMatchData = function(){
		console.log("Match data sent!");
		//location to save data
		var rootRef = db.doc("teams/"+$scope.TeamNumber+"/events/"+$scope.competition.value+"/matches/"+$scope.MatchNumber);
		//create the object of game data to be saved
		var scoutedData = {
							matchStart:$scope.matchStart.valueOf(),
							color:$scope.scoutedColor || '',
							startPos: $scope.startingPos || '',
							autoCube: $scope.CubeAutoLoca || '',
							autoWrong: $scope.autoWrongCube || false,
							autoCross: $scope.autoCross || false,
							allianceScaleCounter: $scope.allianceScaleCounter,
							centerScaleCounter: $scope.centerScaleCounter,
							opponentScaleCounter: $scope.opponentScaleCounter,
							exchangeCounter: $scope.exchangeCounter,
							force:$scope.force || -1,
							boost:$scope.boost || -1,
							levitate:$scope.levitate || -1,
							teleWrong: $scope.teleWrongCube || false,
							endClimb: $scope.endClimb || '',
							climbLoca: $scope.climbLoca || '',
							defender: $scope.defender || false,
							defended: $scope.defended || false,
							teamScouting: $rootScope.userTeam || 0,
							timestamp: firebase.firestore.FieldValue.serverTimestamp()
							};
		console.log(scoutedData);
		rootRef.set({
			[$rootScope.user.uid] : scoutedData,
		}, { merge: true })
		.then(function(){
			$scope.clearFields();
			$scope.autoBack();
		});
	};

	$scope.scoutableComps = [];
	$scope.competitionOptions = function(){
		var Comps = [{name:"Test Event", value:"00aaTest"}];
		if($rootScope.userTeam != 0){
			var rootRef = db.collection("teams/"+$rootScope.userTeam+"/events/");
		}else{
			var rootRef = db.collection("events/");
		}
		var teamComps = rootRef.get()
		.then(snapshot => {
			snapshot.forEach(doc => {
				docData = doc.data();
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
			$scope.competition = $scope.scoutableComps[0];
			$scope.$apply();
		})
	};

	//  This will be triggered when the userTeam is changed
	$scope.$watch(function() {
  		return $rootScope.userTeam;
	}, function() {
  		$scope.competitionOptions();
  		//If new user, gather team and event information
  		if($rootScope.teamChange){
  			console.log('team Changed');
  			$scope.loadTeamData($rootScope.userTeam);
	  		$scope.loadTeamEventData($rootScope.userTeam);
			$rootScope.teamChange = false;
		}	
	}, true);
	
	/*
	 * Takes data from the input fields displays the appropriate average
	 */
	$scope.calculateAverage = function(){
		var jsonData;
		//all season
		if($scope.statTeamCompetition.value == 'all' || $scope.statTeamCompetition == null){
			var rootRef = db.doc("teams/"+$scope.teamStatNum);
		//all competition
		}else if($scope.statMatchNum.value == 'all' || $scope.statMatchNums == null){
			var rootRef = db.doc("teams/"+$scope.teamStatNum+"/averages/"+$scope.statTeamCompetition.value);
		//one match
		}else{
			var rootRef = db.doc("teams/"+$scope.teamStatNum+"/events/"+$scope.statTeamCompetition.value+"/averages/"+$scope.statMatchNum.value);
		};
		var data = rootRef.get()
		.then(doc => {
			jsonData = doc.data();
			$scope.autoCrossPercent = jsonData.autoCross;
			$scope.avgTeleBlocks = (jsonData.centerScaleCounter + jsonData.exchangeCounter + jsonData.opponentScaleCounter + jsonData.allianceScaleCounter);
			$scope.datapoints = jsonData.datapoints;
			$scope.$apply();
		})
		.catch(err => {
			console.log(rootRef);
			console.log('Error getting document', err);
		});
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
			$scope.generateStatTable();
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
		});
		$scope.generateStatTable();
	};
	
	$scope.checkDB4Data = function(){
		var found = false;
		var rootRef = db.doc("teams/"+$scope.TeamNumber+"/events/"+$scope.competition.value+"/matches/"+$scope.MatchNumber);
		console.log('Checking DB for your past entry');
		rootRef.get()
		.then(doc => {
			if(doc.exists){
				var uid = $rootScope.user.uid;
				var userData;
				var jsonData = doc.data();
				for(p in jsonData){
					if(p == uid){
						found = true;
						//not a good fix
						$scope.pressedStartMatch();
						//
						userData = jsonData[p];
						if($scope.scoutedColor == null){
							$scope.scoutedColor = userData.color;
						}
						if($scope.startingPos == null){
							$scope.startingPos = userData.startPos;
						}
						$scope.CubeAutoLoca = userData.autoCube;
						$scope.autoWrongCube = userData.autoWrong;
						$scope.autoCross = userData.autoCross;
						$scope.allianceScaleCounter = userData.allianceScaleCounter;
						$scope.centerScaleCounter = userData.centerScaleCounter;
						$scope.opponentScaleCounter = userData.opponentScaleCounter;
						$scope.exchangeCounter = userData.exchangeCounter;
						$scope.force = userData.force;
						$scope.boost = userData.boost;
						$scope.levitate = userData.levitate;
						$scope.teleWrongCube = userData.teleWrong;
						$scope.endClimb = userData.endClimb;
						$scope.climbLoca = userData.climbLoca;
						$scope.defender = userData.defender;
						$scope.defended = userData.defended;
						$scope.$apply();
					}
				}
			}
			if(found == false){
				$scope.clearFields();
			}
			found = false;
		});
		$scope.preNext();
	}
	$scope.clearFields = function(){
		$scope.startingPos = null;
		$scope.CubeAutoLoca = null;
		$scope.autoWrongCube = false;
		$scope.autoCross = false;
		$scope.allianceScaleCounter = 0;
		$scope.centerScaleCounter = 0;
		$scope.opponentScaleCounter = 0;
		$scope.exchangeCounter = 0;
		$scope.force = -1;
		$scope.boost = -1;
		$scope.levitate = -1;
		$scope.teleWrongCube = false;
		$scope.endClimb = null;
		$scope.climbLoca = null;
		$scope.defender = false;
		$scope.defended = false;
		$scope.$apply();
	}
	$scope.preShow = true;
	$scope.autoShow = false;
	$scope.teleShow = false;
	$scope.endShow = false;
	$scope.autoBack = function(){
		$scope.preShow = true;
		$scope.autoShow = false;
		$scope.teleShow = false;
		$scope.endShow = false;
	}
	$scope.preNext = function(){
		$scope.preShow = false;
		$scope.autoShow = true;
		$scope.teleShow = false;
		$scope.endShow = false;
	};
	$scope.autoNext = function(){
		$scope.autoShow = false;
		$scope.teleShow = true;
		$scope.preShow = false;
		$scope.endShow = false;
	};
	$scope.teleNext = function(){
		$scope.teleShow = false;
		$scope.endShow = true;
		$scope.preShow = false;
		$scope.autoShow = false;
	};

	$scope.rows = [];
	$scope.generateStatTable = function(){
		$scope.rows = [];

		var checkThroughEvent = function(event){
			var rootRef = db.collection('/teams/'+$scope.teamStatNum+'/events/'+event+'/averages/');//+compID+'/matches');
			var matches = rootRef.get()
			.then(snapshot2 => {
				snapshot2.forEach(doc2 => {
					data = doc2.data();
					console.log(data);
					var climb;
					var row = {
						match: doc2.id,
						autoCross: (data.autoCross + '%'),
						autoPosition: data.startPos,
						opponent: data.opponentScaleCounter,
						center: data.centerScaleCounter,
						alliance: data.allianceScaleCounter,
						exchange: data.exchangeCounter,
						climb: (data.endClimb + '%')
					}
					$scope.rows.push(row);
				});
				console.log($scope.rows);
				$scope.$apply();
			});
		};

		if($scope.statTeamCompetition.value!='all'){
			checkThroughEvent($scope.statTeamCompetition.value);
		}else{
			var teamRef = db.collection('/teams/'+$scope.teamStatNum+'/averages/');
			var teamInfo = teamRef.get()
			.then(snapshot => {
				snapshot.forEach(doc => {
					checkThroughEvent(doc.id);
				});
			});
		}
		
	}
//test stuff, not real important to keep
	$scope.numberOfUsers = function(){
		var rootRef = db.collection("/users/");
		var number = rootRef.get()
		.then(snapshot => {
			console.log('Users: '+snapshot.size);
			$rootScope.numberUsers = snapshot.size;
		})
	};
	$scope.numberOfEvents = function(){
		var rootRef = db.collection("/events/");
		var number = rootRef.get()
		.then(snapshot => {
			console.log('Events: '+snapshot.size);
			$rootScope.numberEvents = snapshot.size;
		})
	};
	$scope.numberOfTeams = function(){
		var rootRef = db.collection("/teams/");
		var number = rootRef.get()
		.then(snapshot => {
			console.log('Teams: '+snapshot.size);
			$rootScope.numberTeams = snapshot.size;
		})
	};
	$scope.numberOfEvents();
	$scope.numberOfTeams();
	$scope.numberOfUsers();
//*****************************************
}]);
