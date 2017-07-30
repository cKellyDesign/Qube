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
	this.biasGuessCount = 0;
	this.articles = [ 
		{
			article: window.articles[0],
			userGuess   : "",
			isCorrect	: null,
			hasOpened   : false,
			hasSeenBias : false,
			timeInArticle : 0
		},
		{
			article: window.articles[1],
			userGuess   : "",
			isCorrect	: null,
			hasOpened   : false,
			hasSeenBias : false,
			timeInArticle : 0
		},
		{
			article: window.articles[2],
			userGuess   : "",
			isCorrect	: null,
			hasOpened   : false,
			hasSeenBias : false,
			timeInArticle : 0
		},
	];
	this.screens = {
		center : {
			sideNumber : 2,
			hasGuessed : false,
			article : this.articles[0].article,
			articleI : 0
		},
		left : {
			sideNumber : 5,
			hasGuessed : false,
			article : this.articles[1].article,
			articleI : 1
		},
		right : {
			sideNumber : 3,
			hasGuessed : false,
			article : this.articles[2].article,
			articleI : 2
		},
		center_source : { 
			el : null,
			sideNumber : 1,
			isLocked : true 
		},
		left_source : { 
			el : null,
			sideNumber : 1,
			isLocked : true
		},
		right_source : { 
			el : null,
			sideNumber : 1,
			isLocked : true
		},
		save_skip : {
			sideNumber : 1,
			hasSaved : false
		}
	}

	// START CSS / JS / SVG Implementation
	var IS_CSS_JS = true; // toggle this for side by side implementations
	this.renderScreens = function () {

		$('#left, #center, #right').each(function (i, el) {
			var thisScreen  = self.screens[el.id]
			var thisAritcle = thisScreen.article;

			var thisAuthor = _.findWhere(window.authors, { id : thisAritcle.authorUID})
			var thisSource = _.findWhere(window.sources, { id : thisAritcle.sourceUID})

			var thisArticleScreen = self.screens[$(el).attr('id')]
			var thisSourceScreen =  self.screens[$(el).attr('id') + '_source']

			
			var thisArticleTemplate = $(el).append($('#ArticleTemplate').clone()).children('svg')

			$(thisArticleTemplate).attr('id', $(thisArticleTemplate).attr('id') + '_' + i)


			// Setup Source Sreen
			self.renderSourceScreen(el, thisSource, thisAritcle)
			
			// Defining Guess Button el
			self.renderArticleSreen(el, thisAritcle, i)
		})

		$('#top').append($('#SourceScreen_center'))
	}

	this.renderSourceScreen = function (el, thisSource, thisAritcle) {
		thisAritcle.el = $('#SourceScreen').clone()
		$(thisAritcle.el).attr('id', $(thisAritcle.el).attr('id') + '_' + el.id).addClass(el.id)

		// Drop that bad gal into the #top div
		$('#top').append(thisAritcle.el)

		// if ($(thisAritcle.el)hasClass(''))



		window.viewport.on('side-change-complete', function (e) {
			if ( !$(el).hasClass('active')) return false;

			$('#top').append(thisAritcle.el)
		});
	}

	this. renderArticleSreen = function (el, thisAritcle, i) {
		var $guessButton = $('#BiasGuessBtn').attr('id', 'BiasGuessBtn_' + i)

		// Adding event listener (for some reason it doesn't like .on('click', this.callbackFunc); )
		$($guessButton).on('click', function (e) {
			self.onBiasButtonClick(e, el)
		});


		// Defining SVG els
		var $Rect = $('#ArticleTextArea > rect', el); // The bounding box in which to contain the text
		var $TitleTextArea = $('#textTitle', el); // svg text element for title
		var $BodyTextArea = $('#textBody', el); // svg text element for body

		// Defining two pieces of text which need to be thrown into the svg
		var articleText = thisAritcle.body;
		var articleTitle = thisAritcle.title;

		// Runs a helper function to wrap text via svg tspan els
		wrapTextRect($Rect, $TitleTextArea, articleTitle)

		var bodyOffset = Number($($TitleTextArea).attr('font-size')) * 1.4 * $($TitleTextArea).children('tspan').length;
		wrapTextRect($Rect, $BodyTextArea, articleText, bodyOffset + 12)
	}

	this.renderScreens();

	this.hasGuessedN = 0;
	this.hasSavedCurrentArticles = false;
	this.activeScreen = "center";

	this.showBiasGuessOverlay = function (el) {
		if (!$('#GuessOverlay', el).length) {
			 $(el).append($('#GuessOverlay').clone())
		} else {
			$(el).append($('#GuessOverlay', el))
			$('#GuessOverlay', el).removeClass('ghost')
		}
		
		var ov = $('#GuessOverlay', el);
		$('#L, #LC, #C, #RC, #R', el).on('click', function (e) {
			// pass extra parameter "this.id" to check the bias
			self.onBiasGuess(e, el, this.id)
			var BGs = $('#Guess_BGs', ov);
			$(BGs).append($('#Guess_' + this.id + '_BG'), BGs);
			$('text', ov).attr('fill', 'white')
		})

		$('#Close_Btn', el).on('click', function (e) {
			$('#L, #LC, #C, #RC, #R', el).off('click')
			$('#GuessOverlay', el).addClass('ghost')
		})
		
	}
	// END CSS / JS / SVG Implementation


	// START EVENT LISTENER CALLBACK FUNCTIONS
	// These function should be used in either FE implementation

	// When a user clicks on the bias button 
	this.onBiasButtonClick = function (e, el) {
		e.preventDefault();
		e.stopPropagation();

		if (IS_CSS_JS) this.showBiasGuessOverlay(el)
	}

	this.onBiasGuess = function (e, el, selection) {
		// Define actual Bias
		var thisAritcle = self.screens[el.id].article;
		var correctBias = self.screens[el.id].article.bias;
		var isCorrect = correctBias == selection
		if ( !thisAritcle.userGuess.length ) {
			thisAritcle.userGuess = selection;
			thisAritcle.isCorrect = isCorrect;

			// todo - trigger firebase update
		}


		self.screens[el.id + '_source'].isLocked = false; // do we unlock them all at once?
		self.biasGuessCount++;
		if (self.biasGuessCount === this.articles.length) {
			//unlock next round of articles!
			self.biasGuessCount = 0;
		}

		// Hiding Overlay after guessing
		setTimeout(function () {
			$('#L, #LC, #C, #RC, #R', el).off('click')
			$('#Close_Btn').off('click')


			$('#GuessOverlay', el).addClass('ghost');
			setTimeout(function(){
				$(el).prepend($('#GuessOverlay', el))
			}, 500)
		},1000)
	}




	// END EVENT LISTENERS

	// START BIAS GUESSING HANDLING





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


	// Prevents images from swallowing click and dragging of the cube! :D
	$('#top, #center, #left, #right, #base, #saveSkip').on('dragstart', function (e) { return false; })

}

window.qubeApp = new QubeApp()