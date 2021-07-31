<?
$mcfg = json_decode(file_get_contents(__DIR__ . "/../../private/backend/json/config.json"));
$path = __DIR__ . "/.." . $_SERVER['REQUEST_URI'] . ".php";
header("Content-type: " . mime_content_type($path));
include($path);
