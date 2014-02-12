$(function() {
	var heatmap = [
		{
			"date": "2014-02-11",
			"start": "1",
			"duration": "2",
			"level": 1
		},
		{
			"date": "2014-02-11",
			"start": "3",
			"duration": "2",
			"level": 3
		},
		{
			"date": "2014-02-11",
			"start": "10",
			"duration": "4",
			"level": 5
		},
		{
			"date": "2014-02-12",
			"start": "3",
			"duration": "2",
			"level": 2
		},
		{
			"date": "2014-02-12",
			"start": "5",
			"duration": "2",
			"level": 4
		}
	];

	var drawHeatmap = function(map) {
		$.each(map, function(i, slot) {
			var $day = $("#" + slot.date);
			$day.prepend('<p class="slot gridtop-' + parseInt(slot.start)+ ' gridheight-'
				+ parseInt(slot.duration) + ' heatmap-' + parseInt(slot.level) + '"></p>');
		})
	};

	var drawGrid = function(date) {
		var $holder = $("#grid-stretch"),
		    $column = $('<div class="grid-column" id="' + date + '"></div>');
		for (var i = 0; i < 26; ++i) {
			$column.append('<div class="grid hour">&nbsp;</div>');
		}
		$holder.append($column);
	}

	var scrollHookup = function() {
		var $handle = $("#handle-bar"),
		    $scroll = $("#scroll-pane"),
		    mouseMove = false,
		    starty, mousey;

		$handle.on("touchstart", function(e) {
			mouseStart = true;
			starty = $scroll.scrollTop();
			mousey = e.originalEvent.touches[0].pageY;
			e.preventDefault();

			var touchmove = function(e) {
				if (!mouseStart) return false;
				$scroll.scrollTop(starty - (e.originalEvent.touches[0].pageY - mousey));
				e.preventDefault();
			};

			var touchend = function(e) {
				mouseStart = false;
				$(document).off("touchmove", touchmove).off("touchend", touchend);
			};

			$(document).on("touchmove", touchmove).on("touchend", touchend);
		}).click(function(e) {
			e.stopImmediatePropagation();
			return false;
		});
	};

	var dayHookup = function() {
		var $handle = $("#day-scroll"),
		    $scrollTop = $("#day-scroll"),
		    $scrollBottom = $("#grid-holder"),
		    mouseMove = false,
		    startx, mousex;

		$handle.on("touchstart", function(e) {
			mouseStart = true;
			startx = $scrollTop.scrollLeft();
			mousex = e.originalEvent.touches[0].pageX;
			e.preventDefault();

			var touchmove = function(e) {
				if (!mouseStart) return false;
				$scrollTop.scrollLeft(startx - (e.originalEvent.touches[0].pageX - mousex));
				$scrollBottom.scrollLeft(startx - (e.originalEvent.touches[0].pageX - mousex));
				e.preventDefault();
			};

			var touchend = function(e) {
				mouseStart = false;
				$(document).off("touchmove", touchmove).off("touchend", touchend);
			};

			$(document).on("touchmove", touchmove).on("touchend", touchend);
		}).click(function(e) {
			e.stopImmediatePropagation();
			return false;
		});
	};

	var slotID = 0;
	var slotHookup = function() {
		var $column = $(".grid-column"),
		    mouseMove = false,
		    starty, mousey,
		    ygrid = function(y) {
		    	return Math.floor((y - 15) / 20) + 1;
		    },
		    drawSlot = function(y1, y2) {
		    	if (y1 > y2) {
		    		var tmp = y2;
		    		y2 = y1;
		    		y1 = tmp;
		    	}
		    	if (ygrid(y1) < 1 || ygrid(y2) > 48) {
		    		$("#slot-" + slotID).hide();
		    		return;
		    	}
		    	$("#slot-" + slotID).removeClass().addClass("slot draw gridtop-" + ygrid(y1) +
		    		" gridheight-" + (ygrid(y2) - ygrid(y1) + 1));
		    };

		$column.on("touchstart", function(e) {
			slotID++;
			mouseStart = true;
			var parentOffset = $(this).parent().offset();
			mousey = e.originalEvent.touches[0].pageY - parentOffset.top;
			e.preventDefault();

			var $slot = $('<p id="slot-' + slotID + '"></p>');
			$(this).prepend($slot);
			drawSlot(mousey, mousey);

			var touchmove = function(e) {
				if (!mouseStart) return false;
				var currenty = e.originalEvent.touches[0].pageY - parentOffset.top;
				drawSlot(mousey, currenty);
				e.preventDefault();
			};

			var touchend = function(e) {
				mouseStart = false;
				$(document).off("touchmove", touchmove).off("touchend", touchend);
			};

			$(document).on("touchmove", touchmove).on("touchend", touchend);
		}).click(function(e) {
			e.stopImmediatePropagation();
			return false;
		});
	};

	drawGrid("2014-02-10");
	drawGrid("2014-02-11");
	drawGrid("2014-02-12");
	drawGrid("2014-02-13");
	drawGrid("2014-02-14");
	drawGrid("2014-02-15");
	drawHeatmap(heatmap);
	scrollHookup();
	dayHookup();
	slotHookup();
});