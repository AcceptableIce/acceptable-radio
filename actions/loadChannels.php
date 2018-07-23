<?
$curl = curl_init();
curl_setopt_array($curl, array( 
	CURLOPT_RETURNTRANSFER => 1,
	CURLOPT_URL => "http://api.somafm.com/channels.xml"
));
echo curl_exec($curl);
?>