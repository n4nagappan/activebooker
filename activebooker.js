var casper = require('casper').create();
casper.options.waitTimeout = 30000; 

var fs = require('fs');
var credentials = JSON.parse(fs.read('config.json'));
var opts = casper.cli.options;
console.log(JSON.stringify(casper.cli.options));
if( !opts.id || !opts.password || !opts.hour)
    console.log("Missing one of id/password/hour parameter") || casper.exit();

credentials.email = opts.id;
credentials.password = opts.password;

var bookingHour = opts.hour;
console.log("booking hour : "+ bookingHour);
var bookingCourts = JSON.parse(opts.court);
console.log("booking courts : "+ JSON.stringify(bookingCourts));

var venue = credentials.venue;
console.log("venue : "+ venue);
var bookingDate =  new Date(credentials.bookingDate); // Note: mm/dd/yyyy
var d_names = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
var m_names = new Array("Jan", "Feb", "Mar", 
"Apr", "May", "Jun", "Jul", "Aug", "Sep", 
"Oct", "Nov", "Dec");

//var bookingDate = new Date();
//bookingDate.setDate(bookingDate.getDate() + 14); // add 2 weeks
console.log("Booking Date :" + bookingDate);

var uid = new Date().getTime();
var epochTime = bookingDate.getTime() / 1000 ;
var logImagesFlag = true; //set to true to log images at different stages

//********* Utility Functions *********

function logImage(title)
{
    if(logImagesFlag)
        casper.capture('images/'+title + '_' + credentials.email + '_' + uid+'.png');
}

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

    logImage('stage1_login');
    console.log("Currently @ Page : " + this.getCurrentUrl());

    this.fill('form#formSignin', {
        email: credentials.email,
        password: credentials.password
    }, true);

    logImage('stage2_formFilled');

    this.click('#btn-submit-login');

});

// wait for the profile page to load
casper.waitForSelector('a[href="https://members.myactivesg.com/profile/mybookings"]', function() {

    logImage('stage3_loggedIn');
    console.log("Currently @ Page : " + this.getCurrentUrl());
});


var d = new Date();
//console.log("Hours : " + d.getHours());
if((d.getHours() >= 6) && (d.getHours() < 8)) // use quick booking during 6-8 am in the morning
{
    casper.thenOpen('https://members.myactivesg.com/facilities/quick-booking', function() {});
    casper.waitForSelector('select[id="activity_filter"]', function() {
        console.log(this.getCurrentUrl());
        logImage('stage4_facilitiesPage');
        var formattedDate = d_names[bookingDate.getDay()] + ', ' + bookingDate.getDate() + ' ' + m_names[bookingDate.getMonth()] + ' ' + bookingDate.getFullYear();
        console.log(formattedDate);
        // fill the order details
        this.fill('form#formQuickBookSearch', {
            'activity_filter': 18,    // 18 is for badminton. May change in future
            'venue_filter': venue,   
            'date_filter': formattedDate
        },true);
    });
}
else
{
    casper.thenOpen('https://members.myactivesg.com/facilities', function() {});
    casper.waitForSelector('select[id="activity_filter"]', function() {
       console.log(this.getCurrentUrl());
       logImage('stage4_facilitiesPage');
       var formattedDate = d_names[bookingDate.getDay()] + ', ' + bookingDate.getDate() + ' ' + m_names[bookingDate.getMonth()] + ' ' + bookingDate.getFullYear();
       //console.log(formattedDate);
       // fill the order details
       this.fill('form#formFacFilter', {
           'activity_filter': 18,    // 18 is for badminton. May change in future
           'venue_filter': venue,   
           'day_filter': bookingDate.getDay(),    
           'date_filter': formattedDate
       },true);
       
    });
}

casper.waitForSelector("input[name='timeslots[]']", function() {
    logImage('stage5_slots');
    console.log("Currently @ Page : " + this.getCurrentUrl());
    var availableSlots = this.evaluate(getAvailableSlots);

    //Parse slots info
    var parsedSlots = parseSlots(availableSlots);
    console.log("Parsed Slots : ");
    console.log(JSON.stringify(parsedSlots, undefined, 2));

    //filter those slots before 8 pm

    var filteredSlots = Array.prototype.filter.call(parsedSlots, function(e) {
        //console.log(e.start);
        var hour = parseInt(e.start.split(":")[0]);
        var court = parseInt(e.court.split(" ")[1],10);
        return (bookingHour == hour) && (bookingCourts.indexOf(court) != -1);
    });

    console.log("Filtered Slots : ");
    console.log(JSON.stringify(filteredSlots, undefined, 2));

    //book courts
    if (filteredSlots.length > 0) {
        for(var i = 0 ; i < filteredSlots.length && (i < 2); ++i)
        {
            var targetSlot = filteredSlots[i];
            this.click("[id='" + targetSlot.id + "']");
            logImage('stage6_selectedSlot');
            console.log("Booking clicked :" + targetSlot.id);
        }
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
    //logImage('test1');
});

casper.then(function() {
    this.click("#paynow"); //add to cart
    console.log("Add to cart clicked");
});

casper.wait(1000);

casper.thenOpen('https://members.myactivesg.com/cart', function() {
    //logImage('stage7_shoppingCart');
    casper.capture('images/stage7_shoppingCart_' + uid+'.png');
    console.log("Currently @ Page : " + this.getCurrentUrl());
});

casper.waitForSelector("#payment_mode_1", function() {
    //select payment mode 
    this.click("#payment_mode_1");
    //enter pin
    for (var i = 0; i < 6; ++i) {
        this.sendKeys('input.wallet-password:nth-child(' + (i+1) + ')', credentials.pin[i]);
    }
    
    logImage('stage8_afterPin');
});

//casper.then(function() {
//    casper.click('input[type="submit"][name="pay"]');
//});
//
//casper.waitForSelector("a[href='https://members.myactivesg.com/']", function() {
//    console.log("Confirmed booking");
//    logImage('stage7_confirmedBooking');
//});
casper.run();