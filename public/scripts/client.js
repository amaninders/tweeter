/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

//escape dangerous html to prevent xss
const escape = function (str) {
  let div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

//load tweets from db
const loadTweets = () => {
	$.ajax('/tweets', { method: 'GET' })
	.then(function (tweets) {
		$('#tweets-container').empty(); //clear the existing tweets
		$('#tweets-container').append(renderTweets(tweets)); //append new tweets
	});
}

//generate html for individual tweet
const createTweetElement = (obj) => {
	const tweet = `
	<article class="tweet full border">
		<header>
			<span><img src="${obj.user.avatars}" alt="">&nbsp;&nbsp;&nbsp;${obj.user.name}</span>
			<span class="tweetHandle">${obj.user.handle}</span>
		</header>
		<p>${escape(obj.content.text)}</p>
		<footer>
		<span class="need_to_be_rendered" datetime="2016-07-07T09:24:17Z">${jQuery.timeago(new Date(obj.created_at))}</span>
			<span class="tweet-actions"><i class="fas fa-flag"></i> &nbsp; <i class="fas fa-retweet"></i> &nbsp; <i class="fas fa-heart"></i></span>
		</footer>
	</article>
`
return tweet;
}

// combine individual tweets into single element
const renderTweets = function(tweets) {
	let tweetList = '';
  for (const tweet of tweets) {
		tweetList += createTweetElement(tweet);
	}
	return tweetList;
}


const createError = (code) => {
	// hashmap for errors
	const codeKey = {
		'deadTweet' :  {
			img : "/images/error2.gif",
			text : "write a tweet hooman!!!"
		},
		'longTweet' : {
			img : "/images/error3.gif",
			text : "140 characters hooman???"
		}
	}

	//generate error html based on code
	const error = `
	<div class="error--container">
		<div class="error--msg">
					<img src="${codeKey[code].img}" alt="error">
					<p>${codeKey[code].text}</p>
					<button class="close-btn">close</button>
		</div>
	</div>	
	`
	return error;
}

// this function appends to the tweet container a list of tweets fetched above
const appendError = (errorCode) => {
	// append error to the form
	$form.parents('main.container').after(createError(errorCode)); 
	$('.error--msg').css('display', 'flex').attr('id', 'overlay'); // make error visible
	$('.error--msg > button.close-btn').on('click', () => { 
		$('.error--container').remove(); //handle close action for error
	});
	return;
}



const changeNavColor = (state) => {
	
	// we use the following object for navbar color properties 
	const navbarColors = {
		'top': {
			'background-color' : '#cced91',	
			'transition': '0.5s'
		},
		'scrolled': {
			'background-color' : 'transparent',	
			'transition': '0.5s'
		}
	}
	
	//function call to change the navbar colors
	$('nav').css(navbarColors[state]);
} 


const scrollingActions = () => {		
	// show topup button 
	$(this).scrollTop() > 400 ? $topUp.show() : $topUp.hide();	
	// change navbar bacground

	if($(this).width() <=	 1024) {
		return ($(this).scrollTop() > 342) ? changeNavColor('top'): changeNavColor('scrolled');
	}	
}

const handleResize = () => {
		if ($(this).width() >= 1024) {
			changeNavColor('top')
		}
}

const topUpToForm = () => {
	$(this).scrollTop(0); //back to top
	if ( $tweetSection.css('display') !== 'flex') {
		$('section.new-tweet').toggleClass('visible'); //show tweet textarea if hidden
	}
	$form.find('#tweet-text').focus(); //set cursor in the textarea
}


const formSubmit = (length, data, tweet) => {

	//return error if tweet is empty
	if (!length) {
		appendError('deadTweet')
		return;
	}

	// return error if tweet has more than 140 chars
	if (length > 140) {
		appendError('longTweet')
		return;
	}

	// post data to route
	$.post( "/tweets", data, function() {
		tweet.val(''); //clear the tweet form
		tweet.blur(); //this will reset the counter after submit	
		loadTweets(); //refetch tweets 
	});
}



$(function() {

	// load tweets when document is ready
	loadTweets(); 

	//assign global variables
	$form = $('section.new-tweet > form'); 
  $composeTweet = $('nav > button');
	$tweetSection = $('section.new-tweet');
	$topUp = $('#topUp');

	//toggle form on click
	$composeTweet.on('click', () => {
		$('section.new-tweet').toggleClass('visible');
	});

	//scroll actions	
	$(this).scroll(() => {
		scrollingActions();
	})

	// handle resize event
	$(window).resize(function() {
		handleResize();
	})


	//go back to the top of the page
	$('#topUp').on('click', () => {
		topUpToForm();
	})

	// post tweet on form submit
	$form.submit(function( e ) {
		e.preventDefault(); //prevent default form submission	

		//initialize variables for formSubmission
		$postData = $form.serialize();
		$tweet = $form.find('#tweet-text');
		$tweetLength = $tweet.val().length;

		formSubmit ($tweetLength, $postData, $tweet);
	});
	
});