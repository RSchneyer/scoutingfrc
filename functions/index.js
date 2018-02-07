const admin = require('firebase-admin');
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

admin.initializeApp(functions.config().firebase);

var db = admin.firestore();
var FieldValue = require('firebase-admin').firestore.FieldValue;

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: gmailEmail,
		pass: gmailPassword
	}
});
const APP_NAME = 'ScoutingFRC';

exports.userCreate = functions.auth.user().onCreate(event => {
	const user = event.data;
	const displayName = user.displayName;
	const uid = user.uid;
	const email = user.email;
	console.log('new user Created:'+ displayName+' UID: '+uid);

	var ref = db.collection('users').doc(uid);
	ref.set({
		email : email,
		userDisplayName : displayName	
	}, { merge: true });
	return sendWelcomeEmail(email, displayName);
});

function sendWelcomeEmail(email, displayName) {
	const mailOptions = {
		from: `ScoutingFRC <noreply@firebase.com>`,
		to: email
	};

	mailOptions.subject = `Welcome to ScoutingFRC!`;
	mailOptions.text = `Hey ${displayName || ''}! 
				Welcome to ScoutingFRC. If you have any questions, you can contact us at scoutingfrcweb@gmail.com. 
				Have a great season! 
				The ScoutingFRC team`;

	return mailTransport.sendMail(mailOptions).then(function(){
		console.log('Welcome email sent to: ', email);	
		});
}
/* Maybe someday
exports.loadTeamData = functions.firestore.document('/users/{user}')
.onWrite(event => {
	
});
*/
exports.updateSeasonAverage = functions.firestore.document('/teams/{teamNum}/averages/{event}')
.onWrite(event => {
	console.log('Event Data Changed');
	console.log('Team#'+event.params.teamNum+' Event:'+event.params.event);
	var rootRef = db.collection("teams/"+event.params.teamNum+"/averages/");
	var numEvents = 0;
	var datapoints = 0;
	
	var autoSuccess = 0;
	var autoSuccessAv = 0;
	var startMiddle = 0;
	var startRight = 0;
	var startLeft = 0;
	var startPos = '';
	var boostCount = 0;
	var boostAv = 0;
	var forceCount = 0;
	var forceAv = 0;
	var levitateCount = 0;
	var levitateAv = 0;
	var autoCrossAv = 0;
	var autoCrossCount = 0;
	var autoWrongAv = 0;
	var autoWrongCount = 0;
	var teleWrongAv = 0;
	var teleWrongCount = 0;
	var defendedAv = 0;
	var defendedCount = 0;
	var defenderAv = 0;
	var defenderCount = 0;
	var allianceScaleCount = 0;
	var allianceScaleAv = 0;
	var centerScaleCount = 0;
	var centerScaleAv = 0;
	var opponentScaleCount = 0;
	var opponentScaleAv = 0;
	var exchangeCount = 0;
	var exchangeAv = 0;
	var climbAv = 0;
	var climbCount = 0;

	var matches = rootRef.get()
	.then(snapshot => {
		snapshot.forEach(doc => {
			jsonData = doc.data();
			numEvents++;
			datapoints+=jsonData.datapoints;

			autoSuccess += jsonData.autoSuccess;
			//this part maybe works
			var startCurr = jsonData.startPos;
			var startArray = startCurr.split(":");
			startMiddle += startArray[1];
			startLeft += startArray[0];
			startRight += startArray[2];
			//dont work? ^^
			boostCount += jsonData.boost;
			forceCount += jsonData.force;
			levitateCount += jsonData.levitate;
			autoCrossCount += jsonData.autoCross;
			autoWrongCount += jsonData.autoWrong;
			teleWrongCount += jsonData.teleWrong;
			defendedCount += jsonData.defended;
			defenderCount += jsonData.defender;
			allianceScaleCount += jsonData.allianceScaleCounter;
			centerScaleCount += jsonData.centerScaleCounter;
			opponentScaleCount += jsonData.opponentScaleCounter;
			exchangeCount += jsonData.exchangeCounter;
			climbCount += jsonData.endClimb;
		});

		startPos = startLeft + ": "+startMiddle+": "+startRight;
		
		autoSuccessAv = autoSuccess/numEvents;
		boostAv = boostCount/numEvents;
		forceAv = forceCount/numEvents;
		levitateAv = levitateCount/numEvents;
		autoCrossAv = autoCrossCount/numEvents;
		autoWrongAv = autoWrongCount/numEvents;
		teleWrongAv = teleWrongCount/numEvents;
		defendedAv = defendedCount/numEvents;
		defenderAv = defenderCount/numEvents;
		allianceScaleAv = allianceScaleCount/numEvents;
		centerScaleAv = centerScaleCount/numEvents;
		opponentScaleAv = opponentScaleCount/numEvents;
		exchangeAv = exchangeCount/numEvents;
		climbAv = climbCount/numEvents;

		var saveRef = db.doc("teams/"+event.params.teamNum);
		var saveData = saveRef.set({
			seasonAverage: {
				autoSuccess: autoSuccessAv,
				startPos: startPos,
				endClimb: climbAv,
				defended: defendedAv,
				defender: defenderAv,
				teleWrong: teleWrongAv,
				autoWrong: autoWrongAv,
				autoCross: autoCrossAv,
				centerScaleCounter: centerScaleAv,
				allianceScaleCounter: allianceScaleAv,
				exchangeCounter: exchangeAv,
				opponentScaleCounter: opponentScaleAv,
				boost: boostAv,
				force: forceAv,
				levitate: levitateAv,
				datapoints:datapoints,
				timestamp: FieldValue.serverTimestamp()
			}
		}, { merge: true });
	})
	.catch(err => {
		console.log('Error getting document', err);
	});
	return 0;
});

