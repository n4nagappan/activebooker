var cronJob = require('cron').CronJob;
var exec = require('child_process').exec;

new cronJob('00 00 07 * * * ', function() {    
    startScript();   
    startScript();   
    startScript();   
}, null, true);

new cronJob('01 00 07 * * * ', function() {    
    startScript();   
    startScript();   
}, null, true);

function startScript()
{
    exec('"node_modules/casperjs/bin/casperjs" activebooker.js', function(err, stdout, stderr) {
        if(err)
        {
            console.log("error : "+err);
            return ;
        }
        console.log("stdout :\n" + stdout);
    });
}