var cronJob = require('cron').CronJob;
var exec = require('child_process').exec;

var fs = require('fs');
fs.readFile('credentials.json','utf8', function(err,data){
    var credentials = JSON.parse(data);
    console.log(credentials);

    new cronJob('55 59 06 * * * ', function() {    
        startScript(credentials[0].id,credentials[0].password,7);
        startScript(credentials[1].id,credentials[1].password,8);
    }, null, true);

    new cronJob('58 59 06 * * * ', function() {    
        startScript(credentials[0].id,credentials[0].password,9);
        startScript(credentials[1].id,credentials[1].password,10);
    }, null, true);

    function startScript(id,password,hour)
    {
        exec('"node_modules/casperjs/bin/casperjs" activebooker.js --id="' + id + '" --password="' + password + '" --hour=' + hour, function(err, stdout, stderr) {
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
