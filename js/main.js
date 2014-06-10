if (!window.console) console = {log: function() {}};
/*

*/
var gaPlugin;
var activity_log = [];
var touching = false;
var keep_log = true;
var hints_on = true;
var verses_on = true;
var language = 'english';
var font_size = 'normal';
var long_word_length = 3;
var short_word_length = 4;
var clicked;
var quiz_article = -1;
var quiz_guesses_total = 0;
var quiz_guesses_correct = 0;
var quiz_guesses_incorrect_streak = 0;
var quiz_guesses_incorrect_streak_for_hint = 2;
var has_class_no_touch = false;

var active_cannon_index = 0;
var active_cannon = players;

jQuery(document).ready(function($) {

	function init(){
		document.addEventListener("deviceready", onDeviceReady, false);
		document.addEventListener("menubutton", onMenuKeyDown, false);
		document.addEventListener("backbutton", onBackKeyDown, false);

		//get local storage settings
		if (localStorage.activity_log){
			activity_log = JSON.parse(localStorage.activity_log);
		}
		has_class_no_touch = $('html').hasClass('no-touch');
		//reset log
		//activity_log = [];

		$('body').attr('class', '');
		$('body').addClass(  'font-' + font_size );

		game_aofs();
	}

	function onDeviceReady() {
		//https://github.com/phonegap-build/GAPlugin/blob/c928e353feb1eb75ca3979b129b10b216a27ad59/README.md
		//gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Button", "Click", "event only", 1);
	    gaPlugin = window.plugins.gaPlugin;
	    gaPlugin.init(nativePluginResultHandler, nativePluginErrorHandler, "UA-1466312-12", 10);

		gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "App", "Begin", quiz_article);
	}
	

	function onMenuKeyDown() {
	    // Handle the menu button
	    $('.menu-toggle').trigger('click');
	}

	function onBackKeyDown() {
	    // Handle the back button
	    // do nothing
	}

	$('#mmenu').mmenu({
		slidingSubmenus: false,
		onClick: {
			setSeleted: false,
			preventDefault: null,
			close: true
		}
	});

	function update_language(){
		//console.log('update_language!', language);

		$('.quiz_begin').text(	langs[language].sm_ot );


		$('.list_all').text(	langs[language].list );
		$('.about').text( 		langs[language].about );


		$('.title').text(	langs[language].title_plural );

		//set active from local storage vars
		// console.log(font_size, difficulty, language, hints_on, verses_on);
		$('.font_size_option, .language_option, .difficulty_option, .hints_option, .verses_option').parent().removeClass('active');
		$('.verses_option[data-value="' + verses_on + '"]').parent().addClass('active');
	}	

	function list_aofs(){
		var aofs = '';//'<h2 class="sub-title">' + langs[language].title_plural + '</h2>';

		//aofs += "<h2 class='sub-title'>" + langs[language].active_cannon + "</h2>";
		for ( var i = 0; i < active_cannon.length; i++){
			aofs += "<article class='aof_" + i + "'>";
			aofs += "<dt>" + active_cannon[i].reference + "</dt>";
			aofs += "<dd>" + active_cannon[i].verse;
			aofs += "</article>";
		}

		$('.title').text( langs[language].title_plural );
		$('.content').html(aofs);

		$('article dd').each(function(idx,e){
			//$(this).slideUp();
		});
	}

	$('.content').on('click touch', 'article dt', function(e){
		$(this).next('dd').slideToggle();
		$(this).toggleClass('active');
	});

	$('.font_size_option').on('click touch', function(e){
		//console.log('font size update:', $(this).data('value') );
		font_size = $(this).data('value');
		localStorage.font_size = font_size;
		$(this).parent().siblings().removeClass('active');
		$(this).parent().addClass('active');
		$('body').attr('class', '');
		$('body').addClass(  'font-' + font_size );
	});
	$('.difficulty_option').on('click touch', function(e){
		//console.log('difficulty update:', $(this).data('value'));
		difficulty = $(this).data('value');
		localStorage.difficulty = difficulty;
		$(this).parent().siblings().removeClass('active');
		$(this).parent().addClass('active');
		quiz_article--;
		game_aofs();
		//console.log(difficulty);
	});
	// $('.language_option').on('click touch', function(e){
	// 	//console.log('language change:', $(this).val() );
	// 	language = $(this).data('value');
	// 	localStorage.language = language;
	// 	$(this).parent().siblings().removeClass('active');
	// 	$(this).parent().addClass('active');
	// 	$('.content').html('');
	// 	update_language();
	// 	quiz_article--;
	// 	game_aofs();
	// });
	$('.list_all').on('click touch', function(e){
		list_aofs();
	});
	$('body').on('touchstart', function(){
		// commented for browser dev only??
		//touching = true;
	});
	$('body').on('touchend', function(){
		touching = false;
	});
	$('.quiz_begin').on('click touch', function(e){
		active_cannon_index = $(this).parent('.quiz').data('active-cannon');
		localStorage.active_cannon_index = active_cannon_index;
		active_cannon = cannon[active_cannon_index];
		quiz_article = -1;
		game_aofs();
	});
	$('.quiz_jump').on('click touch', '.quiz_begin_jump', function(e){
		active_cannon_index = $(this).parents('.quiz').data('active-cannon');
		localStorage.active_cannon_index = active_cannon_index;
		active_cannon = cannon[active_cannon_index];
		quiz_article = $(this).data('value') - 2;
		game_aofs();
	});
	$('.about').on('click touch', function(e){
		show_about();
	});
	$('.option_keep_log').on('click touch', function(e){
		keep_log = !$(this).parent().hasClass('active');
		if ( keep_log ) {
			$(this).parent().addClass('active');
		}
		else{
			$(this).parent().removeClass('active');
		}
	});
	$('.hints_option').on('click touch', function(e){
		hints_on = $(this).data('value');
		localStorage.hints_on = hints_on;
		$(this).parent().siblings().removeClass('active');
		$(this).parent().addClass('active');
	});
	$('.verses_option').on('click touch', function(e){
		verses_on = $(this).data('value');
		localStorage.verses_on = verses_on;
		$(this).parent().siblings().removeClass('active');
		$(this).parent().addClass('active');
		quiz_article--;
		game_aofs();
		//console.log('verses_on', verses_on, localStorage.verses_on);
	});
	$('.activity_log').on('click touch', function(e){
		show_activity_log();
	});
	$('.content').on('click touch', '.button_skip', function(e){
		game_aofs();
	});
	$('.content').on('click touch', '.button_again', function(e){
		quiz_article--;
		$(this).remove();
		game_aofs();
	});
	$('.options_toggle').on('click touch', function(){
		$('.options').toggleClass('active');
	})
	$('.content').on('click touch', '.button_clear_log', function(e){
		activity_log = [];
		localStorage.activity_log = JSON.stringify(activity_log);
		show_activity_log();
	})
	function show_about(){
		var content = '<dt>' + langs[language].about + ': ' + langs[language].title_plural + '</dt>';
		content += '<dd>' + langs[language].about_text + '</dd>';

		$('.content').html( content );
	}
	function show_activity_log(){
		var content = '<dt>' + langs[language].log + '</dt>';
		for( var i=0; i<activity_log.length;i++){
			//console.log(activity_log[i]);
			if ( activity_log[i].s != undefined ) {
				content += '<dd>' + activity_log[i].s + '% - ';
				content += active_cannon[ activity_log[i].i ].reference + ' ';
				// content += ' (' + activity_log[i].d + ') ';
				content += relative_time(activity_log[i].t) + '.</dd>';
			}
		}
		content += '<div class="button button_clear_log">' + langs[language].clear_log + '</div>';
		$('.content').html( content );
	}
	function game_aofs(){
		//console.log(quiz_article);
		quiz_article++;
		if (quiz_article > 24 || quiz_article < 0 ){
			quiz_article = 0;
		}
		localStorage.quiz_article = quiz_article - 1;
		//var random_article = Math.floor( aof.length * Math.random() );
		var random_article_words = randomize_aof( quiz_article );

		//place unordred words
		//if verses_on - seperate verses 
		//sort words by verse
		//console.log('verses_on', verses_on, localStorage.verses_on);
		if (verses_on){
			//console.log('verse sorting');
			random_article_words.sort(
				function compare(a,b) {
				  if (parseInt(a.verse) < parseInt(b.verse))
				     return -1;
				  if (parseInt(a.verse) > parseInt(b.verse))
				    return 1;
				  return 0;
				}
			);
		}
		var verse_index = 0;
		//at end of verse add an hr or break.
		if (verse_index < random_article_words[0].verse ){
			verse_index = random_article_words[0].verse;
		}

		var content = '';//<h2 class="sub-title">' + langs[language].quiz + ': ' + langs[language].ordinals[quiz_article] + ' ' + langs[language].title + '</h2>';
		content += '<dt>' + langs[language].title + ' ' + langs[language].quiz + ': ' + active_cannon[quiz_article].reference + '</dt>';
		content += split_verse(verse_index, true);


		if (difficulty == langs['english'].difficulty_long ){
			for (var i = 0; i < random_article_words.length; i++){
				if (random_article_words[i].length > long_word_length) {
					if (verses_on && verse_index < random_article_words[i].verse ){
						verse_index = random_article_words[i].verse;
						content += split_verse(verse_index);
					}
					content += '<span class="word" data-absolute_order="' + random_article_words[i].absolute_order + '" data-order="' + random_article_words[i].order + '" data-verse="' + random_article_words[i].verse + '">' + random_article_words[i].word + '</span>';
				}
			}
		}
		else if (difficulty == langs['english'].difficulty_short ){
			for (var i = 0; i < random_article_words.length; i++){
				if (random_article_words[i].length < short_word_length) {
					if (verses_on && verse_index < random_article_words[i].verse ){
						verse_index = random_article_words[i].verse;
						content += split_verse(verse_index);
					}
					content += '<span class="word" data-absolute_order="' + random_article_words[i].absolute_order + '" data-order="' + random_article_words[i].order + '" data-verse="' + random_article_words[i].verse + '">' + random_article_words[i].word + '</span>';
				}
			}
		}
		else if (difficulty == langs['english'].difficulty_random ){
			for (var i = 0; i < random_article_words.length; i++){
				if (random_article_words[i].random < 1) {
					if (verses_on && verse_index < random_article_words[i].verse ){
						verse_index = random_article_words[i].verse;
						content += split_verse(verse_index);
					}
					content += '<span class="word" data-absolute_order="' + random_article_words[i].absolute_order + '" data-order="' + random_article_words[i].order + '" data-verse="' + random_article_words[i].verse + '">' + random_article_words[i].word + '</span>';
				}
			}
		}
		else if (difficulty == langs['english'].difficulty_first_letter ){
			for (var i = 0; i < random_article_words.length; i++){
					if (verses_on && verse_index < random_article_words[i].verse ){
						verse_index = random_article_words[i].verse;
						content += split_verse(verse_index);
					}
				content += '<span class="word" data-absolute_order="' + random_article_words[i].absolute_order + '" data-order="' + random_article_words[i].order + '" data-verse="' + random_article_words[i].verse + '">' + random_article_words[i].word + '</span>';
			}
		}
		//default - normal - all words
		else{
			for (var i = 0; i < random_article_words.length; i++){
					if (verses_on && verse_index < random_article_words[i].verse ){
						verse_index = random_article_words[i].verse;
						content += split_verse(verse_index);
					}
				content += '<span class="word" data-order="' + random_article_words[i].order + '" data-verse="' + random_article_words[i].verse + '">' + random_article_words[i].word + '</span>';
			}
		}


		content += '</dd>';
		content += '<div class="button button_skip">' + langs[language].skip + '</div>';
		$('.content').html( content );
		$('.options').removeClass('active');

		verse_index = 0;
		if (verse_index < random_article_words[0].verse ){
			verse_index = random_article_words[0].verse;
		}
		//place ordered words
		if (difficulty == langs['english'].difficulty_long ){
			for (var i = 0; i < random_article_words.length; i++){
				if (verses_on && verse_index < random_article_words[i].verse ) {
					verse_index = random_article_words[i].verse;
				}
				//if long enough add the blank space word to the ordered list
				if (random_article_words[i].length > long_word_length) {
					add_to_ordered_dd(verse_index, random_article_words[i].absolute_order, random_article_words[i].order);
				}
				//if not long enough, just add the word
				else {
					add_to_ordered_dd(verse_index, random_article_words[i].absolute_order, random_article_words[i].order, random_article_words[i].word);
				}
			}
		}
		else if (difficulty == langs['english'].difficulty_short ){
			for (var i = 0; i < random_article_words.length; i++){
				if (verses_on && verse_index < random_article_words[i].verse ) {
					verse_index = random_article_words[i].verse;
				}
				if (random_article_words[i].length < short_word_length) {
					add_to_ordered_dd(verse_index, random_article_words[i].absolute_order, random_article_words[i].order);
				}
				else {
					add_to_ordered_dd(verse_index, random_article_words[i].absolute_order, random_article_words[i].order, random_article_words[i].word);
				}
			}
		}
		else if (difficulty == langs['english'].difficulty_random ){

			for (var i = 0; i < random_article_words.length; i++){
				if (verses_on && verse_index < random_article_words[i].verse ) {
					verse_index = random_article_words[i].verse;
				}
				//console.log(i, random_article_words.length, verse_index, random_article_words[i].absolute_order, random_article_words[i].order);
				if (random_article_words[i].random < 1) {
					add_to_ordered_dd(verse_index, random_article_words[i].absolute_order, random_article_words[i].order);
				}
				else {
					add_to_ordered_dd(verse_index, random_article_words[i].absolute_order, random_article_words[i].order, random_article_words[i].word);
				}
			}
		}
		else if (difficulty == langs['english'].difficulty_first_letter ){
			for (var i = 0; i < random_article_words.length; i++){
				if (verses_on && verse_index < random_article_words[i].verse ) {
					verse_index = random_article_words[i].verse;
				}
				//console.log(i, verse_index, random_article_words[i].absolute_order, random_article_words[i].order, random_article_words[i].word, true);
				add_to_ordered_dd(verse_index, random_article_words[i].absolute_order, random_article_words[i].order, random_article_words[i].word, true);
			}
		}
		else {
			//nothing - all words are unordered
			clicked = 0;
		}
		//reset scores
		quiz_guesses_total = 0;
		quiz_guesses_correct = 0;
		quiz_guesses_incorrect_streak = 0;
		update_clicked();
	}
	function split_verse(v, dont_close){
		var c = '';
		if (dont_close == undefined || dont_close == null) {
			c = '</dd>';
		}
		if (verses_on){
			c += '<dd class="ordered" data-verse="' + v + '"><span class="verse_label">' + v + '</span></dd>';
			c += '<dd class="unordered" data-verse="' + v + '">';
			c += '<span class="verse_label">' + v + '</span>';
		}
		else {
			c += '<dd class="ordered" data-verse="' + v + '"></dd>';
			c += '<dd class="unordered" data-verse="' + v + '">';
		}
		return c;
	}
	function update_clicked(){
		$('.ordered .current').removeClass('current');
		//add class to style current blank for UI benefit
		//find next blank in ordered section
		if ( $('.ordered .word.blank').length > 0 ) {
			clicked = $('.ordered .word.blank').first().addClass('current').data('absolute_order');
			//console.log( 'first blank' );
		}
		//if no blank and no unordered nothing
		else if( $('.unordered .word').length <= 0 ) {
			//nothing
			//console.log( 'no blanks, no guesses - none' );
		}
		//if no blank find total
		else if ( $('.ordered .word').length > 0 ) {
			clicked = $('.ordered .word').length;
			//$('.ordered .word:last').addClass('current');
			//console.log( 'no blanks, total used' );
		}
		else{
			clicked = 0;
		}

		//console.log( clicked );
	}
	function show_hint(){
		if ( hints_on ) {
			$('.word').removeClass('hint');
			$('.unordered .word[data-absolute_order="'+clicked+'"]').addClass('hint');
			if ( $('.hint').length < 1 ){
				//find all right answers
				//console.log('none hinted');
				$('.unordered .word').each(function(i,e){
					var this_order = $(this).data('order');
					if( this_order.indexOf("," + clicked + ",") != -1 ) {
						$(this).addClass('hint');
					}
				});
			}
		}
	}
	function add_to_ordered_dd(verse, absolute_order, order, word, letter_only){
		var blank_class = '';
		// console.log('before', $('.ordered').text() );
		//console.log('adding to verse', verse );
		// console.log(verse, absolute_order, order, word, letter_only);
		if ( word == undefined || word == null || word == blank_string ) {
			word = blank_string;
			blank_class = 'blank';
		}
		if ( letter_only != undefined || letter_only != null || letter_only == true ) {
			var letter = word.charAt(0);
			word = letter + blank_string;
			blank_class = 'blank';
		}
		word_html = '<span class="word ' + blank_class + '" data-absolute_order="' + absolute_order + '" data-order="' + order + '">' + word + '</span>';
		var added = false;
		var order_ar = order.split(',');
		//remove last and first ','
		order_ar.shift();
		order_ar.pop();
		if ($('.ordered[data-verse="' + verse + '"] .word').length > 0) {
			//for (var j = 0; j < order_ar.length; j++){ /* BUG IS HERE TODO: BUGFIX */
				//console.log('order array', j, order_ar[j]);
				//order = parseInt(order_ar[j]);
				order = absolute_order;
				$('.ordered[data-verse="' + verse + '"] .word').each(function(i,e){
					/* order is an array of each value. use first one and if it already exists check the next one. check each order value */

					//console.log(i, order, $(this).data('order'));
					if (!added){
						//this order is already here and is "___", replace it
						if ( parseInt($(this).data('absolute_order')) == order && $(this).hasClass('blank') ) {
							//console.log(word, order, 'replacewith', $(this).data('absolute_order'), $(this).text());
							$(this).replaceWith(word_html);
							$(this).removeClass('blank');
							added = true;
		//console.log('after', $('.ordered').text() );
							return true;
						}
						//this order already here but not a blank spot, check the next index or order
						else if ( parseInt($(this).data('absolute_order')) == order && !$(this).hasClass('blank') ){
							//nothing - order will be incremented and checked again next go around in the for j loop
							//console.log(word, order, 'match found but not blank so continue from here with next order value', $(this).data('absolute_order'), $(this).text());
							j++;
							order = parseInt(order_ar[j]);
							//return true;
						}
						//found a higher order data attribte, add this one before that one
						else if ( parseInt($(this).data('absolute_order')) > order ) {
							//console.log(word, order, 'inserted before', $(this).data('absolute_order'), $(this).text());
							$(this).before(word_html);
							added = true;
		//console.log('after', $('.ordered').text() );
							return true;
						}
						else{
							//nothing, check the next one
							//console.log(word, order, 'not added here, continue');
						}
					}
				});

			//}
			//no place to insert, add it to the end - the order is after the last word 
			if (!added) {
				//console.log(word, order, 'appended to end');
				$('.ordered[data-verse="' + verse + '"]').append(word_html);
		//console.log('after', $('.ordered').text() );
				return true;
			}
		}
		//no words yet, add this first one
		else {
			$('.ordered[data-verse="' + verse + '"]').append(word_html)
			//console.log(word, 'added first one', absolute_order, order);
		//console.log('after', $('.ordered').text() );
			return true;
		}
	}


	$('.content').on('click touchstart', '.unordered .word', function(e){
		if (!touching || has_class_no_touch ) {
			touching = true;
			quiz_guesses_total++;
			var this_order = $(this).data('order');
			//console.log(this_order, clicked, this_order.indexOf("," + clicked + ","));
			//simple order
			// if ( this_order == clicked ) {
			// 	$(this).addClass('clicked');
			// 	clicked++;
			// }
			//multiple order
			if( this_order.indexOf("," + clicked + ",") != -1 ) {
				quiz_guesses_correct++;
				quiz_guesses_incorrect_streak = 0;
				//$(this).addClass('clicked');
				//remove clicked word and append to a preceding div
				//$('.ordered').append( $(this) );
				add_to_ordered_dd( $(this).data('verse'), clicked, $(this).data('order'), $(this).text() );
				$(this).remove();
				//clicked++;
				//remove empty verse dd
				$('.unordered').each(function(i,e){
					//console.log($(this).find('.word').length );
					if ( $(this).find('.word').length <= 0 ){
						$(this).addClass('empty');
					}
				});
				//remove hints (in case more than one match)
				$('.word').removeClass('hint');
			}
			else {
				quiz_guesses_incorrect_streak++;

				if (quiz_guesses_incorrect_streak >= quiz_guesses_incorrect_streak_for_hint) {
					show_hint();
				}
			}
			//console.log(quiz_guesses_correct, '/', quiz_guesses_total);
			update_clicked();
			//console.log($('.unordered .word').length);
			//show next
			if ( $('.unordered .word').length < 1) {
				$('.unordered').addClass('empty');
				$('.button_skip').text( langs[language].next );
				$('.button_skip').after( "<div class='button button_again'>" + langs[language].again + "</div>" );
				var score = parseInt( (quiz_guesses_correct / quiz_guesses_total) * 100 );
				$('dt').append(" - " + score + "%");

				if ( keep_log ) {
					var now = new Date();
					var timestamp = now.getTime();
					//save completed article, difficulty level and score and timestamp to local storage to be displayed on the activity log page.
					activity_log.unshift({
						s: score,
						d: difficulty,
						t: timestamp,
						i: quiz_article
					});
					// = quiz_article + ',' + difficulty + ',' + score + ',' + timestamp + '|' + activity_log;
					localStorage.activity_log = JSON.stringify(activity_log);
					//console.log (activity_log, JSON.stringify(activity_log) );
				}
/*
To track an event, call (oddly enough) trackEvent(). trackEvent takes 6 arguments;

1)  resultHandler - a function that will be called on success
2)  errorHandler - a function that will be called on error.
3)  category - This is the type of event you are sending such as "Button", "Menu", etc.
4)  eventAction - This is the type of event you are sending such as "Click", "Select". etc.
5)  eventLabel - A label that describes the event such as Button title or Menu Item name.
6)  eventValue - An application defined integer value that can mean whatever you want it to mean.
*/
				gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Level", "Finish", active_cannon[ quiz_article ].reference, score);
			}
			//console.log('score :', quiz_guesses_correct / quiz_guesses_total);
		}
	});

var article_words
	function randomize_aof(article){
		//console.log('randomize_aof()');
		//split article into array of words in correct order

		//split array into verses first to seperate the verses for easier scrambles
		var article_verse_words = active_cannon[article].verse.split('  ');
		var article_verses = active_cannon[article].digits.split(' ');
		article_words = [];
		global_order = 0;
		for (var j = 0; j < article_verse_words.length; j++){
			var article_word = article_verse_words[j].split(' ');
			//copy words into array with correct order vars
			for (var i = 0; i < article_word.length; i++){
				article_words.push({ 
					word: article_word[i], 
					order: global_order,
					absolute_order: global_order,
					odd: i % 2,
					length: article_word[i].length,
					verse: article_verses[j],
					random: Math.round( Math.random() )
				});
				global_order++;
			}
		}
		//console.log(article_words);
		//alphabetize
		article_words.sort(
			function compare(a,b) {
			  if (a.word < b.word)
			     return -1;
			  if (a.word > b.word)
			    return 1;
			  return 0;
			}
		);
		//console.log(article_words);
		for (var i = 0; i < article_words.length; i++){
			//console.log(article_words[i].word);
			if ( i < article_words.length-1 && article_words[i].word == article_words[i+1].word ){
				var j,k = i;
				var ik_order = ',';
				var ik_order_ar = [];
				for (j = i; j < article_words.length;j++){
					if ( article_words[i].word == article_words[j].word ){
						k=j;
						ik_order += article_words[j].order + ',';
						ik_order_ar.push(article_words[j].order);
						//console.log(ik_order);
					}
				}
				ik_order_ar.sort(function(a,b){return a-b});
				for (j = i; j <= k; j++){
					article_words[j].order_ar = ik_order_ar;
					ik_order = ',' + ik_order_ar.join() + ',';
					article_words[j].order = ik_order;
				}	
				i = k;
			}
			else{
				article_words[i].order = ',' + article_words[i].order + ',';
				article_words[i].order_ar = new Array();
				article_words[i].order_ar[0] = article_words[i].order;
				//console.log(article_words[i].order);
			}
		}
		//random sort
		article_words.sort(
			function() {
				return 0.5 - Math.random();
			}
		);
		return article_words;
	}

	function nativePluginResultHandler(){
		//success
		//console.log('nativePluginResultHandler', 'success');
	}
	function nativePluginErrorHandler() {
		//error
		//console.log('nativePluginErrorHandler', 'fail');
	}
	function goingAway() {
		gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "App", "End", quiz_article);
	    gaPlugin.exit(nativePluginResultHandler, nativePluginErrorHandler);
	}


	function relative_time(time) {
      var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
      var delta = parseInt((relative_to.getTime() - time) / 1000);
      var r = '';
      if (delta < 20) {
        r = 'just now';
      } else if (delta < 60) {
        r = delta + ' seconds ago';
      } else if(delta < 120) {
        r = 'a minute ago';
      } else if(delta < (45*60)) {
        r = (parseInt(delta / 60, 10)).toString() + ' minutes ago';
      } else if(delta < (2*60*60)) {
        r = 'an hour ago';
      } else if(delta < (24*60*60)) {
        r = (parseInt(delta / 3600, 10)).toString() + ' hours ago';
      } else if(delta < (48*60*60)) {
        r = 'a day ago';
      } else {
        r = (parseInt(delta / (24*60*60))).toString() + ' days ago';
      }
      return r;
    }


	init();
});