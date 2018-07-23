<?
/* Last.fm API call shell to keep key hidden. */
$outstr = "";
foreach($_GET as $key => $value) {
	$outstr .= $key."=".urlencode($value)."&";
}
$outstr .= "api_key=95bdf63b29b26fcaf80aaef085e08b02&format=json";
$curl = curl_init();
curl_setopt_array($curl, array( 
	CURLOPT_RETURNTRANSFER => 1,
	CURLOPT_URL => "http://ws.audioscrobbler.com/2.0/?".$outstr
));
echo curl_exec($curl);

?>