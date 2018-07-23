<!DOCTYPE html>
<html>
<head>
	<title>Acceptable Radio</title>
	<script src="js/jquery.js"></script>
	<script src="js/knockout.js"></script>
	<script src="js/spin.js"></script>
	<script src="js/main.js"></script>

	<link rel="stylesheet" type="text/css" href="css/main.css" />

	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="viewport" content="width=device-width, minimum-scale=0.5, maximum-scale=0.5">
	<meta names="apple-mobile-web-app-status-bar-style" content="black-translucent" />



</head>
<body>

<div id="smallWindowWarning">
	<div class="smallWindowTitle">Too small!</div>
	<div class="smallWindowText">Acceptable Radio condenses pretty well, but not <i>this</i> well.</div>
</div>
<div class="stationBar">
<ul data-bind="foreach: $root.stations" class="stationList">
	<li class="station" data-bind="click: $root.selectStation">
		<img class="stationImage" data-bind="attr: {'src': image}" />
		<div class="stationName" data-bind="text: title"></div>
		<div class="stationPlaying" data-bind="text: lastPlaying"></div>
	</li>
</ul>
<div class="footer">Created by <a href="http://twitter.com/Corvimae">@Corvimae</a>. <a href="#" data-bind="click: $root.toggleAboutPanel">About</a></div>
</div>
<div class="selectedBar">
	<div id="errorMessage">
		<div class="errorText">Error</div>
	</div>
	<div id="aboutPanel" data-bind="visible: $root.showAboutPanel">
		<div class="closeAbout" data-bind="click: $root.toggleAboutPanel">&times;</div>
		<div class="aboutTitle">Acceptable Radio</div>
		<div class="aboutContent">
			Listen to your favorite internet radio stations without having to download a million .pls files.<br><br>
			Built using <a href="http://jquery.com">jQuery</a>, <a href="http://knockoutjs.com">Knockout.js</a>, and <a href="http://fgnass.github.io/spin.js">spin.js</a>.<br>
			Not associated with <a href="http://soma.fm">soma.fm</a>, but they're awesome and you should <a href="http://somafm.com/support/">help them out</a>.<br>
			Album art provided by <a href="http://last.fm">Last.fm</a>.<br>
			Got other radio stations you want added? <a href="mailto:may@maybreak.com">Let me know</a>.

		</div>
	</div>
	<div class="nowPlaying">
		<div class="selectedStationInfo" data-bind="with: $root.activeStation()">
			<div class="selectedStationArt"></div>
			<div class="selectedStationTextShell">
				<div class="selectedStationText">Currently listening to</div>
				<div class="selectedStationName" data-bind="text: title"></div>
			</div>
		</div>
		<div class="playingAlbumArt"><div id="playingSpinner"></div></div>
		<div class="playingAlbumData">
			<div class="playingAlbumTitle" data-bind="text: $root.playingSongData.title"></div>
			<div class="playingAlbumArtist" data-bind="text: $root.playingSongData.artist"></div>
			<div class="controlButton" data-bind="click: $root.togglePlayback"></div>
		</div>
		<div class="volumeSlider">
			<div class="volumeSliderLeft"></div>
			<div class="volumeSliderRight"></div>
			<div class="volumeSliderButton"></div>
		</div>
	</div>
	<div class="recentlyPlayed">
		<table id="recentlyPlayedHeader">
			<thead>
				<tr>
					<th width="5%">&nbsp;</th>
					<th width="20%">Time Played</th>
					<th width="25%">Title</th>
					<th width="25%">Artist</th>
					<th width="25%">Album</th>
				</tr>
			</thead>
		</table>
		<div class="recentlyPlayedTableShell">
			<table id="recentlyPlayedTable">
				<tbody data-bind="foreach: $root.recentlyPlayed">
					<tr>
						<td width="5%" data-bind="html: $index() + 1" class="indexCell"></td>
						<td width="20%" data-bind="html: playedAt"></td>
						<td width="25%" data-bind="html: title"></td>
						<td width="25%" data-bind="html: artist"></td>
						<td width="25%" data-bind="html: album"></td>

					</tr>
				</tbody>

			</table>
		</div>

	</div>
</div>
</body>
</html>
