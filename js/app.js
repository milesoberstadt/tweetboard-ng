//inUseTweets is for text tweets being used, inUsePhotoTweets is just the upper left of photo tweets
//reservedPhotoTweets is for making sure we don't overlap

var textTweets = [],
	photoTweets = [],
	instagrams = [],
	combinedPhotos = [],
	inUseTweets = [],
	inUsePhotoTweets = [],
	reservedPhotoTweets = [],
	tweet_list = $('ol.tweets'),
	tweetArea = $('div.tweet-wall'),
	bFirstLoad = true,
	boxPositions = [],
	boxRows = 0,//was 4
	boxCols = 0,//was 4,
	boxPadding = 10,
	bigBoxRows = 2,
	bigBoxCols = 2,
	maxBigBoxPercent = 0.5;

var bKeepRefreshing = true;
var refreshDelay = 5000,
	newTweetDelay = 20000;

var boxHeight = 0,
	boxWidth = 0;

var revealDelay = 750;

doInit();

$(window).resize(function () {
	console.log("Resize triggered");

	$(tweetArea).empty();
	inUseTweets = [];
	inUsePhotoTweets = [];
	reservedPhotoTweets = [];


	doInitialDraw(false);
});

function updateTweetTimestamps(){
}

function doInitialDraw(bSetEvents){
	console.log("Instas: "+instagrams.length);
	var areaWidth = $(tweetArea).width() - (boxPadding*boxCols);
	var areaHeight = $(tweetArea).height() - (boxPadding*boxRows);

	boxPositions = new Array();
	for(var row=0;row<boxRows;row++)
	{
		for (var col=0;col<boxCols;col++)
		{
			var x = ((col/(boxCols))*areaWidth) + (boxPadding*col);
			var y = ((row/(boxRows))*areaHeight) + (boxPadding*row);
			boxPositions.push(x.toString() + "," + y.toString());
		}
	}

	drawRegions();

	if (bSetEvents == true && bKeepRefreshing == true)
	{
		setInterval(randomRedraw, refreshDelay);
		setInterval(updateTweetLists, newTweetDelay);
	}
}

function drawRegions(){
	boxWidth = ($(tweetArea).width() - (boxPadding*boxCols)) / boxCols;
	boxHeight = ($(tweetArea).height() - (boxPadding*boxRows)) / boxRows;

	//inUseTweets = new Array();

	drawBigRegions();

	drawSmallRegions();
}

function randomRedraw(){
	var randomBox;
	var bBig = Math.floor(Math.random()*3);
	//console.log("bbig="+bBig);

	var randomLoopCount = 0;
	var bigBoxIndex = getBigBoxIndex();
	//console.log("Big box index: "+bigBoxIndex);
	//If we have space for a new big box, we should
	if (bigBoxIndex != -1)
	{
		//Flip boxes, then do other stuff...
		for (var row=bigBoxRows-1; row>=0; row--)
		{
			for(var col=bigBoxCols-1; col>=0; col--)
			{
				var position = (bigBoxIndex+col)+(row*boxCols);
				$('.box.small[value="'+position+'"]').addClass('flipping');
			}
		}

		//After flipping the four boxes, clean up and start making a big one
		setTimeout(function(){
			//Detatch smaller boxes there...in REVERSE order so all elements are removed correctly
			for (var row=bigBoxRows-1; row>=0; row--)
			{
				for(var col=bigBoxCols-1; col>=0; col--)
				{
					var position = (bigBoxIndex+col)+(row*boxCols);
					removeTextTweet(position);
				}
			}
		},revealDelay);

		prepBigBoxForDrawing(bigBoxIndex);
	}

	//Otherwise, if our random number isn't right, handle small box change
	else if (bBig != 0 || inUsePhotoTweets.length==0)
	{
		randomBox = getNonNullElement(inUseTweets);
		//Let me take some time to explain this
		//textTweetIndex: index from the text tweet array of what item we're getting rid of
		//boxIndex: array position of randomBox which corresponds to it's location on screen
		//We want to use the array index to access everything, not the actual text tweet index
		var textTweetIndex = randomBox;
		var boxIndex = inUseTweets.indexOf(textTweetIndex);

		//Flip, then destroy and continue
		$('.box.small[value="'+boxIndex+'"]').addClass('flipping');
		setTimeout(function(){
			//Delete old tweet
			removeTextTweet(boxIndex);
			//Add new one
			drawSmallBox(boxIndex);
		}, revealDelay);

	}

	//Otherwise, turn the big box into small ones
	else if (inUsePhotoTweets.length>0)
	{
		//Find our photobox
		randomBox = inUsePhotoTweets.indexOf(getNonNullElement(inUsePhotoTweets));

		//Flip, then destroy and continue
		$('.box.big[value="'+randomBox+'"]').addClass('flipping');
		setTimeout(function(){
			removePhotoTweet(randomBox);

			//Generate new text tweets at that location...
			for (var row=0; row<bigBoxRows; row++)
			{
				for(var col=0; col<bigBoxCols; col++)
				{
					var position = (randomBox+col)+(row*boxCols);
					drawSmallBox(position);
				}
			}
		},revealDelay);

	}
	//console.log("Done redrawing...");
}

