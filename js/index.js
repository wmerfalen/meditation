"use strict";

$(function() {
  var animationEndPrefixes = "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd";
  function timer(){}
  timer.prototype = {
        interval: 0,
        callCount: 0,
        startTime: null,
        selectedTimeInterval: 0,
        meditationProgressTimer: null,
        run: function(restart){
            if (restart) {
                this.startTime = Date.now();
            }
            var elapsed = parseInt((Date.now() - this.startTime) / 1000.0);
            var timeRemaining = (this.selectedTimeInterval * 60) - elapsed;

            var minutesRemaining = parseInt(timeRemaining / 60);
            var secondsRemaining = timeRemaining % 60;
            function doubleDigits(num) {
                if (num < 10) {
                    return "0" + num;
                }
                return num;
            }
            $("#meditation-text").html(doubleDigits(minutesRemaining) + ":" +
                                 doubleDigits(secondsRemaining));
            if (timeRemaining > 0) {
                var temp = this;
                this.meditationProgressTimer = window.setTimeout(function(){ temp.run() }, 1000);
            } else {
                // we're done
                $("#meditation-text").html("<span class='blink'>00:00</span>");
                window.clearTimeout(this.meditationProgressTimer);
            }
            if($("#intervalset").is(':checked') && (this.callCount++ % this.interval == 0)){
                $("#bell").get(0).pause();
                $("#bell").get(0).currentTime = 0;
                $("#bell").get(0).play();
            }
        },
        reset: function(){
          $("#bell").off();
          window.clearTimeout(this.meditationProgressTimer);
          this.meditationProgressTimer = null;
          $("#about-link").show();
          $("#start-button").html("Begin");
        }
    };

  var t = new timer();
  function setupTimer() {
    var timeIntervals = [10, 15, 20, 25, 30, 35, 40];
    var selectedTimeInterval = parseInt(window.localStorage.defaultTimeInterval);
    if ($.inArray(selectedTimeInterval, timeIntervals) < 0) {
      selectedTimeInterval = 20;
    }
    var lock = null;

    $("#content").html(ich.meditationDialog({ 'duration': selectedTimeInterval }));
    $("#meditation-dialog").fadeIn('fast');

    $("#time-options").append(ich.timeOptionButtons({'timeIntervals': timeIntervals.map(function v(val) { return { "value": val } }) }));

    function intervalSelected(timeInterval) {
      selectedTimeInterval = timeInterval;
      window.localStorage.defaultTimeInterval = selectedTimeInterval;
      $("#meditation-text").html(timeInterval + " minute meditation");
      $(".time-selector-btn").removeClass('btn-link-selected');
      $("#time-button-" + timeInterval).addClass('btn-link-selected');
    };
    timeIntervals.forEach(function(timeInterval) {
      $("#time-button-" + timeInterval).click(function() {
        intervalSelected(timeInterval);
      });
    });
    intervalSelected(selectedTimeInterval);

    function reset() {
        if(lock){
            lock.unlock();
            lock = null;
        }
        intervalSelected(selectedTimeInterval);
        t.reset();
    }

    $("#start-button").click(function() {
      if (window.navigator.requestWakeLock) {
        // currently only works on FirefoxOS :(
        lock = window.navigator.requestWakeLock('screen');
      }
      if (t.meditationProgressTimer) {
        $("#bell").get(0).pause(); // stop bell if playing
        reset();
        return;
      }

      t.meditationProgressTimer = window.setTimeout(function() {
        t.interval = $("#interval").val();
        t.selectedTimeInterval = selectedTimeInterval;
        t.run(true);
      }, 1000);

      $("#start-button").html("Cancel");
      $("#about-link").hide();
      $("#meditation-text").html("Prepare for meditation " +
                                 "<span class='blink'>...</span>");

    $("#about-link").click(function() {
      $("#meditation-dialog").fadeOut("fast", function() {
        $("#content").html(ich.aboutDialog());
        $("#about-dialog").fadeIn('fast');
        $("#return-button").click(function() {
          $("#about-dialog").fadeOut("fast", function() {
            setupTimer();
          });
        })
      });
    });
  }); //Start button .click
  }//Setup timer
  setupTimer();
});
