<?php

require 'instagram.class.php';

// Initialize class with client_id
// Register at http://instagram.com/developer/ and replace client_id with your own
$instagram = new Instagram('d721548b94e140239bafd39d73d70b54');

// Set keyword for #hashtag
$tag = 'polarvortex';

// Get latest photos according to #hashtag keyword
$media = $instagram->getTagMedia($tag);

// Set number of photos to show
$limit = 50;

// Set height and width for photos
$size = '300';

// Show results
$insta_a = array();

// Using for loop will cause error if there are less photos than the limit
if (!empty($media))
{
    foreach ($media->data as $data) {
      $singlePost = array();
      $idExploded = explode("_", $data->id);
      $singlePost["id"]=$idExploded[1];
      $singlePost["created_at"]=date("c",($data->created_time));
      $singlePost["tweet_id"]=$idExploded[1];
      $singlePost["username"]=$data->user->username;
      $singlePost["full_name"]=$data->user->full_name;
      $singlePost["avatar"]=$data->user->profile_picture;
      $singlePost["text"]=$data->caption->text;
      $singlePost["tweeted_at_relative"]=getRelativeTime($data->created_time);
      $singlePost["media_url"]=$data->images->standard_resolution->url;
      array_unshift($insta_a, $singlePost);
    }
}


function getRelativeTime($date) {
  $diff = time() - $date;
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

/*foreach(array_slice($media->data, 0, $limit) as $data)
{
    // Show photo
    echo '<p><img src="'.$data->images->standard_resolution->url.'" height="'.$size.'" width="'.$size.'" alt="SOME TEXT HERE"></p>';
}*/

echo(json_encode($insta_a));
//file_put_contents('approved.json', json_encode($insta_a));
//This is how we were reading the original JSON...
//echo json_encode($media);
?>