function drawBigRegions(){
	var currentBigBoxes = 0;
	var singleBigBoxPercent = (bigBoxCols * bigBoxRows)/(boxCols*boxRows);
	while((currentBigBoxes+1)*singleBigBoxPercent <= maxBigBoxPercent)
	{
		if (currentBigBoxes == 0)
		{
			//First box can go almost anywhere randomly
			//Math.floor(Math.random() * max) + min);
			var randomCol = Math.floor(Math.random()*(boxCols-bigBoxCols+1));
			var randomRow = Math.floor(Math.random()*(boxRows-bigBoxRows+1));
			var boxIndex = randomCol + (randomRow*boxCols);
			console.log(randomCol+", "+randomRow);

			prepBigBoxForDrawing(boxIndex);
		}

		else
		{
			//See if we have space, if not, break
			var availableIndexes = [];
			for (var row=0; row<boxRows; row++)
			{
				for(var col=0; col<boxCols; col++)
				{
					var position = (row*boxCols)+col;
					//console.log(position);
					//Make sure we aren't aleady using this space
					if (inUseTweets[position] == null){
						//Make sure that if we put a box here it wouldn't be wider than the "table"
						if (col+bigBoxCols<=boxCols){
							//Make sure that the box wouldn't go past the bottom "edge"
							if (row+bigBoxRows<=boxRows){
								//Check for overlaps with inUseTweets
								var overlaps = false;
								for (var rOff=0; rOff<bigBoxRows;rOff++){
									for (var cOff=0; cOff<bigBoxCols; cOff++){
										var offsetPos = ((row+rOff)*boxCols)+col+cOff;
										//console.log("Checking at " + offsetPos);
										if (reservedPhotoTweets[offsetPos] != null)
										{
											//console.log("Overlap found at " + offsetPos);
											overlaps = true;
											break;
										}
									}
									//if (overlaps)
									//	break;
								}
								if (!overlaps){
									//console.log("We could totally put a box at " + position);
									availableIndexes.push(position);
								}
							}
						}
					}
				}
			}
			//Okay, we've found our list, let's randomize it
			availableIndexes = GeneralStatic.shuffle(availableIndexes);
			//var reconstructedCol = availableIndexes[0]%boxCols;
			//var reconstructedRow = Math.floor(availableIndexes[0]/boxRows);

			prepBigBoxForDrawing(availableIndexes[0]);
		}
		currentBigBoxes++;
	}

	//console.log("We can fit "+currentBigBoxes+" big boxes");
}

