var QubeApp = function () {
	var self = this;

	this.$top = $('#top');
	this.$left = $('#left');
	this.$center = $('#center');
	this.$right = $('#right');
	this.$base = $('#base');
	this.$saveSkip = $('#saveSkip');

	// QUBE APP STATE
	this.currentUser = "conkelly_uw_edu";

	this.currentTopic = 'North Korea';
	this.biasGuessCount = 3; // used to control locking / unlocking next round
	this.hasGuessedN = 0;
	this.hasSavedCurrentArticles = false;
	this.activeScreen = "center";

	this.toUnlockleftFromTop = false
	this.toUnlockcenterFromTop = false
	this.toUnlockrightFromTop = false
	this.rotatingFromTopScreen = false

	window.viewport.on('side-change-complete', function () {


		if (self.activeScreen === "top") {
			self.rotatingFromTopScreen = true

			if (self.toUnlockleftFromTop) self.handleBiasGuessReveal('left')
			if (self.toUnlockcenterFromTop) self.handleBiasGuessReveal('center')
			if (self.toUnlockrightFromTop) self.handleBiasGuessReveal('right')
		}

		// I couldn't come up with a quicker easier way to set the active Screen
		if ($('#left').hasClass('active')) {
			self.activeScreen = "left";
		}
		if ($('#center').hasClass('active')) {
			self.activeScreen = "center";
		}
		if ($('#right').hasClass('active')) {
			self.activeScreen = "right";
		}
		if ($('#top').hasClass('active')) {
			self.activeScreen = "top";

		}
		self.rotatingFromTopScreen = false
		$('#top').append($('#SourceScreen_template_' + self.activeScreen))
	})

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
			sideNumber : 1
		},
		left_source : { 
			el : null,
			sideNumber : 1
		},
		right_source : { 
			el : null,
			sideNumber : 1
		},
		save_skip : {
			sideNumber : 1
		}
	}


	// handler to update QubeApp states for new screens
	this.handleNextRound = function (e) {
		if (self.biasGuessCount < self.articles.length) {
			// console.log('can\'t go to next, don\'t have enough guesses')
			return false;
		}
		if (e) e.stopPropagation()

		// todo - insert analytics at end of last round (which is now)


		self.biasGuessCount = 0;

		// get existing articles (limited and random for now)
		// todo - narrow this reference via user topic preference
		articlesRef.once("value", function (snapshot) {

			self.articles = []
			var articles = snapshot.val()
			var qubeSides = ['left', 'center', 'right'] // note - this is a great example of accidentally injecting bias into an algorithm. I think it feels natural bc it's LTR but it also aligns to my left leaning baises so I have to be conscious about not letting that seep furhter
			
			// randomly select an index along the aritcles array
			var i = Math.floor(Math.random() * articles.length)
			// Floor down to the nearest multiple of 3 and subtract 1 to convert to base 0
			i = i - (i % 3)

			// vanilla for loop to iterate over the set of 3 articles
			for (var k=0; k < 3; k++) {
				var thisArticle = articles[i + k]
				thisArticle.userGuess = "";
				self.articles[k] = thisArticle;

				// select a random side of the qube and assign thisArticle to it to randomize biase positioning on the qube
				var thisSide =  qubeSides.splice(Math.floor(Math.random() * (qubeSides.length)), 1)
				self.screens[thisSide].article = self.articles[k]
			}


			$('#top, #left, #center, #right').children('*').remove()
			// console.log('data updated for next round!')
			self.updateUserArticleHistory()
			self.renderScreens()
		})
	}


	this.renderScreens = function () {
		
		// Clear out the sides of the cube
		$('#left, #center, #right, #top, #saveSkip').html('')

		// Render the Save Skip Side
		self.renderSaveSkipScreen()

		// Iterate over the article screens to render article screens and source screen
		$('#left, #center, #right').each(function (i, el) {
			// defining the article content to render per screen
			var thisScreen  = self.screens[el.id]
			var thisArticle = thisScreen.article;

			// referencing author / source per article
			var thisAuthor = window.authors[thisArticle.authorUID] 
			var thisSource = window.sources[thisArticle.sourceUID]

			// referencing current qube app screen/source states
			var thisArticleScreen = self.screens[$(el).attr('id')]
			var thisSourceScreen =  self.screens[$(el).attr('id') + '_source']

			
			// Setup New Locked Source Sreen
			self.renderSourceScreen(el, thisSource, thisArticle)
			
			// Defining Guess Button el
			self.renderArticleSreen(el, thisArticle, i)
		})

		self.updateActiveSourceScreen()
	}

	// rendering this simplest screen, save/skip
	this.renderSaveSkipScreen = function() {
		var $svg = $('#SaveSkipScreen_template').clone()

		$('#btn_skip', $svg).on('click', self.handleNextRound)
		$('#btn_save', $svg).on('click', self.handleSaveArticles)

		$('#saveSkip').append($svg)
	}

	

	// With render out the Article Screen SVGs with Article Data / Content
	this.renderArticleSreen = function (el, thisArticle, i) {
		// Render Article SVGs to their repsective sides article_screen_template
		var thisArticleTemplate = $(el).append($('svg#article_screen_template').clone()).children('svg')
		// var thisArticleTemplate = $(el).append($('#ArticleTemplate').clone()).children('svg')
		$(thisArticleTemplate).attr('id', $(thisArticleTemplate).attr('id') + '_' + i)
		var $guessButton = $('#BiasGuessBtn').attr('id', 'BiasGuessBtn_' + i)

		// Adding event listener (for some reason it doesn't like .on('click', this.callbackFunc); )
		$($guessButton).on('click', function (e) {
			console.log('guess button clicked')
			self.onBiasButtonClick(e, el)
		});

		// Update topic Bar & Center
		var topicLabelEl = $('#TopicTextArea tspan', el).html(thisArticle.topic)
		var topicWidth   = topicLabelEl[0].getBBox().width
		var newX = ( 445 / 2 ) - ( topicWidth / 2 )
		topicLabelEl.attr('x', newX)
		// debugger;

		// Update article Date
		var dateLabelEl = $('#_articleDate tspan', el).html(thisArticle.date);

		// Update Title
		var titleRect = $('#articleTitleTextArea rect', el);
		var $TitleTextArea = $('#_articleTitle', el); // svg text element for title
		wrapTextRect(titleRect, $TitleTextArea, thisArticle.title)

		// Update Body
		var bodyRect = $('#articleBodyTextArea rect', el);
		var bodyTextEl = $('#_articleBodyText', el)
		var articleBody = thisArticle.body;
		wrapTextRect(bodyRect, bodyTextEl, articleBody)

	}

	// Render Source Screen for every Article Screen (from within article rendering loop)
	this.renderSourceScreen = function (el, thisSource, thisArticle) {
		// Create new SVG
		thisSource.el = $('#SourceScreen_template').clone()
		thisSource.contentEl = $('#sourceContent', thisSource.el)

		// Set SVG to unique ID and add class to orient SVG 
		// towards corresponding Article Screen
		$(thisSource.el).attr('id', $(thisSource.el).attr('id') + '_' + el.id).addClass(el.id)
		thisSource.content = $('#sourceContent', thisSource.el)
		$('#top').append(thisSource.el)
	}



	// When a user clicks on the bias buess button 
	this.onBiasButtonClick = function (e, el) {
		e.preventDefault();
		e.stopPropagation();

		self.showBiasGuessOverlay(el)

		// todo - animate button shifting down then up; protip: svgs are BUTTS
		// $('rect', e.currentTarget).last().animate({y: 3}, 300)
		// $('rect', e.currentTarget).last().delay(300).animate({y: 0}, 300)
	}

	// Shows bias overlay when user clicks the button to see it
	// todo - rework this for new SVGs
	this.showBiasGuessOverlay = function (el) {
		if (!$('#guess_screen_template', el).length) {
			$(el).append($('#svgTemplateWrap svg#guess_screen_template').clone())
			// debugger;
			// $('svg#guess_screen_template', el).removeClass('ghost')

		} else {
			$(el).append($('svg#guess_screen_template', el))
			// $('svg#guess_screen_template', el).removeClass('ghost')
		}
		
		var ov = $('#guess_screen_template', el);
		var guessPies = $('#overlay_pie_L, #overlay_pie_LC, #overlay_pie_C, #overlay_pie_RC, #overlay_pie_R', el)
		
		guessPies.on('click', function (e) {
			var biasGuess = this.id.replace('overlay_pie_', ''),
				thisPie = this,
				otherPies = _.reject(guessPies, function(pie) { return pie === thisPie; })
			
			// handle shrinking other pies
			$(otherPies).each(function(i, pie) {
				// get current transform so we don't destroy the SVG element positioning when scaling
				var thisTransform = $(pie).attr('transform')
				$(pie).attr('transform', thisTransform + ' scale(.5)')

				// wait until fully faded out and reset to original transform
				setTimeout(function(){
					$(pie).attr('transform', thisTransform)
				}, 1500)
			});

			// handle the rest of the things involved with updating the state of the cube after guessing
			self.onBiasGuess(e, el, biasGuess)

			// change color of BG to match the bias guess
			$('#Guess_BG rect', ov).attr('fill', 'url(#GuessGradient_' + biasGuess + ')')
		})


		$('#Close_Btn', el).on('click', function (e) {
			$('#overlay_pie_L, #overlay_pie_LC, #overlay_pie_C, #overlay_pie_RC, #overlay_pie_R', el).off('click')
			$('g#guess_screen_template > g', el).animate({ opacity: 0 }, 300)
			
			setTimeout(function(){
				$(el).prepend($(ov))
			}, 300)
		})

		// Instead of using css transitions... see note in style.css above "g#guess_screen_template > g {...}"
		$('g#guess_screen_template > #overlay', el).delay(100).animate({ opacity: 1 }, 1000)
		$('g#guess_screen_template > g', el).delay(1000).animate({ opacity: 1 }, 300)
		
	}


	

	this.onBiasGuess = function (e, el, selection) {
		var thisArticle = self.screens[el.id].article;

		// Define actual Bias and if user got it correct
		correctBias = self.screens[el.id].article.bias;
		isCorrect = correctBias == selection

		// If it's the first guess, count it towards their stats
		if ( !thisArticle.userGuess.length ) {
			thisArticle.userGuess = selection;
			thisArticle.isCorrect = isCorrect;

			// handler to update firebase
			self.handleBiasGuess(el, correctBias, selection)

			// modify SVG element to be 'unlocked'
			self.updateSourceScreenEl(el, correctBias)

			// count up to next round
			self.biasGuessCount++;
		}
		

		$('.active', el).removeClass('active')
		var lockedGuess = $('#yourGuess_locked', el).addClass('active')
		var userGuessPie = $('#_userGuess', lockedGuess)

		// update bias guess pie
		$('path', userGuessPie).each(function (i, sliceEl) {
			// define if the slice should be active and thus not white
			var thisSliceBias = sliceEl.id.replace('sourceBiasPie_',''),
				doActivate = (selection.indexOf(thisSliceBias) !== -1)

			// handle slice state via class
			if (doActivate) {
				$(sliceEl).addClass('active')
			} else {
				$(sliceEl).removeClass('active')
			}
		})
		// debugger;
		self['toUnlock' + el.id +'FromTop'] = true

		// update bias guess label
		var biasLabel = this.getBiasLabel(selection)
		var biasLabelEl = $('#_userRating tspan', lockedGuess).html(biasLabel)

		$('#btnRedo_biasGuess', lockedGuess).on('click', function (e) {
			self.onBiasButtonClick(e, el)
		})

		// Hiding Overlay after guessing
		setTimeout(function () {
			$('#overlay_pie_L, #overlay_pie_LC, #overlay_pie_C, #overlay_pie_RC, #overlay_pie_R', el).off('click')
			$('#Close_Btn').off('click')

			$('g#guess_screen_template > g', el).animate({ opacity: 0 }, 300)

			setTimeout(function(){
				$(el).prepend($('svg#guess_screen_template', el))
			}, 300)
		}, 1000)
	}


	// fires when user guesses the bias
	this.updateSourceScreenEl = function (el, bias) {

		var thisArticle = self.screens[el.id].article,
			thisSource  = window.sources[thisArticle.sourceUID],
			sourceEl 	= $('#SourceScreen_template_' + el.id),
			thisPie 	= $('#_sourceBiasPie', sourceEl),
			biasLabel

		// reveal / hide bias borders
		$('#sourceScreen_template .active', sourceEl).removeClass('active')
		var activeBoarder =  $('#sourceScreen_template #' + thisSource.bias, sourceEl).addClass('active')

		// update bias pie	
		$('path', thisPie).each(function (i, sliceEl) {

			// define if the slice should be active and thus not white
			var thisSliceBias = sliceEl.id.replace('sourceBiasPie_',''),
				doActivate = (bias.indexOf(thisSliceBias) !== -1)

			// handle slice state via class
			if (doActivate) {
				$(sliceEl).addClass('active')
			} else {
				$(sliceEl).removeClass('active')
			}

		})

		// dynamically update the text in the SVGs
		self.populateSourceScreenText(el, thisSource, thisArticle)
	}

	this.populateSourceScreenText = function (el, thisSource, thisArticle) {
		var templateSvg = $('#SourceScreen_template_' + el.id)

		// start source context looop
		$('#sourceContent > g', thisSource.el).each(function (i, sourceEl) { // i before e, except in underscore
			
			// Define the Content Groups being iterated through
			var thisTextArea = $('#' + sourceEl.id + 'TextArea', sourceEl),
				thisEl, rect, textEl, elWidth, newOffset, pretext;

			// define all the text values
			switch (sourceEl.id) {
				case 'description':
					// just handle 
					thisVal = window.sources[thisArticle.sourceUID].desc
					rect = $('#descriptionTextArea rect', sourceEl)
					rect.addClass('descriptionRect')
					textEl = $('#_description', sourceEl)
					textEl.attr('x', 0).attr('text-anchor', 'left')
				break;
				case 'date':
					thisVal = _.findWhere(window.articles, { id : thisArticle.id}).date
					pretext = 'Published on '
				break;
				case 'source':
				case 'author':
					thisVal = window[sourceEl.id + 's'][thisArticle[sourceEl.id + 'UID']].name
					pretext = (sourceEl.id == 'author') ? 'Written by ' : false
				break;
			}

			// replace text and center tspan if not the description, else do the textwrapping
			if (sourceEl.id != 'description') {
				self.centerSVGText(sourceEl, thisVal, pretext)
			} else {
				wrapTextRect(rect, textEl, thisVal)
			}

			// delete rectangle
			thisTextArea.remove()
		})
		// end source context loop

		// Define Label For Bias
		var biasLabel = self.getBiasLabel(thisSource.bias);
		biasLabel = !!biasLabel ? biasLabel : ''

		// Update Source Bias Label
		var biasLabelEl = $('#sourceBias', templateSvg)[0]
		self.centerSVGText(biasLabelEl, biasLabel)

		// Reposition updated elemetns
		$('#sourceContent', thisSource.el).attr('transform', 'translate(40.000000, 184.000000)')
		$('#sourceBias', thisSource.el).attr('transform', 'translate(170.000000, 40.000000)')
	}

	this.getBiasLabel = function (bias) {
		switch (bias) {
			case 'L':
				return 'LEFT'
			break;
			case 'LC':
				return 'LEFT CENTER'
			break;
			case 'C':
				return 'CENTER'
			break;	
			case 'RC':
				return 'RIGHT CENTER'
			break;
			case 'R':
				return 'RIGHT'
			break;
		}
		return ''
	}

	// sourceEl => parentEl, thisVal => thisText, pretext => pretext
	this.centerSVGText = function (parentEl, thisText, pretext) {
		if (!pretext) pretext = '';

		var thisEl = $('#_' + parentEl.id + ' tspan', parentEl)

		thisEl.html((pretext + thisText))
	}



	// Utility function to update the source screen to show the app's Active Screen's Source
	this.updateActiveSourceScreen = function () {
		// console.log('side-change-complete listener for sourceScreen update', self.activeScreen);
		// I couldn't come up with a quicker easier way to set the active Screen
		if ($('#left').hasClass('active')) self.activeScreen = "left";
		if ($('#center').hasClass('active')) self.activeScreen = "center";
		if ($('#right').hasClass('active')) self.activeScreen = "right";

		$('#top').append($('#SourceScreen_template_' + self.activeScreen))
	}

	this.handleBiasGuessReveal = function (side) {
		var el = $('#' + side),
			thisArticle = self.screens[side].article,
			lockedGuess = $('#yourGuess_locked', el),
			unlockedGuess = $('#yourGuess_unlocked', el),
			userRating = $('#userRating', unlockedGuess),
			qubeRating = $('#qubeRating', unlockedGuess),
			userRatingRect = $('#userRatingTextArea', userRating),
			qubeRatingRect = $('#qubeRatingTextArea', qubeRating),
			userRatingText = $('#ratingLabel text', userRating).html(''),
			qubeRatingText = $('#ratingLabel text', qubeRating).html(''),
			userRatingPie = $('#_userGuess', userRating),
			qubeRatingPie = $('#_qubeBias', qubeRating),
			userRatingLabel = self.getBiasLabel(thisArticle.userGuess),
			qubeRatingLabel = self.getBiasLabel(thisArticle.bias)
		
		self['toUnlock' + side +'FromTop'] = false

		lockedGuess.removeClass('active')
		unlockedGuess.addClass('active')

		self.renderPie(userRatingPie, thisArticle.userGuess)
		self.renderPie(qubeRatingPie, thisArticle.bias)

		wrapTextRect(userRatingRect, userRatingText, userRatingLabel, 5)
		wrapTextRect(qubeRatingRect, qubeRatingText, qubeRatingLabel, 5)

		var userLabelTspan = $('tspan', userRatingText)
		var qubeLabelTspan = $('tspan', qubeRatingText)
		if (userLabelTspan.length === 1) userLabelTspan.attr('y', 35)
		if (qubeLabelTspan.length === 1) qubeLabelTspan.attr('y', 35)
	}

	this.renderPie = function (pie, bias) {
		// update pie
		$('path', pie).each(function (i, sliceEl) {
			// define if the slice should be active and thus not white
			var thisSliceBias = sliceEl.id.replace('biasPie_',''),
				doActivate = (bias.indexOf(thisSliceBias) !== -1)

			// handle slice state via class
			if (doActivate) {
				$(sliceEl).addClass('active')
			} else {
				$(sliceEl).removeClass('active')
			}
		})
	}


	// END EVENT LISTENERS

	

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
	var sourcesRef = firebase.database().ref('sources')
	var authorsRef = firebase.database().ref('authors')

	this.user = this.user || null
	this.userRef = usersRef.child(self.currentUser)
	this.userRef.once('value', function (snapshot) {
		self.user = snapshot.val()
		// console.log(self.user)
	})
	this.userHistoryRef = self.userRef.child('article_history')
	this.userSavedArticlesRef = self.userRef.child('saved_articles')



	this.updateUserArticleHistory = function () {
		// save each article from current round to users' saved_articels
		for (var i = 0; i < self.articles.length; i++) {

			var thisArticle = self.articles[i]
			var userHistoryEntryRef = self.userHistoryRef.child(thisArticle.id)

			userHistoryEntryRef.set(thisArticle)
		} 
	}


	this.handleSaveArticles = function(e) {
		e.preventDefault()
		e.stopPropagation()

		for (var i = 0; i < self.articles.length; i++) {

			var thisArticle = self.articles[i]
			// console.log('thisArticle to save', thisArticle)
			var userSavedArticlesEntryRef = self.userSavedArticlesRef.child(thisArticle.id)
			userSavedArticlesEntryRef.set(thisArticle)
		}	
	}



	// // Generic Callback
	// function getValueCallback (snapshot) {
	// 	console.log(snapshot.val())
	// 	// $("#valueText").html(self.value);
	// 	// var val = snapshot.val()
	// 	// if (doUpdate && val == self.value) {
	// 	// 	if (DEBUG) console.log('Uddate Feedback Loop Terminated!!' + self.value + ' === ' + val);
	// 	// 	return false;
	// 	// } else {
	// 	// 	if (DEBUG) console.log('Realtime "value" update');
	// 	// }
	// 	// self.value = val;
		

	// 	// self.nodeFirebaseAPI.updateValue("sliderValue", self.value)
	// }

	// usersRef.on("value", getValueCallback);
	// articlesRef.on("value", getValueCallback);

	//  // USED TO RESET FIREBASE TO STUB DATA!!!
	// usersRef.set(window.users)
	// articlesRef.set(window.articles)
	// sourcesRef.set(window.sources)
	// authorsRef.set(window.authors)

	


	// START BIAS GUESSING HANDLING
	this.handleBiasGuess = function (el, correctBias, selection) {
		var queryString = "users/" + self.user + "/biasGuessing/" + correctBias

		var userBiasGuessingRef = usersRef.child(self.user.email)
										  .child('biasGuessing')
										  .child(correctBias)


		if (!self.userHistoryRef) 
			self.userHistoryRef = self.userRef.child('article_history')
		var articleID = self.screens[el.id].article.id;
		var userHistoryArticleBiasGuessRef = self.userHistoryRef.child(articleID).child('userGuess')
		userHistoryArticleBiasGuessRef.set(selection)

		// once gets the value pretty much immediately and we can update the stats!
		userBiasGuessingRef.once('value',function(snapshot) {
			var stats = snapshot.val()
			stats.totalGuessed++;
			stats.guessedCorrectly = stats.guessedCorrectly + (Number(correctBias == selection))
			if (stats.totalGuessed) stats.avg = stats.guessedCorrectly / stats.totalGuessed;

			userBiasGuessingRef.set(stats)
		})

	}

	$(window).on('keyup', function (e) {

		// listen for arrow keys
		switch(e.keyCode) {
			case 38 : // up arrow
				viewport.torqueY = 90
				setTimeout(cleanUpCubePosition, 300)
			break;
			case 40 : // down arrow
				viewport.torqueY = -90
				setTimeout(cleanUpCubePosition, 300)
			break;
			case 37 : // left arrow
				viewport.torqueX = 90
				setTimeout(cleanUpCubePosition, 300)
			break;
			case 39 : //right arrow
				viewport.torqueX = -90
				setTimeout(cleanUpCubePosition, 300)
			break;
		}
	})
	
	function cleanUpCubePosition () {
		viewport.torqueY = 0
		viewport.torqueX = 0

		if (viewport.positionY > 45 && viewport.positionY < 135) {
			viewport.positionY = 90
		} else if (viewport.positionY > 135 && viewport.positionY < 225) {
			viewport.positionY = 180
		} else if (viewport.positionY > 225 && viewport.positionY < 315) {
			viewport.positionY = 270
		} else {
			viewport.positionY = 0
		}

		if (viewport.positionX > 45 && viewport.positionX < 135) {
			viewport.positionX = 90
		} else if (viewport.positionX > 135 && viewport.positionX < 225) {
			viewport.positionX = 180
		} else if (viewport.positionX > 225 && viewport.positionX < 315) {
			viewport.positionX = 270
		} else {
			viewport.positionX = 0
		}
	}

	// Prevents images from swallowing click and dragging of the cube! :D
	$('#top, #center, #left, #right, #base, #saveSkip').on('dragstart', function (e) { return false; })
	this.handleNextRound();
}

window.qubeApp = new QubeApp()