var app = angular.module('scoutingfrc', ['ngMaterial', 'firebase', 'ngSanitize', 'ngCsv', 'ngRoute']);

app.run(function($rootScope, $location, $mdDialog){
	$rootScope.loggedIn = false;
	$rootScope.newUser = false;
	var db = firebase.firestore();

	firebase.auth().onAuthStateChanged(function(user){
		console.log('Auth State Changed');
		if (user) {
			var userDoc = db.collection('users').doc(user.uid);
			//If document with user's uid exists in users collection, otherwise create uid named document and ask for team affiliation
			var userCheck = userDoc.get()
			.then(doc => {
				if(doc.exists){
					//User already exists, log in as usual
					console.log('User exists in Firestore');
					console.log('userTeam: '+doc.data().team);
					$rootScope.userTeam = doc.data().team;
					if(doc.data().team == null){
						$rootScope.showPrompt();
					}
				}else{
					$rootScope.showPrompt();
					//Set flag to display team register directive
					$rootScope.$apply(function(){
						$rootScope.newUser = true;
					});
				}
				//Set $scope variables
				$rootScope.$apply(function(){
					$rootScope.user = user;
					$rootScope.loggedIn = true;
					$location.path('/dashboard'); //Direct user to scoutingfrc.com/dashboard if user is logged in
				});
			});
		}
		else {
			console.log('error: no user logged in');
		}
	});

	$rootScope.signIn = function(){
		var provider = new firebase.auth.GoogleAuthProvider();

		firebase.auth().signInWithPopup(provider).then(function(result){
			$rootScope.$apply(function(){
				$rootScope.user = result.user;
				$rootScope.loggedIn = true;
			});
		});
	};

	$rootScope.signOut = function(){
		firebase.auth().signOut().then(function(){
			$rootScope.$apply(function(){
				$rootScope.user = {};
				$rootScope.loggedIn = false;
				$location.path('/');
			});
		});
	};

	$rootScope.showPrompt = function() {
    // Appending dialog to document.body to cover sidenav in docs app
    	var confirm = $mdDialog.prompt()
		.title('What team are you apart of?')	
      	.textContent('Put zero if you are unaffiliated')
      	.placeholder('Team #')
      	.ariaLabel('Team #')
      	.initialValue($rootScope.userTeam ||'0')
      	.required(true)
	    .ok('Lets Go!')
	    .cancel('I\'d rather not be affiliated with a team');

		$mdDialog.show(confirm).then(function(result) {
	    	var ref = db.collection('users').doc($rootScope.user.uid);
	    	ref.set({
				team : result
			}, { merge: true });
			$rootScope.userTeam = result;
			$rootScope.teamChange = true;
	    }, function() {
	    	var ref = db.collection('users').doc($rootScope.user.uid);
	    	ref.set({
				team : 0
			}, { merge: true });
			$rootScope.userTeam = 0;
			$rootScope.teamChange = true;
    	});
	};

	$rootScope.$on('$routeChangeStart', function (event) {
        if (!$rootScope.loggedIn) {
            console.log('DENY: No user logged In');
            $location.path('/');
        }
        else {
        	//User logged in
        }
    });
});
	
// Angular Routing /////////////////////////////
app.config(function($routeProvider, $locationProvider){
	$routeProvider
	.when('/', {
		templateUrl: 'views/register.html',
	})
	.when('/dashboard', {
		templateUrl: 'views/dashboard.html'
	})
	.when('/matches', {
		templateUrl:'views/matches.html'
	})
	.when('/download', {
		templateUrl:'views/download.html'
	})
	.when('/about', {
		templateUrl: 'views/about.html'
	});
	$locationProvider.html5Mode(true);
});


// Directives ///////////////////////////////////////////////////////////////////////////////////////////////////////////
app.directive('teamInputCard', function(){
	return {
		templateUrl: 'directives/teamInputCard.html',
		controller: 'inputControl'
	};
});

app.directive('loadTeamDataCard', function() {
	return {
		templateUrl: 'directives/loadTeamDataCard.html',
		controller: 'inputControl'
	};
});

