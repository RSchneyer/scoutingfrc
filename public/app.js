var app = angular.module('scoutingfrc', ['ngMaterial', 'firebase']);

app.controller('authControl', ['$scope', '$rootScope', '$http', '$firebaseAuth', '$mdSidenav', function($scope, $rootScope, $http, $firebaseAuth, $mdSidenav){
	
	$scope.authStatus;
	var auth = $firebaseAuth();

	var db = firebase.firestore();
	var usersDB = db.collection('users')


	$scope.checkAuth = function(){
		var loggedIn = auth.$getAuth();
		if (loggedIn){
			$scope.authStatus = true;
		} else {
			$scope.authStatus = false;
		}
		console.log('checkAuth ran!');
		console.log(loggedIn);
	};
	$scope.checkAuth();


	$scope.signIn = function(){
		auth.$signInWithPopup('google').then(function(result){
			var authResult = result;
			usersDB.doc(authResult.user.uid).get().then(function(result){
				if (result.exists) {
					console.log("You Exist. Congrats.")
				} else {
					usersDB.doc(authResult.user.uid).set({
						userDisplayName: authResult.user.displayName
					})
					.then(function(){
						console.log('User created!')
					})
					.catch(function(error){
						console.log('An error occurred: ', error);
					})
				};
			})


			console.dir(result);
			$scope.userPhoto = result.user.photoURL;
			$scope.currUser = result.user.uid;
			
			$scope.authStatus = true;
		}).catch(function(error){
			console.error("Authentication failed: ", error);
		});
	};

	$scope.signOut = function(){
		auth.$signOut().then(function(){
			console.log('Signed Out!');
			$scope.authStatus = false;
		});
	};

	$scope.togglesideNav = function(){
		$mdSidenav('left').toggle();
		console.log('SideNav toggled');
		console.log($scope.userPhoto);
	};
// ////////////////////////////////////////
	// TODO: Move to appropriate Controller
	
}]);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

	// TODO: GET OUT OF THiS CONTROLLER!!!
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
	
	// TODO: GET OUT OF THiS CONTROLLER!!!
	/*
	 * loads basic event information from the variable loadTeamNumber
	 * Should be called the first time a user joins a team, thus creating the team events in the database.
	 * Also called the first time that a team has info scouted about them.
	 */
	$scope.loadTeamEventData = function(){
		var teamKey = 'frc' + $scope.loadTeamNumber;
		var info = $http.get('https://www.thebluealliance.com/api/v3/team/'+teamKey+'/events/2018?X-TBA-Auth-Key=sLym63lk04kq6G9IwWsvzNxrSl7DYNoyH09RRHfj7trmskoWE8bTrVTjQ8nByZ8Z')
		.then(function(response){
			$scope.teamDataBlock = response.data;
			for(var i = 0; i < $scope.teamDataBlock.length; i++){
				var eventVar = $scope.teamDataBlock[i];
				var teamRef = db.doc("teams/"+$scope.loadTeamNumber+"/events/"+eventVar.event_code);
				teamRef.set({
					name:eventVar.short_name
				});
				// TODO edit to also add each match and teams on which alliance for each match
				// TODO for each event, load a teams list into the db for all present teams
				var rootRef = db.doc("events/"+eventVar.event_code);
				rootRef.set({
					address:eventVar.address,
					city:eventVar.city,
					country:eventVar.country,
					short_name:eventVar.short_name,
					week:eventVar.week,
					start_date:eventVar.start_date,
					end_date:eventVar.end_date,
					event_code:eventVar.event_code
				});
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
//		var rootRef = db.doc("events/"+$scope.competition+"/matches/"+$scope.matchNum);
		var rootRef = db.doc("teams/"+$scope.teamNum+"/events/"+$scope.competition+"/matches/"+$scope.matchNum);
/*		var matchData = rootRef.get()
		.then(doc => {
			if (!doc.exists) {
				console.log('No such document!');
			} else {
				console.log('Document data:', doc.data());
			}
		})
		.catch(err => {
			console.log('Error getting document', err);
		}); 

		
		//path for red and blue alliance
		//var redRef = rootRef.collection("red");
		//var blueRef = rootRef.collection("blue");
*/
		//create the object of game data to be saved
		var scoutedData = { teleScores:$scope.teleScores, 
//							autoShot:$scope.autoShot,
							teleFlag:$scope.teleFlag,
							color:$scope.scoutedColor
							};
		rootRef.set({
			[$scope.currUser] : scoutedData,
		}, { merge: true });
/*****************************************************************		
		var redData = redRef.get()
			.then(snapshot => {
				snapshot.forEach(doc => {
				//	console.log('red ', doc.id, '=>', doc.data());
					if(doc.id == testTeamKey){
						console.log("Sending Data");
						redRef.doc(doc.id).set({
							[$scope.currUser] : scoutedData
						}, { merge: true });
					}
				});
			})
			.catch(err => {
				console.log('Error getting documents', err);
			});
		
		var blueData = blueRef.get()
			.then(snapshot => {
				snapshot.forEach(doc => {
				//	console.log('blue ', doc.id, '=>', doc.data());
					if(doc.id == testTeamKey){
						console.log("Sending Data");
						redRef.doc(doc.id).set({
							[currUser] : scoutedData
						}, { merge: true });
					}
				});
			})
			.catch(err => {
				console.log('Error getting documents', err);
			});
	// TODO catch if team not found, give option for change info(team number or match number)
	*/
	};

	// TODO: GET OUT OF THiS CONTROLLER!!!
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
			console.log('all competition value');
			var comps = rootRef.get()
			.then(snapshot => {
				snapshot.forEach(doc => {
					if (!doc.exists) {
						console.log('No such document!');
					}else{
						db.collection(path+doc.id+"/matches/").get()
						.then(snapshot => {
							snapshot.forEach(doc => {
								if (!doc.exists) {
									console.error('No such document!');
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
								};
							})
							$scope.avgTeleScores = totalTeleScores/$scope.datapoints;
//							console.log('TotalTeleScores:', totalTeleScores, '\nDatapoints:', $scope.datapoints, '\nMade auto shot:'+$scope.autoShotPercent+'%\nAverageTeleScores:', $scope.avgTeleScores);
							$scope.$apply()
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
			var matches = rootRef.get()
			.then(snapshot => {
				snapshot.forEach(doc => {
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
//						console.log('TotalTeleScores:', totalTeleScores, '\nDatapoints:', $scope.datapoints, '\nMade auto shot:'+$scope.autoShotPercent+'%\nAverageTeleScores:', $scope.avgTeleScores);
						$scope.$apply()
					};
				})
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
//					console.log('TotalTeleScores:', totalTeleScores, '\nDatapoints:', $scope.datapoints, '\nMade auto shot:'+$scope.autoShotPercent+'%\nAverageTeleScores:', $scope.avgTeleScores);
					$scope.$apply()
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
	}
}]);





//Directives ///////////////////////////////////////////////////////////////////////////////////////////////////////////
app.directive('teamInputCard', function(){
	return {
		templateUrl: 'directives/teamInputCard.html',
	}
});

app.directive('loadTeamDataCard', function() {
	return {
		templateUrl: 'directives/loadTeamDataCard.html',
	}
});

app.directive('scoutMatchCard', function(){
	return {
		templateUrl: 'directives/scoutMatchCard.html',
	}
});

app.directive('teamStatsCard', function(){
	return {
		templateUrl: 'directives/teamStatsCard.html',
	}
});

app.directive('sideNav', function(){
	return {
		templateUrl: 'directives/sideNav.html',
	}
});