<html lang="en-us">
<head>
	<div style="background: rgba(250,250,250,.7); border: 1px solid black; margin: 5px; padding: 10px; display: inline-block; font-weight: bold;">
	<?php
		//Request event match data (schedule)
		
		
		echo 'test echo stuffs<br>';
		
		//Request team data (numbers, name location, etc)
		$curl = curl_init();
		$season = $_POST['season'];
		$eventcode = $_POST['eventcode'];
		echo $season . '<br>';
		echo $eventcode . '<br>';

		$url = "https://www.thebluealliance.com/api/v3/event/{$season}{$eventcode}?X-TBA-Auth-Key=IrbGoLNLzpkFoLGIQsd7gf2M6sY5P6v9iWykp0PBTazwdgr4ofWXEvdrOI1Mbo7B";
		
		echo $url . '<br>';
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		$result = "var eventData = ".curl_exec($curl);
		curl_close($curl);
		
		$filename = 'eventData.js';
		file_put_contents($filename, $result);
		echo '<br>'.$filename.'<br>';
		
		//Request team data (numbers, name location, etc)
		$curl = curl_init();
		$season = $_POST['season'];
		$eventcode = $_POST['eventcode'];
		
//		$url = "https://www.thebluealliance.com/api/v2/event/{$season}{$eventcode}/teams?X-TBA-App-Id=<FRC967>:<2017ScoutingApp>:<0.2>";
		$url = "https://www.thebluealliance.com/api/v3/event/{$season}{$eventcode}/teams?X-TBA-Auth-Key=IrbGoLNLzpkFoLGIQsd7gf2M6sY5P6v9iWykp0PBTazwdgr4ofWXEvdrOI1Mbo7B";
		
		echo $url;
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		$result = "var teamData = ".curl_exec($curl);
		curl_close($curl);
		$filename = 'teamData.js';
		file_put_contents($filename, $result);
		
		$curl = curl_init();
		$season = $_POST['season'];
		$eventcode = $_POST['eventcode'];
		
//		$url = "https://www.thebluealliance.com/api/v2/event/{$season}{$eventcode}/matches?X-TBA-App-Id=<FRC967>:<2017ScoutingApp>:<0.2>";
		$url = "https://www.thebluealliance.com/api/v3/event/{$season}{$eventcode}/matches?X-TBA-Auth-Key=IrbGoLNLzpkFoLGIQsd7gf2M6sY5P6v9iWykp0PBTazwdgr4ofWXEvdrOI1Mbo7B";
		
		echo $url;
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		$result = "var scheduleData = ".curl_exec($curl);
		curl_close($curl);
		$filename = 'scheduleData.js';
		file_put_contents($filename, $result);
		echo "<br>Requests executed...?";
		
	?>
	</div>
</head>
</html>