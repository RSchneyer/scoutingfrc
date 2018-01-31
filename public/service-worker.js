if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('./service-worker.js').then(function(registration){
		console.log(registration);
		console.log(registration.scope);
	}).catch(function(error){
		console.log(error);
	});
} else {
	console.log('Service Worker is not supported in this browser.');
}

const offlineFiles = [
	'/',
	'index.html',
	'scouting.css',
	'manifest.json',
	'databasefavicon.png',
	'/views/matches.html',
	'/views/dashboard.html',
	'/directives/autoCard.html',
	'/directives/endGame.html',
	'/directives/loadTeamDataCard.html',
	'/directives/preMatchCard.html',
	'/directives/scoutMatchCard.html',
	'/directives/sideNav.html',
	'/directives/teamInputCard.html',
	'/directives/teamStatsCard.html',
	'/directives/teleop.html',
	'/controllers/inputController.js',
	'/controllers/navController.js',
	'/controllers/outputController.js',
];


self.addEventListener('install', function(event){
	console.log(event);
	event.waitUntil(
		caches.open('v1').then(function(cache){
			cache.add("https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.5/angular.min.js");
			cache.add("https://cdnjs.cloudflare.com/ajax/libs/angular-material/1.1.5/angular-material.min.js");
			cache.add("https://cdnjs.cloudflare.com/ajax/libs/angular-material/1.1.5/angular-material.min.css");
			cache.add("https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.5/angular-route.min.js");
			return cache.addAll(offlineFiles);	
		})
	);
});

self.addEventListener('activate', function(event){
	console.log(event);
});

self.addEventListener('fetch', function(event){
	console.log('FETCHING!!!!!');
	console.log(event.request.href);
	event.respondWith(
		caches.match('index.html')
	);
});