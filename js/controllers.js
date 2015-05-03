var tweetboardApp = angular.module('tweetboardApp', []);

tweetboardApp.controller('TweetBoardCtrl', function ($scope, $http) {

	$scope.boxes = [];

	$scope.loadBoxes = function() {
		var httpReq = $http({
			method: 'GET',
			url: 'tweets/approved.json'
		}).success(function(data, status){
			$scope.boxes = data;
		});
	};

	$scope.loadBoxes();
});

tweetboardApp.directive('boxHolder', function($compile){
	return {
		restrict: 'AE',
		template:
			  '<div class="box-small" ng-repeat="box in boxes">'
			+ '	<img style="width=50px" ng-src="{{box.avatar}}">'
			+ '	<div class="accountInfo">'
			+ '		<strong class="fullname">{{box.full_name}}</strong>'
			+ '		<br><span class="username">@<b>{{box.username}}</b></span>'
			+ '	</div>'
			+ '	<div class="smallTextHolder">'
			+ '		<p class="tweet-text">{{box.tweet.text}}</p>'
			+ '	</div>'
			+ '</div>',
		link: function($scope, $element){
			//Put Javascript here that you want to interact with the above generated directive
		}
	};
});