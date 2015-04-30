<?php
//echo($_GET["json"]);
$sentJSON = $_POST["json"];
//$sendJSON = stripslashes($sentJSON);
$jsonEncoded = json_encode($sentJSON);
$jsonEncoded = str_replace("\\","", $jsonEncoded);

file_put_contents('approved.json', $jsonEncoded);
?>