function prepBigBoxForDrawing(location){
	var randPhoto = GeneralStatic.getRandomAvailableTweetIndex(combinedPhotos, inUsePhotoTweets, 2);
	//console.log("Rand Photo: "+randPhoto);//combinedPhotos[randPhoto].avatar);
	//console.log("Setting Index: "+((reconstructedRow*boxCols)+reconstructedCol));
	inUsePhotoTweets[location] = randPhoto;

	//Make sure we mark those as read
	for (var row=0; row<bigBoxRows; row++)
	{
		for(var col=0; col<bigBoxCols; col++)
		{
			var position = (location+col)+(row*boxCols);
			//console.log(position);
			reservedPhotoTweets[position] = randPhoto;
		}
	}

	drawBigBox(location);
}

function drawSmallRegions(){
	if (textTweets.length == 0)
	{
		console.log("No text tweets to display...");
		return;
	}

	for (var i=0; i<boxPositions.length; i++)
	{
		if (reservedPhotoTweets[i] != null)
			continue;

		drawSmallBox(i);
	}
}

function drawSmallBox(boxIndex){
	if (boxIndex>=8)
		console.log("Looking for boxIndex " + boxIndex);
	var boxCoordinates = boxPositions[boxIndex];
	//if (boxPositions[boxIndex] == null)
	//	console.log(boxPositions);
	var x = parseFloat(boxCoordinates.split(",")[0]);
	var y = parseFloat(boxCoordinates.split(",")[1]);

	var randomInt = GeneralStatic.getRandomAvailableTweetIndex(textTweets, inUseTweets, boxCols*boxRows);

	inUseTweets[boxIndex] = (randomInt);

	var boxString = '<div class="box small" style="height: '+ boxHeight +'px; width: '
		+ boxWidth +'px; left: '+x+'px; top: '+y+'" value="'+boxIndex+'">\
	'+HTMLGenerator.generateTweetHTML(textTweets[randomInt])+'\
	</div>';
	$(tweetArea).append(boxString);
	$('.box[value="'+boxIndex+'"]').fitText();

	setTimeout(function(){
		$('.box[value="'+boxIndex+'"]').addClass('flipToNormal');
	}, revealDelay);
}

function drawBigBox(boxIndex){
	var boxWidth = ($(tweetArea).width() - (boxPadding*boxCols)) / boxCols;
	boxWidth = boxWidth*bigBoxCols;
	boxWidth += boxPadding;
	var boxHeight = ($(tweetArea).height() - (boxPadding*boxRows)) / boxRows;
	boxHeight = boxHeight*bigBoxRows;
	boxHeight += boxPadding;

	//console.log("Getting Index: " + boxIndex);
	var x = parseFloat(boxPositions[boxIndex].split(",")[0]);
	var y = parseFloat(boxPositions[boxIndex].split(",")[1]);

	//Pick a random photo tweet for displaying
	//console.log("photoTweets length "+photoTweets.length);

	var photoIndex = inUsePhotoTweets[boxIndex];
	//console.log("Tweet index: "+inUsePhotoTweets[boxIndex]);
	var boxString = '<div class="box big" style="height: '+ boxHeight +'px; width: '
		+ boxWidth +'px; left: '+x+'px; top: '+y+'" value="'+photoIndex+'">\
		'+HTMLGenerator.generateBigTweetHTML(combinedPhotos[photoIndex])+'\
		</div>';
		$(tweetArea).append(boxString);
	$('.box[value="'+boxIndex+'"]').fitText();
	
	setTimeout(function(){
		$('.box[value="'+photoIndex+'"]').addClass('flipToNormal');
	}, revealDelay);
}