app.directive('scoutMatchCard', function(){
	return {
		templateUrl: 'directives/scoutMatchCard.html',
		controller: 'inputControl'
	};
});

app.directive('teamStatsCard', function(){
	return {
		templateUrl: 'directives/teamStatsCard.html',
		controller: 'inputControl'
	};
});

app.directive('sideNav', function(){
	return {
		templateUrl: 'directives/sideNav.html',
		controller: 'navControl'
	};
});

app.directive('exportCSVCard', function(){
	return {
		templateUrl: 'directives/exportCSVCard.html',
		controller: 'outputControl'
	};
});

app.directive('signInCard', function(){
	return {
		templateUrl: 'directives/signInCard.html',
	};
});
app.directive('preMatchCard', function(){
	return {
		templateUrl: 'directives/preMatchCard.html',
		controller: 'inputControl'
	};
});
app.directive('autoCard', function(){
	return {
		templateUrl: 'directives/autoCard.html',
		controller: 'inputControl'
	};
});
app.directive('endGame', function(){
	return {
		templateUrl: 'directives/endGame.html',
		controller: 'inputControl'
	};
});
app.directive('teleop', function(){
	return {
		templateUrl: 'directives/teleop.html',
		controller: 'inputControl'
	};
});
app.directive('counter', function() {
    return {
        restrict: 'A',
        scope: { value: '=value' },
        template: '<a href="javascript:;" class="counter-minus" ng-click="minus()">-</a><input type="text" class="counter-field" ng-model="value" ng-change="changed()" ng-readonly="readonly">\
                  <a  href="javascript:;" class="counter-plus" ng-click="plus()">+</a>',
        link: function( scope , element , attributes ) {
            // Make sure the value attribute is not missing.
            if ( angular.isUndefined(scope.value) ) {
                throw "Missing the value attribute on the counter directive.";
            }
            
            var min = angular.isUndefined(attributes.min) ? null : parseInt(attributes.min);
            var max = angular.isUndefined(attributes.max) ? null : parseInt(attributes.max);
            var step = angular.isUndefined(attributes.step) ? 1 : parseInt(attributes.step);
            
            element.addClass('counter-container');
            
            // If the 'editable' attribute is set, we will make the field editable.
            scope.readonly = angular.isUndefined(attributes.editable) ? true : false;
            
            /**
             * Sets the value as an integer.
             */
            var setValue = function( val ) {
                scope.value = parseInt( val );
            };
            // Set the value initially, as an integer.
            setValue( scope.value );
            
            /**
             * Decrement the value and make sure we stay within the limits, if defined.
             */
            scope.minus = function() {
                if ( min && (scope.value <= min || scope.value - step <= min) || min === 0 && scope.value < 1 ) {
                    setValue( min );
                    return false;
                }
                setValue( scope.value - step );
            };
            
            /**
             * Increment the value and make sure we stay within the limits, if defined.
             */
            scope.plus = function() {
                if ( max && (scope.value >= max || scope.value + step >= max) ) {
                    setValue( max );
                    return false;
                }
                setValue( scope.value + step );
            };
            
            /**
             * This is only triggered when the field is manually edited by the user.
             * Where we can perform some validation and make sure that they enter the
             * correct values from within the restrictions.
             */
            scope.changed = function() {
                // If the user decides to delete the number, we will set it to 0.
                if ( !scope.value ) setValue( 0 );
                
                // Check if what's typed is numeric or if it has any letters.
                if ( /[0-9]/.test(scope.value) ) {
                    setValue( scope.value );
                }
                else {
                    setValue( scope.min );
                }
                
                // If a minimum is set, let's make sure we're within the limit.
                if ( min && (scope.value <= min || scope.value - step <= min) ) {
                    setValue( min );
                    return false;
                }
                
                // If a maximum is set, let's make sure we're within the limit.
                if ( max && (scope.value >= max || scope.value + step >= max) ) {
                    setValue( max );
                    return false;
                }
                
                // Re-set the value as an integer.
                setValue( scope.value );
            };
        }
    };
});