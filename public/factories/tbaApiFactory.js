angular.module('scoutingfrc', []).
	factory('tbaApi', ['$http', function($http){
		var baseUrl = 'https://www.thebluealliance.com/api/v3/';
		var apiKey = '?X-TBA-Auth-Key=sLym63lk04kq6G9IwWsvzNxrSl7DYNoyH09RRHfj7trmskoWE8bTrVTjQ8nByZ8Z'
		var tbaApi = {};

		tbaApi.getTeam = function(team) {
			teamKey = 'frc' + team;
			return $http.get(baseUrl + '/team/' + teamKey + apiKey);
		};

		tbaApi.getTeamSimple = function(team){
			teamKey = 'frc' + team;
			return $http.get(baseUrl + '/team/' + teamKey + apiKey);
		};

		tbaApi.getEventTeams = function(eventKey, team){
			teamKey = 'frc' + team;
			return $http.get(baseUrl + '/event/' + eventKey + '/teams/' + teamKey + apiKey); 
		};

		tbaApi.getTeamEvents = function(team, year){
			teamKey = 'frc' + team;
			return $http.get(baseUrl + '/team/' + teamKey + '/events/' + year + apiKey);
		};


}]);