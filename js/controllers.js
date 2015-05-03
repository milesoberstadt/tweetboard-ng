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