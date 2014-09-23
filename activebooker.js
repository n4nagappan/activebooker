var bookingTime = 18;
var bookingDate = new Date("10/05/2014");

var epochTime = bookingDate.getTime()/1000; 
var logImages = true; //set to true to log images at different stages
var fs = require('fs');
var credentials = JSON.parse(fs.read('credentials.json'));

var casper = require('casper').create();

//========================================================
//********* Utility Functions *********

function getAvailableSlots() {
    //select the available slot
    var availableSlots = document.querySelectorAll('input:not([disabled])[name="timeslots[]"]');
    console.log("Available Slots:\n", availableSlots.length);
    return Array.prototype.map.call(availableSlots, function(e) {
        return e.value;
    });
}

function parseSlots(availableSlots) {
    var parsedSlots = [];
    for (i = 0; i < availableSlots.length; ++i) {
        var info = availableSlots[i].split(";"); // parse and tokenize the string
        var slot = {};
        slot.court = info[0];
        slot.blah = info[1];
        slot.id = info[2];
        slot.start = info[3];
        slot.end = info[4];

        parsedSlots.push(slot);
    }

    return parsedSlots;
}
//========================================================

casper.options.viewportSize = {
    width: 1600,
    height: 950
};

casper.start("https://members.myactivesg.com/auth", function() {

    console.log("Started...");

    logImages && this.capture('stage1_login.png');
    console.log("Currently @ Page : " + this.getCurrentUrl());

    this.fill('form#formSignin', credentials, true);

    logImages && this.capture('stage2_formFilled.png');

    this.click('#btn-submit-login');

});

// wait for the profile page to load
casper.waitForSelector('a[href="https://members.myactivesg.com/profile/mybookings"]', function() {

    logImages && this.capture('stage3_loggedIn.png');
    console.log("Currently @ Page : " + this.getCurrentUrl());
});

//casper.thenOpen('https://members.myactivesg.com/facilities', function() {});
//
//casper.waitForSelector('select[id="activity_filter"]', function() {
//    console.log(this.getCurrentUrl());
//    this.capture('site.png');
//    // fill the order details
//    this.fill('form#formFacFilter', {
//        'activity_filter': 18,    // 18 is for badminton. May change in future
//        'venue_filter': 318,   
//        'day_filter': 3,    
//        'date_filter': 'Wed, 1 Oct 2014'
//    },true);
//
//});
//
//casper.waitForSelector('h3.timeslot', function() {
//    this.capture('site.png');    
//});

// shortcut through url
casper.thenOpen('https://members.myactivesg.com/facilities/view/activity/18/venue/318?time_from=' + epochTime, function() {

    logImages && this.capture('stage4_slots.png');
    console.log("Currently @ Page : " + this.getCurrentUrl());
    var availableSlots = this.evaluate(getAvailableSlots);

    //Parse slots info
    var parsedSlots = parseSlots(availableSlots);
    console.log("Parsed Slots : ");
    console.log(JSON.stringify(parsedSlots,undefined,2));

    //filter those slots before 8 pm

    var filteredSlots = Array.prototype.filter.call(parsedSlots,function(e) {
        var hour = JSON.parse(e.start.split(":")[0]);
        return (hour === bookingTime);
    });
    
    console.log("Filtered Slots : ");
    console.log(JSON.stringify(filteredSlots,undefined,2));
});

casper.run();