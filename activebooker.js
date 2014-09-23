var logImages = true; //set to true to log images at different stages

var fs = require('fs');
var credentials = JSON.parse(fs.read('credentials.json'));

var casper = require('casper').create();

casper.options.viewportSize = {
    width: 1600,
    height: 950
};

casper.start("https://members.myactivesg.com/auth", function() {

    console.log("Started...");
    
    logImages && this.capture('stage1_login.png');
    console.log("Currently @ Page : "+this.getCurrentUrl());
      
    this.fill('form#formSignin', credentials, true);
    
    logImages && this.capture('stage2_formFilled.png');
    
    this.click('#btn-submit-login');

});

// wait for the profile page to load
casper.waitForSelector('a[href="https://members.myactivesg.com/profile/mybookings"]', function() {
    
    logImages && this.capture('stage3_loggedIn.png');
    console.log("Currently @ Page : "+this.getCurrentUrl());
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
casper.thenOpen('https://members.myactivesg.com/facilities/view/activity/18/venue/318?time_from=1412438400', function() {

    logImages && this.capture('stage4_slots.png');
    console.log("Currently @ Page : "+this.getCurrentUrl());
    
    //select the available slot
    var availableSlots = document.querySelectorAll('input:not([disabled])[name="timeslots[]"]');
    console.log("Available Slots:\n", availableSlots.length);
});

casper.run();