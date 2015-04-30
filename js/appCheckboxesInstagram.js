var tweets = [],
	approvedTweets = [],
	fullTweetList = [],
	checkedTweetIDs = [],
	refreshIntervalID = -1,
	maxTweetsShown = 100,
	tweetFetchURL = 'instagram/getInstants.php',
	currentURL = 'instagram/getInstants.php',
	approvedURL = 'instagram/approved.json',
	tweet_list = $('ol.tweets');

function doFirstLoad() {
	var listToPostTo = approvedTweets;
	
	$.getJSON(approvedURL, {}, function(data, textStatus) {
		//Check for new tweets
		$.each(data, function(index, tweet) {
			tweets.push(tweet);
		});

		//Find each tweets index
		$.each(tweets, function(i,tweet)
		{
			var nextHighestIndex = -1;
			$.each(listToPostTo, function(index, existingTweet)
			{
				if (tweet.tweet_id < existingTweet.tweet_id)
					nextHighestIndex = index;

			});

			if (nextHighestIndex > -1)
			{				
				listToPostTo.splice(nextHighestIndex+1,0,tweet);
			}
			else
			{
				listToPostTo.splice(0,0,tweet);
			}
			//console.log(tweet.tweet_id);
			checkedTweetIDs.push(tweet.tweet_id);
		});
		
		postTweetsToList(fullTweetList);

		tweets = [];
		//console.log("doFirstLoad json complete");
		
		getTweets(restoreChecked);
	});

}

function getTweets(callback) {
	var listToPostTo;
	if (tweetFetchURL == approvedURL)
		listToPostTo = approvedTweets;
	else if (tweetFetchURL == currentURL)
		listToPostTo = fullTweetList;
	else 
		return;

	//To avoid posting to the wrong list because of async getJSON method
	var localFetchingFromURL = tweetFetchURL;

	$.getJSON(tweetFetchURL, {}, function(data, textStatus) {
		
		//Check for new tweets
		$.each(data, function(index, tweet) {

			var bFound=false;
			$.each(listToPostTo, function(i, savedTweet){
				if(savedTweet.tweet_id == tweet.tweet_id)
				{
					bFound=true;
					return;
				}
			});

			if (bFound)
			{
				//console.log("Already found tweet, skipping.")
				return;
			}
			
			tweets.push(tweet);
		});

		if (tweetFetchURL != localFetchingFromURL)
			return;

		postTweetsToList(listToPostTo);

		if (callback != null)
		{
			callback();
		}
	});

	//If our list is WAAAY too long, remove some stuff
	if (listToPostTo.length > maxTweetsShown)
	{
		var tweetDeleteCount = listToPostTo.length - maxTweetsShown;
		listToPostTo.splice(maxTweetsShown,tweetDeleteCount);
		$('li').slice(maxTweetsShown).remove();
	}

	//Style our checkboxes
	setTimeout(styleCheckboxes,1500);
}

function postTweetsToList(listToPostTo)
{
	//Find each tweets index
	$.each(tweets, function(i,tweet)
	{
		var nextHighestIndex = -1;
		$.each(listToPostTo, function(index, existingTweet)
		{
			if (tweet.tweet_id < existingTweet.tweet_id)
				nextHighestIndex = index;

		});

		if (nextHighestIndex > -1)
		{
			if (nextHighestIndex == listToPostTo.length)
			{
				//Add to the end
				appendOldTweet(tweet);
			}
			else
			{
				//Add in place
				spliceOldTweet(tweet, listToPostTo[nextHighestIndex].tweet_id);
			}
			
			listToPostTo.splice(nextHighestIndex+1,0,tweet);
		}
		else
		{
			//console.log("Insert before 0");
			prependNewTweet(tweet);
			listToPostTo.splice(0,0,tweet);
		}
	});

	tweets = [];
}

function displayTweetList(tweets)
{
	$.each(tweets, function(i,tweet)
	{
		appendOldTweet(tweet);
	});
}

function appendOldTweet(tweet){
	var tweetHTML;

	if (tweetFetchURL == approvedURL)
		tweetHTML = generateTweetHTML(tweet,true);
	else
		tweetHTML = generateTweetHTML(tweet,false);
	
	//$(tweetHTML."input[type=checkbox]").altCheckbox();

	$(tweetHTML)
		.appendTo(tweet_list)
		.focus()
		.addClass('on')
		;
}

