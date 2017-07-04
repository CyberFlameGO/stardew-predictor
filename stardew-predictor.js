/* stardew-checkup.js
 * https://mouseypounds.github.io/stardew-checkup/
 */

/*jshint browser: true, jquery: true, esnext: true */

(function ($) {
    $.QueryString = (function (a) {
        var i,
            p,
            b = {};
        if (a === "") { return {}; }
        for (i = 0; i < a.length; i += 1) {
            p = a[i].split('=');
            if (p.length === 2) {
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
        }
        return b;
    }(window.location.search.substr(1).split('&')));
}(jQuery));

window.onload = function () {
	"use strict";

	// Check for required File API support.
	if (!(window.File && window.FileReader)) {
		document.getElementById('out').innerHTML = '<span class="error">Fatal Error: Could not load the File & FileReader APIs</span>';
		return;
	}

	// Show input field immediately
	$(document.getElementById('input-container')).show();

	// Utility functions
	function addCommas(x) {
		// Jamie Taylor @ https://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
		return x.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
	}

	function capitalize(s) {
		// joelvh @ https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
		return s && s[0].toUpperCase() + s.slice(1);
	}

	function wikify(item, page) {
		// removing egg colors & changing spaces to underscores
		var trimmed = item.replace(' (White)', '');
		trimmed = trimmed.replace(' (Brown)', '');
		trimmed = trimmed.replace(/ /g, '_');
		return (page) ? ('<a href="http://stardewvalleywiki.com/' + page + '#' + trimmed + '">' + item + '</a>') :
					('<a href="http://stardewvalleywiki.com/' + trimmed + '">' + item + '</a>');
	}

	// This will eventually read the save and return or store the ID & maybe days played
	function parseSummary(xmlDoc) {
		var output = '<h3>Summary</h3>\n',
			farmTypes = ['Standard', 'Riverland', 'Forest', 'Hill-top', 'Wilderness'],
			playTime = Number($(xmlDoc).find('player > millisecondsPlayed').text()),
			playHr = Math.floor(playTime / 36e5),
			playMin = Math.floor((playTime % 36e5) / 6e4);

		// Farmer & farm names are read as html() because they come from user input and might contain characters
		// which must be escaped. This will happen with child names later too.
		output += '<span class="result">' + $(xmlDoc).find('player > name').html() + ' of ' +
			$(xmlDoc).find('player > farmName').html() + ' Farm (' +
			farmTypes[$(xmlDoc).find('whichFarm').text()] + ')</span><br />\n';
		// Date originally used XXForSaveGame elements, but those were not always present on saves downloaded from upload.farm
		output += '<span class="result">Day ' + $(xmlDoc).find('dayOfMonth').text() + ' of ' +
			capitalize($(xmlDoc).find('currentSeason').text()) + ', Year ' + $(xmlDoc).find('year').text() + '</span><br />\n';
		// Playtime of < 1 min will be blank.
		output += '<span class="result">Played for ';
		if (playHr > 0) {
			output += playHr + ' hr ';
		}
		if (playMin > 0) {
			output += playMin + ' min ';
		}
		output += '</span><br />\n';
		return output;
	}

	/* might need this structure
			recipes = {
				16: "Wild Horseradish",
				18: "Daffodil",
				20: "Leek",
				22: "Dandelion",
				24: "Parsnip",
				78: "Cave Carrot",
				88: "Coconut",
				90: "Cactus Fruit",
				92: "Sap",
				174: "Large Egg (White)",
				176: "Egg (White)",
				180: "Egg (Brown)",
				182: "Large Egg (Brown)",
				184: "Milk",
				186: "Large Milk",
				188: "Green Bean",
				190: "Cauliflower",
				192: "Potato",
				248: "Garlic",
				250: "Kale",
				252: "Rhubarb",
				254: "Melon",
				256: "Tomato",
				257: "Morel",
				258: "Blueberry",
				259: "Fiddlehead Fern",
				260: "Hot Pepper",
				262: "Wheat",
				264: "Radish",
				266: "Red Cabbage",
				268: "Starfruit",
				270: "Corn",
				272: "Eggplant",
				274: "Artichoke",
				276: "Pumpkin",
				278: "Bok Choy",
				280: "Yam",
				281: "Chanterelle",
				282: "Cranberries",
				283: "Holly",
				284: "Beet",
				296: "Salmonberry",
				300: "Amaranth",
				303: "Pale Ale",
				304: "Hops",
				305: "Void Egg",
				306: "Mayonnaise",
				307: "Duck Mayonnaise",
				308: "Void Mayonnaise",
				330: "Clay",
				334: "Copper Bar",
				335: "Iron Bar",
				336: "Gold Bar",
				337: "Iridium Bar",
				338: "Refined Quartz",
				340: "Honey",
				342: "Pickles",
				344: "Jelly",
				346: "Beer",
				348: "Wine",
				350: "Juice",
				372: "Clam",
				376: "Poppy",
				378: "Copper Ore",
				380: "Iron Ore",
				382: "Coal",
				384: "Gold Ore",
				386: "Iridium Ore",
				388: "Wood",
				390: "Stone",
				392: "Nautilus Shell",
				393: "Coral",
				394: "Rainbow Shell",
				396: "Spice Berry",
				397: "Sea Urchin",
				398: "Grape",
				399: "Spring Onion",
				400: "Strawberry",
				402: "Sweet Pea",
				404: "Common Mushroom",
				406: "Wild Plum",
				408: "Hazelnut",
				410: "Blackberry",
				412: "Winter Root",
				414: "Crystal Fruit",
				416: "Snow Yam",
				417: "Sweet Gem Berry",
				418: "Crocus",
				420: "Red Mushroom",
				421: "Sunflower",
				422: "Purple Mushroom",
				424: "Cheese",
				426: "Goat Cheese",
				428: "Cloth",
				430: "Truffle",
				432: "Truffle Oil",
				433: "Coffee Bean",
				436: "Goat Milk",
				438: "Large Goat Milk",
				440: "Wool",
				442: "Duck Egg",
				444: "Duck Feather",
				446: "Rabbit's Foot",
				454: "Ancient Fruit",
				459: "Mead",
				591: "Tulip",
				593: "Summer Spangle",
				595: "Fairy Rose",
				597: "Blue Jazz",
				613: "Apple",
				634: "Apricot",
				635: "Orange",
				636: "Peach",
				637: "Pomegranate",
				638: "Cherry",
				684: "Bug Meat",
				709: "Hardwood",
				724: "Maple Syrup",
				725: "Oak Resin",
				726: "Pine Tar",
				766: "Slime",
				767: "Bat Wing",
				768: "Solar Essence",
				769: "Void Essence",
				771: "Fiber",
				787: "Battery Pack"
			},
	*/

	function doTest(xmlDoc) {
		var season = ['Spring', 'Summer', 'Fall', 'Winter'],
			farmer = '',
			gameId = 143594438,
			year,
			mon,
			wk,
			day,
			d,
			daysPlayed,
			rng,
			rainbowLights,
			mineLevel,
			extra,
			output = '<h3>Potential Mushroom Levels</h3>';
		if ($.QueryString.hasOwnProperty("id")) {
			gameId = parseInt($.QueryString.id);
		}
		output += "<p>Using Game ID " + gameId + "</p><ul>";
		for (year = 1; year < 3; year++) {
			for (mon = 0; mon < 4; mon++) {
				for (wk = 0; wk < 4; wk++) {
					for (d = 1; d < 8; d++) {
						day = wk * 7 + d;
						daysPlayed = (year - 1) * 112 + mon * 28 + day;
						rainbowLights = [];
						for (mineLevel = 81; mineLevel < 120; mineLevel++) {
							rng = new CSRandom(daysPlayed + mineLevel + gameId / 2);
							// There are 2 or 3 checks related to darker than normal lighting.
							// We don't care much about their results, but have to mimic them.
							if (rng.NextDouble() < 0.3 && mineLevel > 2) {
								rng.NextDouble(); // checked vs < 0.3 again
							}
							rng.NextDouble(); // checked vs < 0.15
							if (rng.NextDouble() < 0.035) { 
								extra = "";
								if (mineLevel % 5 === 0) {
									extra = "*";
								}
								rainbowLights.push(mineLevel + extra); 
							}
						}
						output += "<li>Year " + year + ", " + season[mon] + " " + day + " (" + daysPlayed + "): ";
						if (rainbowLights.length > 0) {
							output += rainbowLights.join(', ');
						} else {
							output += "None";
						}
						output += "</li>";	
					}
				}
			}
		}
		output += "</ul>";
		return output;
	}

	function createTOC() {
		var text,
			id,
			list = "<ul>";
		$("h2, h3").each(function () {
			if ($(this).is(":visible")) {
				text = $(this).text();
				id = 'sec_' + text.toLowerCase();
				id = id.replace(/[^\w*]/g, '_');
				$(this).attr('id', id);
				list += '<li><a href="#' + id + '">' + text + '</a></li>\n';
			}
		});
		list += '</ul>';
		document.getElementById('TOC-details').innerHTML = list;
	}

	function handleFileSelect(evt) {
		var file = evt.target.files[0],
			reader = new FileReader(),
			prog = document.getElementById('progress');

		prog.value = 0;
		$(document.getElementById('output-container')).hide();
		$(document.getElementById('progress-container')).show();
		$(document.getElementById('changelog')).hide();
		reader.onloadstart = function (e) {
			prog.value = 20;
		};
		reader.onprogress = function (e) {
			if (e.lengthComputable) {
				var p = 20 + (e.loaded / e.total * 60);
				prog.value = p;
			}
		};
		reader.onload = function (e) {
			var output = "",
				xmlDoc = $.parseXML(e.target.result);

			//output += parseSummary(xmlDoc);
			output += doTest(xmlDoc);

			// End of checks
			prog.value = 100;
			document.getElementById('out').innerHTML = output;
			$(document.getElementById('output-container')).show();
			$(document.getElementById('progress-container')).hide();
			createTOC();
			$(document.getElementById('TOC')).show();
		};
		reader.readAsText(file);
	}
	document.getElementById('file_select').addEventListener('change', handleFileSelect, false);

};