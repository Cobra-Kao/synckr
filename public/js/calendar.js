$(function() {
  var slotID = 0;
  var saved = true;
  var inDecision = false;
  var heatmapToggle = false;
  var showDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var showMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'Mar', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var eventId = $("meta[name=eventId]").attr("content"),
      eventType = $("meta[name=eventType]").attr("content"),
      allVoted = $("meta[name=allVoted]").attr("content"),
      startDate = new Date($("meta[name=startDate]").attr("content")),
      endDate = new Date($("meta[name=endDate]").attr("content")),
      notVoted = $("meta[name=notVoted]").attr("content"),
      notDecided = $("meta[name=notDecided]").attr("content"),
      firstUse = $("meta[name=firstUse]").attr("content"),
      firstDecide = $("meta[name=firstDecide]").attr("content");

  var friendWidth = $('#friendList').width();
  $("#friendList").offset({left: friendWidth});

  $("#overlay-toggle").click(function(){
    var $slot = $(".data");
    if(!heatmapToggle) {
      $.each($slot, function(i, s){
        $(s).click(heatmapSlotHookup);
        $("#stats-icon").addClass("hm-toggle");
        heatmapToggle = true;
      });
    } else {
      $.each($slot, function(i, s){
        $(s).unbind();
        $("#stats-icon").removeClass("hm-toggle");
        heatmapToggle = false;
      });
    }
  });

  $('#back-new').click(function(e) {
    console.log("here");
    e.preventDefault();
    $('#friendList').animate({left: friendWidth}, 200);
    $('#placeholder').animate({left: 0}, 200);
  });

  $("#nav-right").click(function(){
    var data = [];
    $.each($(".draw"), function(i, d) {
      var $d = $(d);
      data.push({
        "startDate": $d.parent().attr("id"),
        "startTime": parseInt($d.attr("start")),
        "duration": parseInt($d.attr("end")) - parseInt($d.attr("start")) + 1
      });
    });
    if (inDecision) {
      $.post("/events/" + eventId + "/decide", { slot: data });
      $("#mask").show();
      $("#dialog-send").fadeIn(200);
    } else {
      $.post("/events/" + eventId + "/slots", { slot: data });
      $("#dialog").fadeIn(500, function(){ $("#dialog").fadeOut(500); });
    }
    saved = true;
  });

  $("#nav-left").click(function(){
   if(!saved){
      $("#mask").show();
      $("#dialog-button").fadeIn(150);
      $("#dialog-button p").html("Not saved yet!");
      $("#dialog-button p").css("padding-top",'30px');
      $("#ok-button").html("Leave")
      $("#ok-button").click(function(){
        window.location.href = "/events";
        $("#mask").hide();
      })
      $("#cancel-button").html("Save")
      $("#cancel-button").click(function(){
        $("#dialog-button").fadeOut(150);
        var data = [];
        $.each($(".draw"), function(i, d) {
          var $d = $(d);
          data.push({
            "startDate": $d.parent().attr("id"),
            "startTime": parseInt($d.attr("start")),
            "duration": parseInt($d.attr("end")) - parseInt($d.attr("start")) + 1
          });
        });
        if (inDecision) {
          $.post("/events/" + eventId + "/decide", { slot: data });
        } else {
          $.post("/events/" + eventId + "/slots", { slot: data });
        }
         $("#dialog").fadeIn(500, function(){ $("#dialog").fadeOut(500, function(){window.location.href = "/events";}); });
        $("#mask").hide();
        saved = true;

      })
    }
    else{
      window.location.href = "/events";
      $("#mask").hide();
    }
  });

  $("#send-button").click(function(){
    $("#dialog-send").fadeOut(200);
    $("#mask").hide();
  });

  var drawSlot = function(slots) {
    $.each(slots, function(i, slot) {
      var $day = $("[id='" + slot.startDate + "']");
      var startTime = parseInt(slot.startTime);
      var duration = parseInt(slot.duration);
      $slot = $('<p id="slot-' + (++slotID) + '" class="slot draw gridtop-' +
        startTime + ' gridheight-' + duration + '" start="' + startTime +
        '" end="' + (startTime + duration - 1) + '"></p>'
      );
      $day.prepend($slot);
      if (eventType === "ongoing") {
        blockHookup($slot);
      }
    })
  };

  var drawCalendar = function(){
    var $day = $("[id='Tue Feb 25 2014 00:00:00 GMT-0800 (PST)']");
    $slot = $('<p id="slot-'+ (++slotID) + '" class="slot calendar gridtop-17 gridheight-8"></p>');
    $slot.prepend('<p class="count">Tennis</p>');
    $day.prepend($slot);


    var $day2 = $("[id='Mon Feb 24 2014 00:00:00 GMT-0800 (PST)']");
    $slot = $('<p id="slot-'+ (++slotID) + '" class="slot calendar gridtop-27 gridheight-8"></p>');
    $slot.prepend('<p class="count">Meeting</p>');
    $day2.prepend($slot);
  };

  var hmId = 0;
  var heatmapParticipants = {};
  var drawHeatmap = function(map) {
    console.log(map);
    var maxCount = 0;
    $.each(map, function(date, slots) {
      $.each(slots, function(i, slot) {
        var count = parseInt(slot.count);
        if (count > maxCount) {
          maxCount = count;
        }
      });
    });

    maxCount--;
    $.each(map, function(date, slots) {
      var $day = $("[id='" + date + "']");
      $.each(slots, function(i, slot) {
        var hm;
        if (maxCount === 0) hm = 1;
        else hm = Math.ceil((parseInt(slot.count)-1) / maxCount * 4 + 1);
        var $heatslot = $('<p class="slot data gridtop-' + parseInt(slot.startTime) +
          ' clicked gridheight-' + parseInt(slot.duration) +
          ' heatmap-' + hm + '" count="' + parseInt(slot.count) +
          '" id="hm-' + (++hmId) + '"></p>');
        $day.prepend($heatslot);
        $heatslot.prepend('<p class="count">' + parseInt(slot.count) + '</p>');
/*
        $.each($slot, function(i, s){
        $(s).addClass("clicked");
        var level = $(s).attr("count");
        $(s).append("<p class='count'>"+level+"</p>");
        $(s).click(heatmapSlotHookup);
        $("#stats-icon").addClass("hm-toggle");
        heatmapToggle = true;
      });
        */
        heatmapParticipants["hm-" + hmId] = slot.participants;
      });
    });
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

  var ygrid = function(y) {
    return Math.floor((y - 15) / 20) + 1;
  };
  var collide = function($column, y1, y2, starty) {
    // console.log($column, y1, y2);
    $.each($column.find(".draw:not(.drawing)"), function(i, s) {
      var $s = $(s),
          s1 = parseInt($s.attr("start")), s2 = parseInt($s.attr("end"));
      // console.log($s, s1, s2);
      if (y1 >= s1 && y1 <= s2) y1 = s2 + 1;
      if (y2 >= s1 && y2 <= s2) y2 = s1 - 1;
      if (y1 <= s1 && y2 >= s2) {
        if (starty == y1) {
          y2 = s1 - 1;
        } else {
          y1 = s2 + 1;
        }
      }
    });
    return [y1, y2];
  };

  var heatmapSlotHookup = function() {
    console.log("clicked!");
    $('#friendList').animate({left: 0}, 200);
    $('#placeholder').animate({left: -friendWidth}, 200);

    console.log(heatmapParticipants[$(this).attr('id')]);
    var participants = heatmapParticipants[$(this).attr('id')];
    $("#list").find("*").remove();
    $.each(participants, function(i, p) {
      $("#list").append('<div class="friends"><div class="friend-intro friend-pic"><img src="https://graph.facebook.com/' + p.personId + '/picture" width="30px" height="30px"/></div><div class="friend-intro friend-name"><p>' + p.name + '</br></p></div></div>');
    });
  };

  var slotHookup = function() {
    var $column = $(".grid-column"),
        mouseMove = false,
        starty, mousey,
        drawSlot = function(y1, y2) {
          var my = y1;
          if (y1 > y2) {
            var tmp = y2;
            y2 = y1;
            y1 = tmp;
          }
          var $slot = $("#slot-" + slotID), $col = $slot.parent();
          $slot.addClass("drawing");
          var g1 = ygrid(y1), g2 = ygrid(y2);
          var col = collide($col, g1, g2, ygrid(my));
          g1 = col[0];
          g2 = col[1];
          if (g1 < 1) g1 = 1;
          if (g2 > 48) g2 = 48;
          $slot.removeClass().addClass("slot draw gridtop-" + g1 +
            " gridheight-" + (g2 - g1 + 1)).attr("start", g1).attr("end", g2);
        };

    $column.on("touchstart", function(e) {
      console.log("column drag start");
      slotID++;
      mouseStart = true;
      var parentOffset = $(this).parent().offset();
      mousey = e.originalEvent.touches[0].pageY - parentOffset.top;
      var gy = ygrid(mousey), col = collide($(this), gy, gy, gy);
      console.log(col, gy);
      if (col[0] != gy) return;

      if (inDecision) {
        $(".draw").remove();
      }
      if (heatmapToggle) return;
      e.preventDefault();

      saved = false;

      var $slot = $('<p id="slot-' + slotID + '"></p>');
      blockHookup($slot);
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

  var blockHookup = function($block) {
    var mouseMove = false,
        starty, mousey,
        drawSlot = function($block, y, fixed) {
          var gy = ygrid(y), start = parseInt($block.attr("start")),
              end = parseInt($block.attr("end"));
          console.log(fixed);
          if (!fixed) {
            fixed = (gy == start) ? end : start;
          }
          var g1 = (gy > fixed) ? fixed : gy,
              g2 = (gy > fixed) ? gy : fixed;
          $block.addClass("drawing");
          var col = collide($block.parent(), g1, g2, fixed);
          g1 = col[0];
          g2 = col[1];
          if (g1 < 1) g1 = 1;
          if (g2 > 48) g2 = 48;
          console.log(gy, start, end, g1, g2, fixed);
          $block.removeClass().addClass("slot draw gridtop-" + g1 +
            " gridheight-" + (g2 - g1 + 1)).attr("start", g1).attr("end", g2);
          return fixed;
        };

    $block.on("touchstart", function(e) {
      console.log("touch start at slot");
      mouseStart = true;
      var that = $(this), parentOffset = $(this).parent().offset();

      var y = e.originalEvent.touches[0].pageY - parentOffset.top;
      if (ygrid(y) != parseInt(that.attr("start")) &&
          ygrid(y) != parseInt(that.attr("end"))) return;
      if (heatmapToggle) return;
      saved = false;
      var fixed = drawSlot(that, y, false);

      var touchmove = function(e) {
        if (!mouseStart) return false;
        drawSlot(that, e.originalEvent.touches[0].pageY - parentOffset.top, fixed);
        e.preventDefault();
      };

      var touchend = function(e) {
        mouseStart = false;
        $(document).off("touchmove", touchmove).off("touchend", touchend);
      };

      $(document).on("touchmove", touchmove).on("touchend", touchend);
    }).hammer().on("tap", function(e) {
      e.stopImmediatePropagation();
    }).hammer().on("doubletap", function(e) {
      if (heatmapToggle) return;
      $(this).remove();
      e.stopImmediatePropagation();
      saved = false;
    });
  };

  var FTUE = function(){
    var clicks = 0
    var dragAnimate = function(){
      $("#mask-drag-move").css("top", '0px');
      $("#mask-drag-move").animate({
        top:$("#mask-drag-move").height()
        }, 700, function(){ setTimeout(function() {dragAnimate();}, 500)}
      );
    };

    $("#mask").show();
    $("#mask-indication").show();
    $(".mask-scroll").show();
    $("#mask").click(function(e){
      console.log("mask click");
      if (clicks == 0){
        $(".mask-scroll").hide();
        $(".mask-drag-frame").show();
        $("#dot-1").attr('src', '/images/dot-light.png');
        $("#dot-2").attr('src', '/images/dot-dark.png');
        dragAnimate();
        clicks++;
      }
      else if (clicks == 1){
        $(".mask-drag-frame").hide();
        $(".mask-double-click").show();
        $("#mask-drag-move").stop();
        $("#dot-2").attr('src', '/images/dot-light.png');
        $("#dot-3").attr('src', '/images/dot-dark.png');
        clicks++;
      }
      else if (clicks == 2){
        $(".mask-double-click").hide();

        $("#mask-slot-1").addClass("heatmap-1");
        $("#mask-slot-2").addClass("heatmap-3");
        $("#mask-slot-3").addClass("heatmap-5");
        // $("#heat-level-1").addClass("heatmap-1");
        // $("#heat-level-2").addClass("heatmap-2");
        // $("#heat-level-3").addClass("heatmap-3");
        // $("#heat-level-4").addClass("heatmap-4");
        // $("#heat-level-5").addClass("heatmap-5");

        $(".mask-heatmap").show();

        $("#dot-3").attr('src', '/images/dot-light.png');
        $("#dot-4").attr('src', '/images/dot-dark.png');

        clicks++;
      }
      else if(clicks == 3){
        $(".mask-heatmap").hide();
        //$(".mask-tap").show();
        $("#mask").hide().unbind();
        $("#mask-indication").hide();
        clicks++;
      }
      // else if(clicks == 4){
      //   $(".mask-tap").hide();
      //   $("#mask").hide().unbind();
      //   $("#mask-indication").hide();
      //   clicks++;
      // }
    });
  };

  var decideGuide = function() {
    $("#mask").show();
    $(".mask-decide").show();
    $("#mask").click(function(e){
      $(".mask-decide").hide();
      $("#mask").hide().unbind();

    });
  };

  $("#month").html(showMonth[startDate.getMonth()]);
  for (var d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    $("#day-stretch").append('<div class="day"><div class="date">' + d.getDate()
      + '</div><div class="date-day">' + showDay[d.getDay()] + '</div>');
    drawGrid(d);
  }

  //if (firstUse === "true" && notVoted === "true" && eventType === "ongoing") {

  if (notVoted === "true" && eventType === "ongoing") {
    FTUE();
  }

  //if (notDecided === "true" && eventType === "ongoing" && allVoted === "true") {
  if (eventType === "ongoing" && allVoted === "true") {
      $("#mask").show();
      $("#dialog-button").fadeIn(150);
      $("#dialog-button p").html("Everyone has voted! Decide now?");
      $("#dialog-button p").css("padding-top",'15px');
      $("#ok-button").html("Decide")
      $("#ok-button").click(function(){
        decideGuide();
        $(".draw").remove();
        inDecision = true;
        $("#dialog-button").fadeOut(150);
        $("#mask").hide();
      })
      $("#cancel-button").html("No")
      $("#cancel-button").click(function(){
        $("#dialog-button").fadeOut(150);
        $("#mask").hide();
      })
  }
  if (notDecided === "true" && eventType === "pending") {
    decideGuide();
    inDecision = true;
  }

  if (eventType === "ongoing") {
    $.get("/events/" + eventId + "/heatmap", drawHeatmap);
  } else {
    $.get("/events/" + eventId + "/heatmap?self=true", drawHeatmap);
  }
  if (eventType === "ongoing") {
    $.get("/events/" + eventId + "/slots", drawSlot);
  }
  if (eventType === "done") {
    $.get("/events/" + eventId + "/decide", drawSlot).then(function() {
      $(".draw").addClass("final-decision").html('<p id="star-icon"><span class="glyphicon glyphicon-star"></span></p>');
    });
  }
  drawCalendar();

  $("#scroll-pane").scrollTop(360);
  scrollHookup();
  dayHookup();
  if (eventType === "ongoing" || inDecision) {
    slotHookup();
  }
});