function prependNewTweet(tweet) {
	var tweetHTML;

	if (tweetFetchURL == approvedURL)
		tweetHTML = generateTweetHTML(tweet,true);
	else
		tweetHTML = generateTweetHTML(tweet,false);
	
	//$(tweetHTML."input[type=checkbox]").altCheckbox();

	$(tweetHTML)
		.prependTo(tweet_list)
		.focus()
		.addClass('on')
		;
}

function spliceOldTweet(tweet, tweet_id) {
	var tweetString = '.tweet[value="'+tweet_id+'"]';
	var tweetHTML;

	if (tweetFetchURL == approvedURL)
		tweetHTML = generateTweetHTML(tweet,true);
	else
		tweetHTML = generateTweetHTML(tweet,false);

	//(tweetHTML."input[type=checkbox]").altCheckbox();

	$(tweetHTML)
		.insertAfter(tweetString)
		.focus()
		.addClass('on')
		;
}

function updateTweetTimestamps(){
	jQuery("time.timeago").timeago();
}

function generateTweetHTML(tweet, bChecked){
	console.log(tweet.tweet_id);
	var checkboxString = '<input class="tweetCB" type="checkbox" tweet="'+tweet.tweet_id+'"onchange="checkboxToggled('+tweet.tweet_id+')"';
	if (bChecked)
		checkboxString = checkboxString + ' checked';
	checkboxString = checkboxString + '>';

	var imageString = "";
	if (tweet.media_url != null){
		imageString = '<a href="'+tweet.media_url+'"><img class="media" src="'+tweet.media_url+'" ></a>';
	}

	var returnString = '<li class="tweet" value="'+ tweet.tweet_id +'">\
		<div class="content">' +
			'<div class="stream-item-header">\
				<div class="avatarAndCheckbox">' +
					checkboxString + 
					'<a class="account-group" href="http://instagram.com/' + tweet.username + '" >\
					<img src="' + tweet.avatar + '" width="48" height="48">\
				</div>\
					<strong class="fullname">' + tweet.full_name + '</strong>\
					<span class="username"><s>@</s><b>' + tweet.username + '</b></span>\
				</a>\
				<small class="time">\
					<a href="http://twitter.com/' + tweet.username + '/status/http://twitter.com/' + tweet.tweet_id + '" class="tweet-timestamp"><span class="timestamp"><time class="timeago" datetime="' + tweet.created_at + '">' + jQuery.timeago(tweet.created_at) + '</time></span></a>\
				</small>\
			</div>\
			<p class="tweet-text">' + tweet.text + '</p>\
			'+imageString+'\
		</div>\
	</li>';

	return(returnString);
}

function checkboxToggled(tweet_id){
	//We don't actually do anything here, we just needed a parameter to store the tweet_id in

	//console.log("Toggled Checkbox " + tweet_id);
	//console.log($('.tweet[value="'+tweet_id+'"] input').checked);
	//console.log($( "input:checked" ).length);
}

function outputChecked(){
	/*Not sure if it would be faster, but we could just get all checked like this:
	$( "input:checked" )
	And just check the on checked value...
	*/

	$.each($("input[type=checkbox]"), function(index, tweet){
		var tweetID = String(tweet.onchange).split("checkboxToggled(")[1].split(")")[0];
		if (tweet.checked)
		{
			//If this isn't already checked, check it.
			if (checkedTweetIDs.indexOf(tweetID) == -1)
				checkedTweetIDs.push(tweetID);
		}
		else
		{
			var arrayPos = checkedTweetIDs.indexOf(tweetID);
			//If we find the tweet, remove it
			if (arrayPos != -1)
			{
				console.log("Removing unchecked...");
				checkedTweetIDs.splice(arrayPos,1);
			}
				
		}
	});
}

function restoreChecked(){
	$.each($("input[type=checkbox]"), function(index, tweet){
		//console.log(index);
		var tweetID = (String(tweet.onchange).split("checkboxToggled(")[1].split(")")[0]);

		if (checkedTweetIDs.indexOf(tweetID) != -1)
			tweet.checked = true;
		else
			tweet.checked = false;
	});
	//console.log("restoreChecked complete");
}

