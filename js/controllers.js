var tweetboardApp = angular.module('tweetboardApp', []);

tweetboardApp.controller('TweetBoardCtrl', function ($scope) {
	$scope.boxes = [
	  {
	    "id": "593226169467609088",
	    "created_at": "2015-04-29T03:31:55+02:00",
	    "tweet_id": "593226169467609088",
	    "username": "CAllstadt",
	    "full_name": "nala",
	    "avatar": "http://pbs.twimg.com/profile_images/570214172455260161/3wrjAtbv_normal.jpeg",
	    "text": "RT @printhuman: #NationOfMakers|Know a #maker #patron? Help @printhuman add all organs @NIH3Dprint  #3DPH at https://t.co/UpaSiN3gaU http:/…",
	    "tweeted_at_relative": "10 minutes ago",
	    "media_url": "http://pbs.twimg.com/media/CDUFTg7WEAAyasx.png"
	  },
	  {
	    "id": "593226638726332416",
	    "created_at": "2015-04-29T03:33:46+02:00",
	    "tweet_id": "593226638726332416",
	    "username": "ScottieBaugh",
	    "full_name": "Scottie Baugh",
	    "avatar": "http://pbs.twimg.com/profile_images/534861681206124544/Iy452S5P_normal.png",
	    "text": "RT @printhuman: #NationOfMakers|Know a #maker #patron? Help @printhuman add all organs @NIH3Dprint  #3DPH at https://t.co/UpaSiN3gaU http:/…",
	    "tweeted_at_relative": "8 minutes ago",
	    "media_url": "http://pbs.twimg.com/media/CDUFTg7WEAAyasx.png"
	  },
	  {
	    "id": "593228006191136768",
	    "created_at": "2015-04-29T03:39:12+02:00",
	    "tweet_id": "593228006191136768",
	    "username": "QuincyKBrown",
	    "full_name": "Quincy Brown",
	    "avatar": "http://pbs.twimg.com/profile_images/3562279000/a6e75434ba9f9b16cb8c5dc3b63e6ea7_normal.jpeg",
	    "text": "RT @natlmakerfaire: Excited to brainstorm w/govt agencies today @whitehouseostp + thrilled @USCTO is spreading the word about #NatlMakerFai…",
	    "tweeted_at_relative": "3 minutes ago"
	  },
	  {
	    "id": "593228337943805954",
	    "created_at": "2015-04-29T03:40:32+02:00",
	    "tweet_id": "593228337943805954",
	    "username": "QuincyKBrown",
	    "full_name": "Quincy Brown",
	    "avatar": "http://pbs.twimg.com/profile_images/3562279000/a6e75434ba9f9b16cb8c5dc3b63e6ea7_normal.jpeg",
	    "text": "RT @natlmakerfaire: Woot! 500 followers! Help spread the word - we will be releasing our #CallforMakers application form soon! #NatlMakerFa…",
	    "tweeted_at_relative": "2 minutes ago"
	  }
	];
});