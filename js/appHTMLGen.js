function HTMLGenerator()
{

}

HTMLGenerator.generateTweetHTML = function(tweet){
	var biggerImage = tweet.avatar.split("_normal").join("");
	return '<div class="content">\
			<div class="stream-item-header">\
				<div class="account-group" href="http://twitter.com/' + tweet.username + '">\
					<img class="avatar" src="' + biggerImage + '">\
					<div class="accountInfo">\
						<strong class="fullname">' + tweet.full_name + '</strong>\
						<br><span class="username"><s>@</s><b>' + tweet.username + '</b></span>\
					</div>\
				</div>\
				<small class="time">\
					<a href="http://twitter.com/' + tweet.username + '/status/http://twitter.com/' + tweet.tweet_id + '" class="tweet-timestamp"></a>\
				</small>\
				<div class="smallTextHolder">\
					<p class="tweet-text">' + tweet.text + '</p>\
				</div>\
			</div>\
		</div>';
}

HTMLGenerator.generateBigTweetHTML = function(tweet){
	//console.log("Avatar " + tweet.avatar);
	var biggerImage = tweet.avatar.split("_normal").join("");
	return '<div class="content">\
			<div class="stream-item-header">\
				<div class="account-group big" href="http://twitter.com/' + tweet.username + '">\
					<img class="avatar" src="' + biggerImage + '">\
					<strong class="fullname">' + tweet.full_name + '</strong>\
					<span class="username"><s>@</s><b>' + tweet.username + '</b></span>\
					<p class="tweet-text">' + tweet.text + '</p>\
				</div>\
				<small class="time">\
					<a href="http://twitter.com/' + tweet.username + '/status/http://twitter.com/' + tweet.tweet_id + '" class="tweet-timestamp"></a>\
				</small>\
				<div class="mediaContainer">\
						<img class="media" src="'+tweet.media_url+'" >\
				</div>\
			</div>\
		</div>';
}

function GeneralStatic()
{

}

GeneralStatic.shuffle = function(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

GeneralStatic.getRandomAvailableTweetIndex = function(sourceArray, usedArray, minLength){
	var randomInt;

	if (sourceArray.length >= minLength)
	{
		do{
			randomInt = Math.floor(Math.random()*(sourceArray.length));
		}
		while (usedArray.indexOf(randomInt) != -1);
	}
	else
		randomInt = Math.floor(Math.random()*(sourceArray.length));

	return randomInt;
}

function TweetManager()
{

}


TweetManager.getNewTweets = function (url, textTweets, photoTweets, callback) {
	//if (arguments.length == 0)
	//	url = 'tweets/approved.json';
	//console.log(url);
	if (arguments.length == 0)
		return;

	//Update existing tweet timestamps
	jQuery("time.timeago").timeago();
	//photoTweets = [];

	//Sort into two lists...
	var tempTextTweets = [], tempPhotoTweets = [];
	$.getJSON(url, {}, function(data, textStatus) {
		$.each(data, function(index, tweet) {
			if (tweet.media_url != null && tweet.media_url != "")
			{
				//console.log("Found media: " + tweet.media_url);
				tempPhotoTweets.push(tweet);
			}
			else
				tempTextTweets.push(tweet);
		});

		//Loop through text for items to delete
		if (textTweets.length){
			TweetManager.removeDeleted(textTweets, tempTextTweets);
		}
		//console.log("Found "+tempTextTweets.length);
		//Loop through text for items to add
		TweetManager.addNew(textTweets, tempTextTweets);

		//Loop through photo for items to delete
		if (photoTweets.length){
			TweetManager.removeDeleted(photoTweets, tempPhotoTweets);
		}

		//Loop through photo for items to add
		TweetManager.addNew(photoTweets, tempPhotoTweets);

		//console.log(photoTweets.length);
		tempTweets = [];

		//updateTweetTimestamps();
		callback();
	});
}

TweetManager.getNewInstas = function (url, photoTweets, callback) {
	//if (arguments.length == 0)
	//	url = 'tweets/approved.json';
	if (arguments.length == 0)
		return;

	//Update existing tweet timestamps
	jQuery("time.timeago").timeago();
	//photoTweets = [];

	//Sort into two lists...
	var tempPhotoTweets = [];
	$.getJSON(url, {}, function(data, textStatus) {
		$.each(data, function(index, tweet) {
			tempPhotoTweets.push(tweet);
		});

		//Loop through photo for items to delete
		if (photoTweets.length){
			TweetManager.removeDeleted(photoTweets, tempPhotoTweets);
		}

		//Loop through photo for items to add
		TweetManager.addNew(photoTweets, tempPhotoTweets);

		//console.log(photoTweets.length);
		tempTweets = [];

		//updateTweetTimestamps();
		callback();
	});
}

TweetManager.removeDeleted = function (existingTweets, newTweets){
	for (var i=existingTweets.length-1; i>=0; i--)
	{
		var itemDeleted=true;
		$.each(newTweets, function(index, tweet){
			if (tweet.tweet_id == existingTweets[i].tweet_id)
			{
				itemDeleted=false;
				return;
			}
		});

		if(itemDeleted)
			existingTweets.splice(i,1);
	}
}

TweetManager.addNew = function (existingTweets, newTweets){
	$.each(newTweets, function(index, tweet) {
		var bFound=false;
		$.each(existingTweets, function(i, savedTweet){
			if(savedTweet.tweet_id == tweet.tweet_id)
			{
				bFound=true;
				return;
			}
		});

		if (bFound){
			//console.log("Already found tweet, skipping.")
			return;
		}

		//If we don't care about position, we can do this...
		//existingTweets.push(tweet);
		//Place in the array at the correct position...
		$.each(newTweets, function(i,tweet){
			var nextHighestIndex = -1;
			$.each(existingTweets, function(index, existingTweet)
			{
				if (tweet.tweet_id < existingTweet.tweet_id)
					nextHighestIndex = index;

			});

			if (nextHighestIndex > -1)
			{
				existingTweets.splice(nextHighestIndex,0,tweet);
			}
			else
			{
				existingTweets.splice(0,0,tweet);
			}

		});
	});
	console.log(existingTweets.length);
}