function allClicked(){
	outputChecked();

	$("ol").empty();
	tweetFetchURL = currentURL;
	displayTweetList(fullTweetList);
	
	restoreChecked();

	$(".tweet-wall h2").html("All Tweets");

	if(refreshIntervalID == -1)
	{
		getTweets();
		refreshIntervalID = setInterval(getTweets, 5000);
	}
}

function approvedClicked(){
	if (tweetFetchURL == approvedURL)
		return;

	if (refreshIntervalID != -1)
	{
		clearInterval(refreshIntervalID);
		refreshIntervalID = -1;
	}

	//Clear list BEFORE checking
	allCheckedTweetIDs = [];
	outputChecked();

	$.each($("input[type=checkbox]"), function(index, tweet){
		if(tweet.checked)
		{
			//console.log(fullTweetList[index].tweet_id);
			var alreadyExists = false;

			var nextHighestIndex = -1;
			$.each(approvedTweets, function(i, existingTweet)
			{
				if (fullTweetList[index].tweet_id == existingTweet.tweet_id)
				{
					alreadyExists = true;
					return;
				}
				if (fullTweetList[index].tweet_id < existingTweet.tweet_id)
					nextHighestIndex = i;

			});

			if (alreadyExists==true)
				return;
			
			//console.log(nextHighestIndex);
			if (nextHighestIndex > -1)
			{
				//console.log("Adding clicked tweet after: " + nextHighestIndex+1 + ", new tweet_id: " + fullTweetList[index].tweet_id + ", appended after tweet_id: " + approvedTweets[nextHighestIndex+1].tweet_id);
				approvedTweets.splice(nextHighestIndex+1,0,fullTweetList[index]);
			}
			else
			{
				//if(approvedTweets.length)
				//	console.log("Adding clicked tweet to end, " + fullTweetList[index].tweet_id + " is > " + approvedTweets[approvedTweets.length-1].tweet_id);
				approvedTweets.splice(0,0,fullTweetList[index]);
			}
		}
	});

	$("ol").empty();
	tweetFetchURL = approvedURL;
	displayTweetList(approvedTweets);

	restoreChecked();

	$(".tweet-wall h2").html("Approved Tweets");
	getTweets();
}

function saveClicked(){
    var i, checkboxes = [], inputs = document.getElementsByTagName("input");
    var tweetsToSave = [];
    //Find all the checkboxes, if we put them in an array, the indexes should match up with the tweet indexes
    for (i = 0; i < inputs.length; i++) {
        if (inputs[i].type === "checkbox")
            checkboxes.push(inputs[i]);
    }

    //console.log(checkboxes.length + ", " + approvedTweets.length);
    //Loop through backwards so we don't mess with the order
    for(i=checkboxes.length-1; i>=0; i--){
    	//If the checkbox isn't checked, remove it.
    	if (checkboxes[i].checked){
    		if (tweetFetchURL == approvedURL)
    		{
    			//Ignore empty objects
    			if (approvedTweets[i] != null && approvedTweets[i] != "")
    				tweetsToSave.push(approvedTweets[i]);
    		}
    		else if (fullTweetList[i] != null && fullTweetList[i] != "")
    			tweetsToSave.push(fullTweetList[i]);
    	}
    		
    }
    //console.log(checkboxes.length + ", " + approvedTweets.length);
    
	var encoded = tweetsToSave;

	$.post('./instagram/saveJSON.php', {json: encoded}, function(){
		location.reload();
	});
}

function styleCheckboxes()
{
	$("input[type=checkbox]").altCheckbox();
}

function checkAll(){
	//$(".tweetCB").prop('checked', true);
	console.log("Check shit");
	$.each($(".tweetCB"), function(index, tweet){
		console.log("I am "+tweet.checked);
		tweet.checked = true;
	});
}

function uncheckAll(){
	//$(".tweetCB").prop('checked', false);
	console.log("UNCheck shit");
	$.each($("input[type=checkbox]"), function(index, tweet){
		tweet.checked = false;
	});
}

doFirstLoad();

//Refresh every 2 seconds
refreshIntervalID = setInterval(getTweets, 5000);
setInterval(updateTweetTimestamps, 5000);