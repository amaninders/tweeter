$(document).ready(function(){
  $('#tweet-text').on('keyup change paste', function(){

		let tweetText = $(this).val();
    let tweetLength = tweetText.length;
    let charactersRemaining = 140 - tweetLength; 
		
		$('output').text(charactersRemaining).css('color', charactersRemaining < 0 ? 'red' : '');

  });
});
