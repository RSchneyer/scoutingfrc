function firebaseAuth(){
	var provider = new firebase.auth.GoogleAuthProvider();
	firbase.auth().signInWithPopup(provider).then(function(result){
		var user = result.user;
		alert('User: '+ user);
	});
	
};