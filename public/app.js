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
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// TODO: Move to appropriate Controller
	
}]);

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
			console.log(rootRef);
			console.log($scope.teamDataBlock);
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
			console.log($scope.teamDataBlock);
			for(var i = 0; i < $scope.teamDataBlock.length; i++){
				var eventVar = $scope.teamDataBlock[i];
				console.log(eventVar);
				console.log(eventVar.event_code);
				var teamRef = db.doc("teams/"+$scope.loadTeamNumber+"/events/"+eventVar.event_code);

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
		//not needed?
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
 */
		
		//path for red and blue alliance
//		var redRef = rootRef.collection("red");
//		var blueRef = rootRef.collection("blue");
		
		//create the object of game data to be saved
		var scoutedData = { teleScores:$scope.teleScores, 
							autoShot:$scope.autoShot,
							teleFlag:$scope.teleFlag};
		
// TODO this test team will not be needed, just use the team number	
		console.log('scouted data => '+ scoutedData);
//		var testTeamKey = '000' + $scope.teamNum + 'Test';
//		console.log('testTeamKey => '+ testTeamKey);

		rootRef.set({
			[$scope.currUser] : scoutedData,
			color : $scope.scoutedColor
		}, { merge: true });
/*****************************************************************		
		var redData = redRef.get()
			.then(snapshot => {
				snapshot.forEach(doc => {
//					console.log('red ', doc.id, '=>', doc.data());
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
//					console.log('blue ', doc.id, '=>', doc.data());
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
	
	$scope.calculateAverage = function(){
		var datapoints = 0;
		var totalTeleScores = 0;
		var trueAutoShot = 0;
		var falseAutoShot = 0;
		var autoShot = false;
		var autoShotPercent = 0;
		var jsonData;

		if($scope.statMatchNum == 'all'){
			var path = "teams/"+$scope.teamStatNum+"/events/"+$scope.statTeamCompetition+"/matches/";
			var rootRef = db.collection(path);
			console.log('all value');
			console.log(path);
			var matches = rootRef.get()
			.then(doc => {
				if (!doc.exists) {
					console.log('No such document!');
				} else {
				//	console.log('Document data:', doc.data());
					jsonData = doc.data();
					console.log(jsonData);
					for(var p in jsonData){
					//	console.log(p, ' ', jsonData[p]);
					//	console.log(jsonData[p].teleScores);
						if(jsonData[p].autoShot){
							trueAutoShot++;
						}else{
							falseAutoShot++;
						}
						totalTeleScores += jsonData[p].teleScores;
						datapoints ++;
					}
					autoShotPercent = (falseAutoShot/datapoints)*100;
					
					if(trueAutoShot > falseAutoShot){
						autoShot = true;
						autoShotPercent = (trueAutoShot/datapoints)*100;
					}
					console.log('TotalTeleScores:', totalTeleScores);
					console.log('Datapoints:', datapoints);
					console.log('Made auto shot:'+autoShot+' '+autoShotPercent+'%');
					console.log('AverageTeleScores:', totalTeleScores/datapoints);
				}
			})
			.catch(err => {
				console.log('Error getting document', err);
			});
		}else{
			var rootRef = db.doc("teams/"+$scope.teamStatNum+"/events/"+$scope.statTeamCompetition+"/matches/"+$scope.matchNum);
		};
		
		var rootRef = db.doc("teams/"+$scope.teamStatNum+"/events/"+$scope.statTeamCompetition+"/matches/"+$scope.matchNum);
//		var rootRef = db.doc("events/"+$scope.competition+"/matches/"+$scope.matchNum+"/red/0001Test/");
				
		var matchData = rootRef.get()
		.then(doc => {
			if (!doc.exists) {
				console.log('No such document!');
			} else {
			//	console.log('Document data:', doc.data());
				jsonData = doc.data();
				console.log(jsonData);
				for(var p in jsonData){
				//	console.log(p, ' ', jsonData[p]);
				//	console.log(jsonData[p].teleScores);
					if(jsonData[p].autoShot){
						trueAutoShot++;
					}else{
						falseAutoShot++;
					}
					totalTeleScores += jsonData[p].teleScores;
					datapoints ++;
				}
				autoShotPercent = (falseAutoShot/datapoints)*100;
				
				if(trueAutoShot > falseAutoShot){
					autoShot = true;
					autoShotPercent = (trueAutoShot/datapoints)*100;
				}
				console.log('TotalTeleScores:', totalTeleScores);
				console.log('Datapoints:', datapoints);
				console.log('Made auto shot:'+autoShot+' '+autoShotPercent+'%');
				console.log('AverageTeleScores:', totalTeleScores/datapoints);
			}
		})
		.catch(err => {
			console.log('Error getting document', err);
		});
	};
	
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