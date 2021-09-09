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

//generate a single html element with all the tweets
const renderTweets = function(tweets) {
	let output = '';
  for (const tweet of tweets) {
		output += createTweetElement(tweet);
	}
	return output;
}

//generate html for individual tweet
const createTweetElement = (obj) => {
	const output = `
	<article class="tweet">
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
return output;
}

//loadtweets from db
const loadTweets = () => {
	$.ajax('/tweets', { method: 'GET' })
	.then(function (tweets) {
		$('#tweets-container').empty(); //clear the existing tweets
		$('#tweets-container').append(renderTweets(tweets)); //append new tweets
	});
}

const createError = (code) => {

	// hashkey for common errors
	// we can add more to this and reuse the same function
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

	//generate error html
	const output = `
	<div class="error--container">
		<div class="error--msg">
					<img src="${codeKey[code].img}" alt="error">
					<p>${codeKey[code].text}</p>
					<button class="close-btn">close</button>
		</div>
	</div>	
	`

	// append error to the form
	$form.after(output); 
	$('.error--msg').css('display', 'flex').attr('id', 'overlay'); // make error visible
	$('.error--msg > button.close-btn').on('click', () => { 
		$('.error--container').remove(); //handle close action for error
	});
	return;
}

$( document ).ready(function() {

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

	//render topUp button
	$(this).scroll(() => {
		$(window).scrollTop() > 600 ? $topUp.show() : $topUp.hide()
	})


	//move to top of the page
	$('#topUp').on('click', () => {
		window.scrollTo(0, 0);
		if ( $tweetSection.css('display') !== 'flex') {
			$('section.new-tweet').toggleClass('visible');
		}
		$form.find('#tweet-text').focus();
	})

	// post tweet on form submit
	$form.submit(function( e ) {
		
		e.preventDefault(); //prevent default form submission
		
		$postData = $form.serialize();
		$tweet = $form.find('#tweet-text');
		$tweetLength = $tweet.val().length;

		//return error if tweet is empty
		if (!$tweetLength) {
			createError('deadTweet')
			return;
		}

		// return error if tweet has more than 140 chars
		if ($tweetLength > 140) {
			createError('longTweet')
			return;
		}

		// post data to route
		$.post( "/tweets", $postData, function() {
			$tweet.val(''); //clear the tweet form
			loadTweets(); //refetch tweets 
		});
	});

});