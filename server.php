<?
/* Copyright (C) 2021 Cloudnode - All Rights Reserved
 * Any use, distribution or modification of this code
 * is subject to the terms of the provided license.
 *
 * The license is available at the root (/) of the
 * repository. If not, please write to:
 * support@cloudnode.pro
 */
$mcfg = json_decode(file_get_contents(__DIR__ . "/../../private/backend/json/config.json"));
$path = __DIR__ . "/.." . $_SERVER['REQUEST_URI'] . ".php";
header("Content-type: " . mime_content_type($path));
include($path);
