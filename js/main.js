$(function() {
	function RadioModel() {
		var self = this;

		self.audioStream = new Audio();

		self.stations = ko.observableArray();
		self.activeStation = ko.observable();
		self.recentlyPlayed = ko.observableArray();

		self.isAudioPlaying = false;
		self.hasAudioLoaded = false;

		self.audioLevel = ko.observable(100);

		self.showAboutPanel = ko.observable(false);

		self.playingSongData = {
			title: ko.observable("--"),
			artist: ko.observable(),
			album: ko.observable(),
			albumArt: ko.observable("images/defaultAlbum.png")
		};

		self.loadStations = function() {
		 	$.get("actions/loadChannels.php", function(data) {
				var xml = $($.parseXML(data));
				self.stations.removeAll();	
				xml.find("channel").each(function(i, v) {
					var channel = $(v);
					self.stations.push({
						title: channel.find("title").text(),
						description: channel.find("description").text(),
						dj: channel.find("dj").text(),
						djmail: channel.find("djmail").text(),
						genre: channel.find("genre").text(),
						image: channel.find("image").text(),
						largeimage: channel.find("largeimage").text(),
						twitter: channel.find("twitter").text(),
						listeners: ko.observable(channel.find("listeners").text()),
						stream: "http://ice.somafm.com/" + channel.find("fastpls").first().text().split("/")[3].split(".")[0],
						identifier: channel.find("fastpls").first().text().split("/")[3].split(".")[0],
						lastPlaying: ko.observable(channel.find("lastPlaying").text())

					});
				});
			});

		}

		self.refreshStations = function() {
			$.get("actions/loadChannels.php", function(data) {
				var xml = $($.parseXML(data));
				xml.find("channel").each(function(i, v) {
					var channel = $(v);
					$(self.stations()).each(function(ix, vx) {
						var title = channel.find("title").text();
						if(title == vx.title) {
							if(self.activeStation() != undefined && title == self.activeStation().title) {
								if(channel.find("lastPlaying").text() != self.activeStation().lastPlaying()) {
									self.loadRecentlyPlayed(self.activeStation(), true);
								}
							}
							vx.lastPlaying(channel.find("lastPlaying").text());
							vx.listeners(channel.find("listeners").text());
						}
					});
				});
				self.stations.valueHasMutated();
			});
			refresh = setTimeout(self.refreshStations, 5000);
		}

		self.loadSongData = function(title, artist, album) {
			self.playingSongData.title(title);
			self.playingSongData.artist(artist);
			self.playingSongData.album(album);
			$.getJSON("actions/lastfm.php?method=album.getInfo&artist=" + artist + "&album=" + album, function(data) {
				if(data.error == 6) {
					self.playingSongData.albumArt("images/defaultAlbum.png");
				} else {
					self.playingSongData.albumArt(data.album.image[3]["#text"]);
					if(self.playingSongData.albumArt().length == 0) self.playingSongData.albumArt("images/defaultAlbum.png");
				}
				$(".playingAlbumArt").css("background-image", "url(" + self.playingSongData.albumArt() + ")");

			});
		}

		self.displayErrorMessage = function(message) {
			$("#errorMessage .errorText").html(message);
			console.log(message);
			$("#errorMessage").fadeIn().delay(5000).fadeOut();
		}

		self.retries = 0;

		self.selectStation = function(station) {
			self.hasAudioLoaded = false;
			self.isAudioPlaying = false;
			$(".controlButton").css("background-image", "url(images/play.png)");
			if(self.recentlyPlayed()[0] != undefined) document.title = self.recentlyPlayed()[0].artist + " - " + self.recentlyPlayed()[0].title + " - Acceptable Radio";
			self.activeStation(station);
			self.audioStream.src = station.stream;
			self.audioStream.load();
			$("#playingSpinner").show();
			self.audioStream.addEventListener('canplaythrough', function() {
				self.retries = 0;
				$("#errorMessage").fadeOut()
			    self.isAudioPlaying = true;
			    self.hasAudioLoaded = true;
			    $(".controlButton").css("background-image", "url(../images/pause.png)");
				self.audioStream.play();
				$("#playingSpinner").hide();
			}, false);
			self.audioStream.addEventListener('error', function failed(e) {
				if(e.target.error == undefined) return;
				switch(e.target.error.code) {
					case e.target.error.MEDIA_ERR_NETWORK:
						self.displayErrorMessage("Failed to connect to content stream.")
						break;
					case e.target.error.MEDIA_ERR_DECODE:
						self.selectStation(self.activeStation());
						self.retries++;
						console.log("Attempting again...");
						if(self.retries >= 2) {
							$("#errorMessage .errorText").html("This is taking longer than expected.<br>Sorry for the wait.");
							$("#errorMessage").fadeIn()
						}
						break;
					default:
						console.log(e.target.error.code);	
				}
			}, true);
	
		
			self.loadRecentlyPlayed(station, true);
			$(".selectedStationArt").css("background-image", "url(" + station.image + ")");				
		/*	$("#player").find("source").attr("src", station.stream);
			$("#player")[0].load();
			$("#player")[0].play();*/
		}

		//God this is so hacky.
		self.loadRecentlyPlayed = function(station, loadData) {
			$.get("actions/recentlyPlayed.php?station=" + station.identifier, function(data) {
				var table = $(data);
				self.recentlyPlayed.removeAll();
				table.find("tr").each(function(i, v) {
					if(i != 0) {
						var row = {};
						if($(v).find("td").length == 5) {
							$(v).find("td").each(function(ix, vx) {
								switch(ix) {
									case 0:
										row.playedAt = $(vx).html(); break;
									case 1:
										row.artist = $(vx).find("a").html(); break;
									case 2:
										row.title = $(vx).html(); break;
									case 3:
										row.album = $(vx).find("a").html(); break;
								}
							});
							if(typeof artist == "undefined" || artist != undefined) self.recentlyPlayed.push(row);
														}
					}
				});
				if(loadData) {
					self.loadSongData(self.recentlyPlayed()[0].title, self.recentlyPlayed()[0].artist, self.recentlyPlayed()[0].album);
					document.title = '\u25B6' + self.recentlyPlayed()[0].artist + " - " + self.recentlyPlayed()[0].title + " - Acceptable Radio";

				}
			});
		}

		self.togglePlayback = function() {
			if(!self.hasAudioLoaded) return;
			if(self.isAudioPlaying) {
				self.isAudioPlaying = false;
				self.audioStream.pause();
				$(".controlButton").css("background-image", "url(images/play.png)");
				document.title = self.recentlyPlayed()[0].artist + " - " + self.recentlyPlayed()[0].title + " - Acceptable Radio";

			} else {
					self.audioStream.load();
			$("#playingSpinner").show();
			self.audioStream.addEventListener('canplaythrough', function() {
				self.retries = 0;
				$("#errorMessage").fadeOut()
			    self.isAudioPlaying = true;
			    self.hasAudioLoaded = true;
				$(".controlButton").css("background-image", "url(images/pause.png)");
				document.title = '\u25B6' + self.recentlyPlayed()[0].artist + " - " + self.recentlyPlayed()[0].title + " - Acceptable Radio";
				self.audioStream.play();
				$("#playingSpinner").hide();
			}, false);

			}
		}

		self.toggleAboutPanel = function() {
			self.showAboutPanel(!self.showAboutPanel());
		}
		var refresh = setTimeout(self.refreshStations, 5000);

		self.loadStations();


		var updatingVolume = false;

		$(".volumeSliderButton").on("mousedown", function(ev) {
			updatingVolume = true;
			$("body").addClass("unselectable");
		})

		$(".volumeSliderLeft, .volumeSliderRight").click(function(ev) {
			var offset = ev.pageX - $(".volumeSlider").offset().left;
			if(offset < 0) offset = 0;
			if(offset > 300) offset = 300;
			var percent = offset / 3;
			setVolume(percent)
		});

		$(document).on("mousemove", function(ev) {
			if(updatingVolume) {
				var offset = ev.pageX - $(".volumeSlider").offset().left;
				if(offset < 0) offset = 0;
				if(offset > 300) offset = 300;
				var percent = offset / 3;
				setVolume(percent)
			}
		}).on("mouseup", function(ev) {
			updatingVolume = false;
			$("body").removeClass("unselectable");

		});

		function setVolume(percent) {
			$(".volumeSliderButton").css("left", percent + "%");
			$(".volumeSliderLeft").css("width", percent + "%");
			$(".volumeSliderRight").css("width", (100 - percent) + "%");
			self.audioStream.volume = percent / 100;
		}

	}


	ko.applyBindings(new RadioModel());

	$(window).resize(function() { resizeElements(); });

	function resizeElements() {
		$(".selectedBar").width($(window).width() - $(".stationBar").outerWidth());
		if($(window).height() >= 500) {
			$(".selectedBar").removeClass("reduced_500");
			$(".recentlyPlayedTableShell").height($(window).height() - $(".nowPlaying").outerHeight());
		}  else {
			$(".selectedBar").addClass("reduced_500");			
			if($(window).height() <= 380) {
				$(".selectedBar").addClass("reduced_380");
				if($(window).height() <= 200) {
					$(".selectedBar").addClass("reduced_200");
				} else {
					$(".selectedBar").removeClass("reduced_200");					
				}
			} else {
				$(".selectedBar").removeClass("reduced_380");				
			}
		}

		if($(window).width() <= 760) {
			$(".stationImage").hide();
			$(".stationBar").addClass('condensed');
		} else {
			$(".stationImage").show();
			$(".stationBar").removeClass('condensed');
		}

		if($(window).width() <= 605 || $(window).height() <= 100) {
			$("#smallWindowWarning").show();
		} else {
			$("#smallWindowWarning").hide();
		}

		$(".selectedBar").css('left', $(".stationBar").width());
		$(".selectedBar").width($(window).width() - $(".stationBar").width());

		$(".stationList").height($(window).height() - 24);

		$("#recentlyPlayedTable").width($(".recentlyPlayed").width());

	}

	$(window).load(function() { 
		resizeElements(); 
	
	});



	var opts = {
	  lines: 13, // The number of lines to draw
	  length: 0, // The length of each line
	  width: 8, // The line thickness
	  radius: 30, // The radius of the inner circle
	  corners: 1, // Corner roundness (0..1)
	  rotate: 0, // The rotation offset
	  direction: 1, // 1: clockwise, -1: counterclockwise
	  color: '#fff', // #rgb or #rrggbb or array of colors
	  speed: 1.2, // Rounds per second
	  trail: 60, // Afterglow percentage
	  shadow: false, // Whether to render a shadow
	  hwaccel: false, // Whether to use hardware acceleration
	  className: 'spinner', // The CSS class to assign to the spinner
	  zIndex: 2e9, // The z-index (defaults to 2000000000)
	  top: 'auto', // Top position relative to parent in px
	  left: 'auto' // Left position relative to parent in px
	};
	var target = document.getElementById('playingSpinner');
	var spinner = new Spinner(opts).spin(target);


});