exports.updateEventAverage = functions.firestore.document('/teams/{teamNum}/events/{event}/averages/{matchNum}')
.onWrite(event => {
	console.log('Event Data Changed');
	console.log('Team#'+event.params.teamNum+' Event:'+event.params.event+' Match#'+event.params.matchNum);
	var rootRef = db.collection("teams/"+event.params.teamNum+"/events/"+event.params.event+"/averages/");
	var numMatches = 0;
	var datapoints = 0;

	var autoSuccess = 0;
	var autoSuccessAv = 0;
	var startMiddle = 0;
	var startRight = 0;
	var startLeft = 0;
	var startPos = '';
	var boostCount = 0;
	var boostAv = 0;
	var forceCount = 0;
	var forceAv = 0;
	var levitateCount = 0;
	var levitateAv = 0;
	var autoCrossAv = 0;
	var autoCrossCount = 0;
	var autoWrongAv = 0;
	var autoWrongCount = 0;
	var teleWrongAv = 0;
	var teleWrongCount = 0;
	var defendedAv = 0;
	var defendedCount = 0;
	var defenderAv = 0;
	var defenderCount = 0;
	var allianceScaleCount = 0;
	var allianceScaleAv = 0;
	var centerScaleCount = 0;
	var centerScaleAv = 0;
	var opponentScaleCount = 0;
	var opponentScaleAv = 0;
	var exchangeCount = 0;
	var exchangeAv = 0;
	var climbAv = 0;
	var climbCount = 0;

	var matches = rootRef.get()
	.then(snapshot => {
		snapshot.forEach(doc => {
			jsonData = doc.data();
			numMatches++;
			datapoints+=jsonData.datapoints;
			if(jsonData.startPos == "middle"){
				startMiddle++;
			}else if(jsonData.startPos == "right"){
				startRight++;
			}else if(jsonData.startPos == "left"){
				startLeft++;
			}
			autoSuccess += jsonData.autoSuccess;
			boostCount += jsonData.boost;
			forceCount += jsonData.force;
			levitateCount += jsonData.levitate;
			autoCrossCount += jsonData.autoCross;
			autoWrongCount += jsonData.autoWrong;
			teleWrongCount += jsonData.teleWrong;
			defendedCount += jsonData.defended;
			defenderCount += jsonData.defender;
			allianceScaleCount += jsonData.allianceScaleCounter;
			centerScaleCount += jsonData.centerScaleCounter;
			opponentScaleCount += jsonData.opponentScaleCounter;
			exchangeCount += jsonData.exchangeCounter;
			climbCount += jsonData.endClimb;
		});

		startPos = startLeft + ": "+startMiddle+": "+startRight;
		
		autoSuccessAv = autoSuccess/numMatches;
		boostAv = boostCount/numMatches;
		forceAv = forceCount/numMatches;
		levitateAv = levitateCount/numMatches;
		autoCrossAv = autoCrossCount/numMatches;
		autoWrongAv = autoWrongCount/numMatches;
		teleWrongAv = teleWrongCount/numMatches;
		defendedAv = defendedCount/numMatches;
		defenderAv = defenderCount/numMatches;
		allianceScaleAv = allianceScaleCount/numMatches;
		centerScaleAv = centerScaleCount/numMatches;
		opponentScaleAv = opponentScaleCount/numMatches;
		exchangeAv = exchangeCount/numMatches;
		climbAv = climbCount/numMatches;

		var saveRef = db.doc("teams/"+event.params.teamNum+"/averages/"+event.params.event);
		var saveData = saveRef.set({
			startPos: startPos,
			autoSuccess: autoSuccessAv,
			endClimb: climbAv,
			defended: defendedAv,
			defender: defenderAv,
			teleWrong: teleWrongAv,
			autoWrong: autoWrongAv,
			autoCross: autoCrossAv,
			centerScaleCounter: centerScaleAv,
			allianceScaleCounter: allianceScaleAv,
			exchangeCounter: exchangeAv,
			opponentScaleCounter: opponentScaleAv,
			boost: boostAv,
			force: forceAv,
			levitate: levitateAv,
			datapoints:datapoints,
			timestamp: FieldValue.serverTimestamp()
		}, { merge: true });
	})
	.catch(err => {
		console.log('Error getting document', err);
	});
	return 0;
});

