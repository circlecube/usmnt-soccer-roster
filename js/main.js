if (!window.console) console = {log: function() {}};
/*

*/
var gaPlugin;
var activity_log = [];
var completed = [];
var touching = false;
var keep_log = true;
var clicked;
var has_class_no_touch = false;
var num_total = 0;
var num_correct = 0;
var level = 0;
var num_levels = 4;

var levels = [
    ['Face to the Name', "You'll be given a name and 4 faces. Select the correct face for that name. To finish the quiz you must correctly know all the faces, on your first answer. If you miss, keep guessing until you get it right (and learn) because the name will come again during your quiz. The more you get wrong, the longer the quiz gets.", "name", "img"],
    ['Name that Face', "You'll be given a face and 4 names. Select the correct name for the face. To finish the quiz you must correctly know all the names, on your first answer. If you miss, keep guessing until you get it right (and learn) because the face will come again during your quiz.", "img", "name"],
    ['When they were young(er)',"You'll be given a name and 4 faces of when they were younger. Select the correct face for the name. To finish the quiz you must correctly know all the faces, on your first answer.", "name", "photo[1]"],
    ['Who Came First', "You'll be asked about which leader was called first, and second and so on. These questions are in order, but you still need to answer them all correctly. If you miss, keep guessing until you get it right and the quiz will continue.", "ordinal", "img"]
];
/*  
    ['Last Conference', "You'll be given a topic or conference talk title. Select the face of who gave that talk in their last General Conference appearance. To finish the quiz you must correctly know all the topics, on your first answer. Need help? Go check out the latest conference!", "img", "conference"],
    ['Career'],
    ['Mantra']
*/
var start_time = new Date();
var end_time = new Date();
var seconds = 0; // (start_time - end_time)/-1000;
var perfect = ['Perfect!', 'Thou art the Man!', 'Flawless!', 'Amazing!', 'On a Roll!', 'Impeccable!', 'Inspired!', 'Superb!', 'Unblemished!', '=D'];
var kudos =  ['Great!', 'Awesome!', 'Well done,', 'You\'re Smart,', 'Crazy Good!', 'Feelin\' it!', 'Dynamite!', 'Gold Star!', 'Impressive!', 'Exactly!', 'Correct!', '=)', 'Bingo!', 'On the nose!', 'Right!', 'Right on!', 'Righteous!', '', 'Inspiring!', 'Precisely!', 'Exactly!', 'Right as Rain!', ''];
var banter = ['Ouch!', 'Doh!', 'Focus, only', 'Finger Slip?', 'Don\'t Give Up!', 'Good Grief!', 'Embarrasing!', 'Wrong!', 'Guessing?', 'Nobody\'s Perfect', 'Incorrect!', '=(', 'You Blew It!', 'Negative!', 'You Must Be Joking!', 'Woah!', 'Need Help?', 'Try Studying,', 'Incorrect!', 'False!', 'Make sure to keep your eyes open.', 'Try Again,', 'Two wrongs does not make a right.', 'Nice try, '];


