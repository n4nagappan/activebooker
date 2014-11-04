var cronJob = require('cron').CronJob;
var exec = require('child_process').exec;

var fs = require('fs');
fs.readFile('credentials.json','utf8', function(err,data){
    var credentials = JSON.parse(data);
    console.log(credentials);

    for(var n =50 ; n<=59 ; n+=3)
    {
        new cronJob(n+' 59 06 * * * ', function() {    
            startScript(credentials[0].id ,credentials[0].password,19 , [9,10,11,12]); //24 hour
        }, null, true);        
    }
    
    function startScript(id,password,hour,court)
    {
        exec('"node_modules/casperjs/bin/casperjs" activebooker.js --id="' + id + '" --password="' + password + '" --hour=' + hour +' --court='+JSON.stringify(court), function(err, stdout, stderr) {
            if(err)
            {
                console.log("error : "+err);
                return ;
            }
            console.log("stdout :\n" + stdout);
        });
    }

    console.log("Cron job started...");
    
});