exports.updateMatchAverage = functions.firestore.document('/teams/{teamNum}/events/{event}/matches/{matchNum}')
.onWrite(event => {
	console.log('Match Data Changed');
	console.log('Team#'+event.params.teamNum+' Event:'+event.params.event+' Match#'+event.params.matchNum);
	var rootRef = db.doc("teams/"+event.params.teamNum+"/events/"+event.params.event+"/matches/"+event.params.matchNum);
	
	var datapoints = 0;
	var startMiddle = 0;
	var startRight = 0;
	var startLeft = 0;
	var startPos = '';
	var autoCubeCounter = 0;
	var autoCubePercent = 0;
	var boostCount = 0;
	var boostTimeCount = 0;
	var boostTimeAv = 0;
	var forceCount = 0;
	var forceTimeCount = 0;
	var forceTimeAv = 0;
	var levitateCount = 0;
	var levitateTimeCount = 0;
	var levitateTimeAv = 0;
	var autoCrossPercent = 0;
	var autoCrossCounter = 0;
	var autoWrongPercent = 0;
	var autoWrongCounter = 0;
	var teleWrongPercent = 0;
	var teleWrongCounter = 0;
	var defendedPercent = 0;
	var defendedCounter = 0;
	var defenderPercent = 0;
	var defenderCounter = 0;
	var allianceScaleCounter = 0;
	var allianceScaleAv = 0;
	var centerScaleCounter = 0;
	var centerScaleAv = 0;
	var opponentScaleCounter = 0;
	var opponentScaleAv = 0;
	var exchangeCounter = 0;
	var exchangeAv = 0;
	var climbPercent = 0;
	var climbCounter = 0;

	var matchData = rootRef.get()
	.then(doc => {
		jsonData = doc.data();
		for(var p in jsonData){
			if((jsonData[p].endClimb == "successCarry") || (jsonData[p].endClimb == "successAttach") || (jsonData[p].endClimb == "successSolo")){
				climbCounter ++;
			}
			if((jsonData[p].autoCube == "lowsuccess") || (jsonData[p].autoCube == "highsuccess")){
				autoCubeCounter ++;
			}
			if(jsonData[p].startPos == "middle"){
				startMiddle++;
			}else if(jsonData[p].startPos == "right"){
				startRight++;
			}else if(jsonData[p].startPos == "left"){
				startLeft++;
			}
			if(jsonData[p].autoWrong){
				autoWrongCounter++;
			}
			if(jsonData[p].autoCross){
				autoCrossCounter++;
			}
			if(jsonData[p].teleWrong){
				teleWrongCounter++;
			}
			if(jsonData[p].defender){
				defenderCounter++;
			}
			if(jsonData[p].defended){
				defendedCounter++;
			}
			if(jsonData[p].force > 0){
				forceTimeCount += jsonData[p].force;
				forceCount ++;
			}
			if(jsonData[p].boost > 0){
				boostTimeCount += jsonData[p].boost;
				boostCount ++;
			}
			if(jsonData[p].levitate > 0){
				levitateTimeCount += jsonData[p].levitate;
				levitateCount ++;
			}
			allianceScaleCounter += jsonData[p].allianceScaleCounter;
			centerScaleCounter += jsonData[p].centerScaleCounter;
			opponentScaleCounter += jsonData[p].opponentScaleCounter;
			exchangeCounter += jsonData[p].exchangeCounter;
			datapoints ++;
		}
		if((startMiddle > startLeft) && (startMiddle > startRight)){
			startPos = 'middle';
		}else if((startLeft > startRight) && (startLeft > startMiddle)){
			startPos = 'left';
		}else if((startRight > startLeft) && (startRight > startMiddle)){
			startPos = 'right';
		}else{
			startPos = 'N/A';
		}
		autoCubePercent = (autoCubeCounter/datapoints)*100;
		autoWrongPercent = (autoWrongCounter/datapoints)*100;
		autoCrossPercent = (autoCrossCounter/datapoints)*100;
		teleWrongPercent = (teleWrongCounter/datapoints)*100;
		defenderPercent = (defenderCounter/datapoints)*100;
		defendedPercent = (defendedCounter/datapoints)*100;
		climbPercent = (climbCounter/datapoints)*100;
		
		boostTimeAv = boostTimeCount/boostCount;
		levitateTimeAv = levitateTimeCount/levitateCount;
		forceTimeAv = forceTimeCount/forceCount;

		allianceScaleAv = allianceScaleCounter/datapoints;
		centerScaleAv = centerScaleCounter/datapoints;
		opponentScaleAv = opponentScaleCounter/datapoints;
		exchangeAv = exchangeCounter/datapoints;
		
		var saveRef = db.doc("teams/"+event.params.teamNum+"/events/"+event.params.event+"/averages/"+event.params.matchNum);
		var saveData = saveRef.set({
			startPos: startPos,
			autoSuccess: autoCubePercent,
			endClimb: climbPercent,
			defended: defendedPercent,
			defender: defenderPercent,
			teleWrong: teleWrongPercent,
			autoWrong: autoWrongPercent,
			autoCross: autoCrossPercent,
			centerScaleCounter: centerScaleAv,
			allianceScaleCounter: allianceScaleAv,
			exchangeCounter: exchangeAv,
			opponentScaleCounter: opponentScaleAv,
			boost: boostTimeAv,
			force: forceTimeAv,
			levitate: levitateTimeAv,
			datapoints:datapoints,
			timestamp: FieldValue.serverTimestamp()
		}, { merge: true });
	})
	.catch(err => {
		console.log('Error getting document', err);
	});
	return 0;
});
