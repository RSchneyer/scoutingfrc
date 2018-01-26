if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('./service-worker.js').then(function(registration){
		console.log(registration);
	}).catch(function(error){
		console.log(error);
	});
} else {
	console.log('Service Worker is not supported in this browser.');
}


self.addEventListener('install', function(event){
	console.log(event);
	event.waitUntil(
		caches.open('v1').then(function(cache){
			return cache.addAll([
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

			]);	
		})
	);
});

self.addEventListener('activate', function(event){
	console.log(event);
});

self.addEventListener('fetch', function(event){
	console.log('FETCHING!!!!!');
	console.log(event.request);
	event.respondWith(
		caches.match('/views/'+event.request+'.html')
	);
});