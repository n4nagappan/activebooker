var bookingTimes = [18, 19]; // hour in 24-hour format , eg: 18 is for 6:00 pm

var bookingDate = new Date("10/22/2014"); // Note: mm/dd/yyyy
//var bookingDate = new Date();
//bookingDate.setDate(bookingDate.getDate() + 14); // add 2 weeks
console.log("Bookind Date :" + bookingDate);

//=============================================================================
var epochTime = bookingDate.getTime() / 1000 ;
var logImages = true; //set to true to log images at different stages
var fs = require('fs');
var credentials = JSON.parse(fs.read('credentials.json'));

var casper = require('casper').create();
casper.options.waitTimeout = 25000; 
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

    this.fill('form#formSignin', {
        email: credentials.email,
        password: credentials.password
    }, true);

    logImages && this.capture('stage2_formFilled.png');

    this.click('#btn-submit-login');

});

// wait for the profile page to load
casper.waitForSelector('a[href="https://members.myactivesg.com/profile/mybookings"]', function() {

    logImages && this.capture('stage3_loggedIn.png');
    console.log("Currently @ Page : " + this.getCurrentUrl());
});

casper.thenOpen('https://members.myactivesg.com/facilities/quick-booking', function() {});

casper.waitForSelector('select[id="activity_filter"]', function() {
    console.log(this.getCurrentUrl());
    this.capture('site.png');
    // fill the order details
    this.fill('form#formQuickBookSearch', {
        'activity_filter': 18,    // 18 is for badminton. May change in future
        'venue_filter': 301,   
        'date_filter': 'Wed, 22 Oct 2014'
    },true);

});

casper.waitForSelector('.timeslot-container', function() {
        logImages && this.capture('stage4_slots.png');
    console.log("Currently @ Page : " + this.getCurrentUrl());
    var availableSlots = this.evaluate(getAvailableSlots);

    //Parse slots info
    var parsedSlots = parseSlots(availableSlots);
    console.log("Parsed Slots : ");
    console.log(JSON.stringify(parsedSlots, undefined, 2));

    //filter those slots before 8 pm

    var filteredSlots = Array.prototype.filter.call(parsedSlots, function(e) {
        console.log(e.start);
        var hour = parseInt(e.start.split(":")[0]);
        return ((bookingTimes.indexOf(hour)) > (-1));
    });

    console.log("Filtered Slots : ");
    console.log(JSON.stringify(filteredSlots, undefined, 2));

    //book courts
    if (filteredSlots.length > 0) {
        var targetSlot = filteredSlots[0];
        this.click("[id='" + targetSlot.id + "']");
        console.log("Booking clicked :" + targetSlot.id);
    }
    else
    {
        console.log("Exiting...");
        casper.exit();
    }
});

//// quicker via through url
//casper.thenOpen('https://members.myactivesg.com/facilities/view/activity/18/venue/301?time_from=' + epochTime, function() {
//
//});

casper.waitForSelector("#paynow", function() {
    logImages && this.capture('test1.png');
});

casper.then(function() {
    this.click("#paynow"); //add to cart
    console.log("Add to cart clicked");
});

casper.wait(1000);

casper.thenOpen('https://members.myactivesg.com/cart', function() {
    logImages && this.capture('stage5_shoppingCart.png');
    console.log("Currently @ Page : " + this.getCurrentUrl());
});

casper.waitForSelector("#payment_mode_1", function() {
    //select payment mode 
    this.click("#payment_mode_1");
    //enter pin
    for (var i = 0; i < 6; ++i) {
        this.sendKeys('input.wallet-password:nth-child(' + (i+1) + ')', credentials.pin[i]);
    }
    
    logImages && this.capture('stage6_afterPin.png');
});

casper.then(function() {
    //this.click("input[name='']"); //confirm booking
    casper.click('input[type="submit"][name="pay"]');

});

casper.waitForSelector("a[href='https://members.myactivesg.com/']", function() {
    console.log("Confirmed booking");
    logImages && this.capture('stage7_confirmedBooking.png');    
});
casper.run();