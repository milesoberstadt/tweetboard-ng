<?php
session_start();
require_once("twitteroauth/twitteroauth/twitteroauth.php"); //Path to twitteroauth library

$bHashtag = true;
$bOnlyUS = false;
$twitteruser = "TastyCrayon";//"AndrewWK";
$hashtag = "#nationofmakers";//hashtags split with a space, ex "#pizza #beer #now" PLEASE READ https://dev.twitter.com/docs/using-search

$notweets = 50;
$consumerkey = "WCrpx1yGpig3HxisZ6nZVw";
$consumersecret = "1Va4omRPEYhNxg0VfregZoqN83nOieiCc3a6rdKz5o";
$accesstoken = "1202259685-frUEGBeYELx1khTq09iU3I2SZ0SQx96UG820Snu";
$accesstokensecret = "QLtrEgEXRTwEA9f3pG5u6HjBIkJSZveg6PQEZP38";

function getConnectionWithAccessToken($cons_key, $cons_secret, $oauth_token, $oauth_token_secret) {
  $connection = new TwitterOAuth($cons_key, $cons_secret, $oauth_token, $oauth_token_secret);
  return $connection;
}

//Format our hashtags nicely
$hashtag = str_replace("#", "%23", $hashtag);
$hashtag = str_replace(" ", "+", $hashtag);

function getRelativeTime($date) {
	$diff = time() - strtotime($date);
	if ($diff<60)
		return $diff . " second" . plural($diff) . " ago";
	$diff = round($diff/60);
	if ($diff<60)
		return $diff . " minute" . plural($diff) . " ago";
	$diff = round($diff/60);
	if ($diff<24)
		return $diff . " hour" . plural($diff) . " ago";
	$diff = round($diff/24);
	if ($diff<7)
		return $diff . " day" . plural($diff) . " ago";
	$diff = round($diff/7);
	if ($diff<4)
		return $diff . " week" . plural($diff) . " ago";
	return "on " . date("F j, Y", strtotime($date));
}

function plural($num) {
	if ($num != 1)
		return "s";
}


$connection = getConnectionWithAccessToken($consumerkey, $consumersecret, $accesstoken, $accesstokensecret);

if (!$bHashtag)
    $tweets = $connection->get("https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=".$twitteruser."&count=".$notweets);
else
    $tweets = $connection->get("https://api.twitter.com/1.1/search/tweets.json?q=".$hashtag."&count=".$notweets);

$tweet_a = array();

if (!empty($tweets)) {

    if($bHashtag)
    {
        //If we're SEARCHING for hashtags, we need to filter to just statuses
        $tweets = $tweets->statuses;
    }

    foreach ($tweets as $status)
    {
    	//If you need to check anything like this, make sure you comment it out so JSON encoding doesn't get messed up
    	//echo "Time_zone: ".$status->user->time_zone.'<br>';
        //if (!isset($status->entities->media[0]->media_url))
        //    echo "No media...";

    	$singleTweet_a = array();
    	$singleTweet_a["id"]=$status->id_str;
    	$singleTweet_a["created_at"]=date("c",strtotime($status->created_at));
    	//$singleTweet_a["updated_at"]=$status->updated_at;
    	//$singleTweet_a["tweeted_at"]=$status->tweeted_at;
    	$singleTweet_a["tweet_id"]=$status->id_str;
    	$singleTweet_a["username"]=$status->user->screen_name;
    	$singleTweet_a["full_name"]=$status->user->name;
    	$singleTweet_a["avatar"]=$status->user->profile_image_url;
    	$singleTweet_a["text"]=$status->text;
        //$singleTweet_a["text"] = preg_replace('/[[:^print:]]/', '', $singleTweet_a["text"]);
        //$singleTweet_a["text"]=utf8_decode($status->text);
        //$singleTweet_a["text"]= iconv("UTF-8", "ISO-8859-1//TRANSLIT", $status->text);
    	$singleTweet_a["tweeted_at_relative"]=getRelativeTime($status->created_at);
        if (isset($status->entities->media[0]->media_url))
            $singleTweet_a["media_url"]=$status->entities->media[0]->media_url;
    	//Unshft this so it is from oldest to newest, orders properly for later

        if ($bOnlyUS)
        {
            if (strpos($status->user->time_zone, "(US") !== false)
            {
                array_unshift($tweet_a, $singleTweet_a);
            }
        }
        else
        {
    	   array_unshift($tweet_a, $singleTweet_a);
        }
    }

}

echo(json_encode($tweet_a));

//file_put_contents('approved.json', json_encode($tweet_a));
//This is how we were reading the original JSON...
//echo json_encode($tweets);
?>