var active_team = usmnt_players;
var active_team_title = 'USMNT';
var list_player;
var list_player_template;

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

		//setup handlebars
		list_player = $("#list_player").html();
		list_player_template = Handlebars.compile(list_player);

		game_players();
	}

	function onDeviceReady() {
		//https://github.com/phonegap-build/GAPlugin/blob/c928e353feb1eb75ca3979b129b10b216a27ad59/README.md
		//gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Button", "Click", "event only", 1);
	    gaPlugin = window.plugins.gaPlugin;
//	    gaPlugin.init(nativePluginResultHandler, nativePluginErrorHandler, "UA-1466312-12", 10);

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

	function game_players(){
		new_question();
	}

	function list_players(){
		var players = '';

		for ( var i = 0; i < active_team.length; i++){
			players += list_player_template(
						{
							index: i, 
							player: active_team[i]
						});
		}

		$('.title').text( 'USMNT Roster' );
		$('.content').html(players);

		$('article dd').each(function(idx,e){
			//$(this).slideUp();
		});
		$('.score').html('');
	}

	function new_question(){
	    
	    make_question(active_team, get_random_groupindex(active_team));

	}
	function make_question(group, answer_index){
	    //get mc answers
	    var mc_answers = get_random_mc_answers(group, answer_index);
	    switch(levels[level][0]) {
	        case 'Face to the Name': //photo
	            $('.content').html('<h2 class="question">' + group[answer_index].player + '</h2>');
	            for (var i = 0; i < 4; i++){
	                $('.content').append(get_answer_div(group,mc_answers,i,2));
	            } 
	          break;
	        case 'Last Conference': //photo
	            $('.content').html('<h2 class="question">' + group[answer_index].conference + '</h2>');
	            for (var i = 0; i < 4; i++){
	                $('.content').append(get_answer_div(group,mc_answers,i,0));
	            } 
	          break;
	        case 'When they were young(er)': //young photo
	            $('.content').html('<h2 class="question">' + group[answer_index].player + '</h2>');
	            for (var i = 0; i < 4; i++){
	                $('.content').append(get_answer_div(group,mc_answers,i,1));
	            }
	          break;
	        case 'Who Came First': //order
	            $('.content').html('<h2 class="question">Called ' + group[answer_index].ordinal +  '</h2>');
	            for (var i = 0; i < 4; i++){
	                $('.content').append(get_answer_div(group,mc_answers,i,0));
	            }
	          break;
	        case 'Name that Face': //name
	            $('.content').html('<div class="question"><span class="img"><img src="img/' + group[answer_index].img + '" alt="guess my name" /></span></div>');
	            var answers = '<div class="answers">';
	            for (var i = 0; i < 4; i++){
	                answers += get_answer_div(group,mc_answers,i,0);
	            }
	            $('.content').append( answers +'</div>');
	          break;
	        default:
	          //error
	    }
	    

	    var correct = $.inArray(answer_index, mc_answers);
	    $('.answer_'+correct).parent().addClass('correct');
	}
	function get_answer_div(group, mc_answers, index, img){
	    var answer_div = "";
	    switch(levels[level][0]) {
	        //photo and young photo as default
	        case 'Who Came First': //order
	            answer_div = '<div class="answer" data-id="' + mc_answers[index] + '"><img class="answer_' + index + '" src="img/' + group[mc_answers[index]].photo[img] + '" alt="' + group[mc_answers[index]].player + ', ' + group[mc_answers[index]].ordinal  + '" /></div>';
	          break;
	        case 'Name that Face': //name
	            answer_div = '<div class="answer answer_name" data-id="' + mc_answers[index] + '"><p class="answer_' + index + ' label">' + group[mc_answers[index]].player + '</p></div>';
	          break;
	        default: //photo, young photo
	            answer_div = '<div class="answer" data-id="' + mc_answers[index] + '"><img class="answer_' + index + '" src="img/' + group[mc_answers[index]].img + '" alt="' + group[mc_answers[index]].player + '" /></div>';
	          //error
	    }
	    return answer_div;
	}

	function get_random_mc_answers(group, correct){
	    var generated = [];
	    generated.push(correct);
	    for (var i = 1; i < 4; i++) {
	        while(true){
	            var next = Math.floor(Math.random()*group.length);
	            if (0 > $.inArray(next, generated)) {
	                // Done for this iteration
	                generated.push(next);
	                break;
	            }
	        }
	    }
	    randomize(generated);
	    return generated;
	}
	function get_random_groupindex(group){
	    var random_index = Math.floor(Math.random()*group.length);
	    //console.log(completed.toString(), random_index, $.inArray(random_index, completed));
	    if ( $.inArray(random_index, completed) < 0 ){
	        //console.log('unique found');
	        return random_index;
	    }
	    else if( completed.length == group.length ){
	        completed = [];
	        return random_index;
	    }
	    else{
	        //console.log('potential repeat found');
	        return get_random_groupindex(group);
	    }
	}
	function get_random_index(group){
	    var random_index = Math.floor(Math.random()*group.length);
	    return random_index;
	}
	function randomize(myArray) {
	  var i = myArray.length, j, tempi, tempj;
	  if ( i == 0 ) return false;
	  while ( --i ) {
	     j = Math.floor( Math.random() * ( i + 1 ) );
	     tempi = myArray[i];
	     tempj = myArray[j];
	     myArray[i] = tempj;
	     myArray[j] = tempi;
	   }
	}


	$('.content').on('click', '.answer', function(e){
	    $(this).addClass('clicked');
	    var is_correct = false;
	        end_time = new Date();
	        time = start_time - end_time;

	    if ( $(this).hasClass('correct') ){
	        is_correct = true;
	        //calculate total clicked answers for this question
	        var num_clicked = $('.clicked').length;
	        if ( num_clicked == 1 || levels[level][0] == 'Who Came First'){
	            //console.log('correct logged for ' + $(this).find('img').attr('alt'));
	            //add correct to completed list - it there are no other previous wrong answers
	            completed.push( parseInt($(this).attr('data-id')) );
	            num_correct++;
	        }
	    }
	    
	    if( $(this).find('img').attr('alt') != undefined ) {
	        $(this).prepend( '<p class="label">' + $(this).find('img').attr('alt') +'</p>' );
	    }

	        end_time = new Date();
	        seconds = Math.floor( (start_time - end_time ) / -1000);
	        var correct_per_minute = Math.round( (num_correct / seconds ) * 60 );
	    //console.log( correct_per_minute );
	    //update score + feedback
	    $('.score').html('<h3/>');
	    //if round complete
	    //console.log(is_correct, num_correct, active_team.length, num_total);
	    if( is_correct && num_correct == active_team.length ) {
	        // _gaq.push(['_trackEvent', 'Answer', 'correct', $(this).find('img').attr('alt') ]);
	        // _gaq.push(['_trackEvent', 'Level', 'finish', levels[level][0], correct_per_minute ]);

	        $('.score h3').html(kudos[get_random_index(kudos)] + ' You Know All ' + active_team.length + '! ');
	        $('.score h3').append( parseInt(num_correct / (num_total+1)*100 ) + '% Accuracy! ');
	        //$('.score h3').append('That\'s a rate of '+ correct_per_minute + ' correct answers a minute!');
	        completed.length = 0;
	        num_total = -1;
	        num_correct = 0;
	        is_correct = false;
	        if(level+1 == num_levels && num_levels < levels.length) {
	            num_levels++;
	            localStorage.setItem("unlocked", num_levels);
	            $('.score h3').append('<h3 class="level_complete">You unlocked a new level!</h3>');
	            //console.log('new level unlocked: '+num_levels);
	        }
	        else{
	            $('.score h3').append('<h3 class="level_complete">Play another level?</h3>');
	        }
	        level = 0;
	        //init_levels();
	        $('.content').html('');
	    }
	    //perfect score
	    else if ( is_correct && num_correct > num_total ){
	        $('.score h3').append(perfect[get_random_index(perfect)]);
	        $('.score h3').append(' You know ' + num_correct + ' ' + active_team_title );
	        if (num_correct > 1){ $('.score h3').append('s'); }
	        $('.score h3').append( '! ' + parseInt(active_team.length - completed.length)  + ' left. ');
	        //$('.score h3').append( seconds + ' seconds! ');
	        // _gaq.push(['_trackEvent', 'Answer', 'correct', $(this).find('img').attr('alt') ]);
	    }
	    //correct answer
	    else if (is_correct){
	        $('.score h3').append(kudos[get_random_index(kudos)]);
	        $('.score h3').append(' You know ' + num_correct + ' ' + active_team_title );
	        if (num_correct > 1){ $('.score h3').append('s'); }
	        $('.score h3').append( '! ' + parseInt(active_team.length - completed.length)  + ' left. ');
	        //$('.score h3').append( seconds + ' seconds! ');
	        // _gaq.push(['_trackEvent', 'Answer', 'correct', $(this).find('img').attr('alt') ]);
	    }
	    //incorrect answer
	    else{
	        $('.score h3').append(banter[get_random_index(banter)]);
	        $('.score h3').append(' You know ' + num_correct + ' ' + active_team_title );
	        if (num_correct > 1){ $('.score h3').append('s'); }
	        $('.score h3').append( '! ' + parseInt(active_team.length - completed.length)  + ' left. ');
	        //$('.score h3').append( seconds + ' seconds! ');
	        // _gaq.push(['_trackEvent', 'Answer', 'incorrect', $(this).find('img').attr('alt') +' mistaken for ' + $(this).parent().find('.correct img').attr('alt') ]);
	    }

	    num_total++;

	    if( is_correct ){
	        //num_total++;
	        //advance to next question
	        setTimeout(function() {
	            new_question();
	        }, 750);
	    }
	});


	$('.content').on('click touch', 'article dt', function(e){
		$(this).next('dd').slideToggle();
		$(this).toggleClass('active');
	});

	$('.list_all').on('click touch', function(e){
		list_players();
	});
	$('body').on('touchstart', function(){
		// commented for browser dev only??
		//touching = true;
	});
	$('body').on('touchend', function(){
		touching = false;
	});
	$('.quiz_begin').on('click touch', function(e){
		game_players();
	});
	$('.about').on('click touch', function(e){
		show_about();
	});
	$('.activity_log').on('click touch', function(e){
		show_activity_log();
	});
	$('.content').on('click touch', '.button_skip', function(e){
		game_players();
	});
	$('.content').on('click touch', '.button_again', function(e){
		quiz_article--;
		$(this).remove();
		game_players();
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
				content += active_team[ activity_log[i].i ].reference + ' ';
				// content += ' (' + activity_log[i].d + ') ';
				content += relative_time(activity_log[i].t) + '.</dd>';
			}
		}
		content += '<div class="button button_clear_log">' + langs[language].clear_log + '</div>';
		$('.content').html( content );
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