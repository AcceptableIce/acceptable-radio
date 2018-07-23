<?
$curl = curl_init();
curl_setopt_array($curl, array( 
	CURLOPT_RETURNTRANSFER => 1,
	CURLOPT_URL => "http://somafm.com/recent/".$_GET['station'].".html"
));

$str = curl_exec($curl);
echo preg_replace("/<img[^>]+\>/i", "(image) ", $str); 
?>