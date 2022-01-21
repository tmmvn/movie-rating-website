<?php
$postdata = file_get_contents("php://input");
$data = json_decode($postdata);
file_put_contents('moviedb.json', json_encode($data));
?>