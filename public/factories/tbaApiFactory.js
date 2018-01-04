angular.module('scoutingfrc', []).
	factory('tbaApi', ['$http', function($http){
		var baseUrl = 'https://www.thebluealliance.com/api/v3/';
		var tbaApi = {};

		tbaApi.getTeam = function(team) {
			teamKey = 'frc' + team;
			return $http.get(baseUrl + '/team/' + teamKey);
		};

		tbaApi.getTeamSimple = function(team){
			teamKey = 'frc' + team;
			return $http.get(baseUrl + '/team/' + teamKey);
		};

		tbaApi.getEventTeams = function(eventKey, team){
			teamKey = 'frc' + team;
			return $http.get(baseUrl + '/event/' + eventKey + '/teams/' + teamKey); 
		};

		tbaApi.getTeamEvents = function(team, year){
			teamKey = 'frc' + team;
			return $http.get(baseUrl + '/team/' + teamKey + '/events/' + year);
		};


	}]);