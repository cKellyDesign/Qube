var QubeApp = function () {
	var self = this;

	this.$top = $('#top');
	this.$left = $('#left');
	this.$center = $('#center');
	this.$right = $('#right');
	this.$base = $('#base');
	this.$saveSkip = $('#saveSkip');

	// QUBE APP STATE
	this.currentUser = window.users["chief4000"];

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
	this.screens = {
		center : {
			hasGuessed : false,
			article : this.articles[0].article,
			articleI : 0
		},
		left : {
			hasGuessed : false,
			article : this.articles[1].article,
			articleI : 1
		},
		right : {
			hasGuessed : false,
			article : this.articles[2].article,
			articleI : 2
		},
		center_source : { 
			isLocked : true 
		},
		left_source : { 
			isLocked : true
		},
		right_source : { 
			isLocked : true
		},
		save_skip : {
			hasSaved : false
		}
	}

	this.renderScreens = function () {

		$('#top').append($('#SourceScreen'))
		$('#left, #center, #right').each(function (i, el) {
			// console.log('i', i, 'el', el);\
			var thisScreen = self.screens[$(el).attr('id')]
			var thisAritcle = self.articles[thisScreen.articleI]
			var thisTemplate = $(el).append($('#ArticleTemplate').clone()).children('svg')
			// console.log('thisAritcle', thisAritcle);
			// todo - dynamically update article screens

		})




	}
	this.renderScreens();

	this.hasGuessedN = 0;
	this.hasSavedCurrentArticles = false;
	this.activeScreen = "center";


	// FIREBASE CONFIG / INIT
	var config = { // todo - update this
		apiKey: "AIzaSyDqXCCZmTakDsyMpyzzaX5cV-STTglbIlA",
		authDomain: "fir-test-bbcbe.firebaseio.com",
		databaseURL: "fir-test-bbcbe.firebaseio.com",
		storageKucket: "fir-test-bbcbe.appspot.com"
	}
	firebase.initializeApp(config)


	var usersRef = firebase.database().ref('users'); // users firebase ref
	var articlesRef = firebase.database().ref('articles')
	function getValueCallback (snapshot) {
		console.log(snapshot.val())
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

	// usersRef.on("value", getValueCallback);
	// articlesRef.on("value", getValueCallback);

	// var setUser = { };
	// setUser[this.currentUser.username] = window.users[this.currentUser.username];
	// usersRef.set(setUser);
	// articlesRef.set(window.articles)


	this.onBiasGuess = function (e) {

	}

	this.checkBiasGuesses = function (e) {

	}

	// Prevents images from swallowing click and dragging of the cube! :D
	$('#top, #center, #left, #right, #base, #saveSkip').on('dragstart', function (e) { return false; })

}

window.qubeApp = new QubeApp()