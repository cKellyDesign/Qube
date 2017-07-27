var QubeApp = function () {
	var self = this;

	// QUBE APP STATE
	this.currentUser = window.users[0];

	this.currentTopic = 'North Korea';
	this.articles = [ 
		{
			article: window.articles[0],
			userGuess   : "",
			hasOpened   : false,
			hasSeenBias : false,
			timeInArticle : 0
		},
		{
			article: window.articles[1],
			userGuess   : "",
			hasOpened   : false,
			hasSeenBias : false,
			timeInArticle : 0
		},
		{
			article: window.articles[2],
			userGuess   : "",
			hasOpened   : false,
			hasSeenBias : false,
			timeInArticle : 0
		},
	];
	this.hasGuessedN = 0;
	this.hasSavedCurrentArticles = false;


	// FIREBASE CONFIG / INIT
	var config = { // todo - update this
		apiKey: "AIzaSyDqXCCZmTakDsyMpyzzaX5cV-STTglbIlA",
		authDomain: "fir-test-bbcbe.firebaseio.com",
		databaseURL: "fir-test-bbcbe.firebaseio.com",
		storageKucket: "fir-test-bbcbe.appspot.com"
	}
	firebase.initializeApp(config)
	this.nodeFirebaseAPI = new NodeFirebaseAPI(firebase);

	var valueRef = firebase.database().ref(); // root firebase ref
	function getValueCallback (snapshot) {
		// $("#valueText").html(self.value);
		// var val = snapshot.val()
		// if (doUpdate && val == self.value) {
		// 	if (DEBUG) console.log('Uddate Feedback Loop Terminated!!' + self.value + ' === ' + val);
		// 	return false;
		// } else {
		// 	if (DEBUG) console.log('Realtime "value" update');
		// }
		// self.value = val;
		

		// self.nodeFirebaseAPI.updateValue("sliderValue", self.value)
	}

	valueRef.on("value", getValueCallback);




}

window.qubeApp = new QubeApp()