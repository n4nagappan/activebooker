var fs = require('fs');
var credentials = JSON.parse(fs.read('credentials.json'));

var casper = require('casper').create();

casper.options.viewportSize = {
    width: 1600,
    height: 950
};

casper.start("https://members.myactivesg.com/auth", function() {

    this.echo(this.getTitle());
    //this.capture('site.png');    
    this.fill('form#formSignin', credentials , true);
    
    this.click('#btn-submit-login');
    
});

// wait for the profile page to load
casper.waitForSelector('a[href="https://members.myactivesg.com/profile/mybookings"]', function() {
    console.log(this.getCurrentUrl());
    this.capture('site.png');
});


casper.run();