function getBigBoxIndex()
{
	//First, compress the array to find only VALID entries
	var tempArray = inUsePhotoTweets.filter(function(n){ return n != undefined });
	var currentBigBoxes = tempArray.length;
	var singleBigBoxPercent = (bigBoxCols * bigBoxRows)/(boxCols*boxRows);
	if ((currentBigBoxes+1)*singleBigBoxPercent <= maxBigBoxPercent)
	{
		var availableIndexes = [];
		for (var row=0; row<boxRows; row++)
		{
			for(var col=0; col<boxCols; col++)
			{
				var position = (row*boxCols)+col;
				//console.log(position);

					//Make sure that if we put a box here it wouldn't be wider than the "table"
					if (col+bigBoxCols<=boxCols){
						//Make sure that the box wouldn't go past the bottom "edge"
						if (row+bigBoxRows<=boxRows){
							//Check for overlaps with inUseTweets
							var overlaps = false;
							for (var rOff=0; rOff<bigBoxRows;rOff++){
								for (var cOff=0; cOff<bigBoxCols; cOff++){
									var offsetPos = ((row+rOff)*boxCols)+col+cOff;
									//console.log("Checking at " + offsetPos);
									if (reservedPhotoTweets[offsetPos] != null)
									{
										//console.log("Overlap found at " + offsetPos);
										overlaps = true;
										break;
									}
								}
								//if (overlaps)
								//	break;
							}
							if (!overlaps){
								//console.log("We could totally put a box at " + position);
								availableIndexes.push(position);
								//break;
							}
						}
					}

			}
			if (availableIndexes.length != 0)
				break;
		}

			if (availableIndexes.length !=0)
			{
				availableIndexes = GeneralStatic.shuffle(availableIndexes);
				return availableIndexes[0];
			}
			else
				return -1;
	}
	else
		return -1;
}

//Refresh every 2 seconds
//setInterval(getNewTweets, 5000);
function doInit()
{
	$('.pageTitle').fitText();
	$('.hashTag').fitText();

	if ($(window).width() > $(window).height())
	{
		boxRows = 2;
		boxCols = 4;
	}
	else
	{
		boxRows = 4;
		boxCols = 2;
	}
	//TweetManager.getNewTweets('tweets/approved.json', textTweets, photoTweets, doInitialDraw);
	TweetManager.getNewTweets('tweets/approved.json', textTweets, photoTweets, combinePhotos);
	//TweetManager.getNewTweets('tweets/approved.json', textTweets, photoTweets, getInstagram);
}

function getInstagram()
{
	TweetManager.getNewInstas('instagram/approved.json', instagrams, combinePhotos);
}

function updateTweetLists()
{
	TweetManager.getNewTweets('tweets/approved.json', textTweets, photoTweets, combinePhotos);
}

function combinePhotos(){
	combinedPhotos = photoTweets.concat(instagrams);

	if (bFirstLoad)
	{
		bFirstLoad = false;
		doInitialDraw(true);
	}
}

function getNonNullElement(sourceArray){
	var tempArray = sourceArray.filter(function(n){ return n != undefined });
	randomElement = tempArray[Math.floor(Math.random()*tempArray.length)];
	return randomElement;
}

function removePhotoTweet(boxIndex){
		//Detatch it...
		/*console.log("randomBox: "+ randomBox);
		console.log("inUsePhotoTweets: " + inUsePhotoTweets);
		console.log("inUsePhotoTweets[randomBox]: " + inUsePhotoTweets[randomBox]);
		console.log("photoTweets "+photoTweets);
		console.log("removing "+ randomBox);*/

		$('.box.big[value="'+inUsePhotoTweets[boxIndex]+'"]').detach();
		inUsePhotoTweets.splice(boxIndex, 1);
		//$('.box.big[value="'+inUsePhotoTweets[boxIndex]+'"]').toggleClass('flipping');

		//Remove from reserved tweet location...IN REVERSE ORDER
		for (var row=bigBoxRows-1; row>=0; row--)
		{
			for(var col=bigBoxCols-1; col>=0; col--)
			{
				var position = (boxIndex+col)+(row*boxCols);
				//console.log(position);
				reservedPhotoTweets.splice(position, 1);
			}
		}
}

function removeTextTweet(boxIndex){
	inUseTweets[boxIndex] = null;
	$('.box.small[value="'+boxIndex+'"]').detach();
	//$('.box.small[value="'+boxIndex+'"]').toggleClass('flipping');
}
