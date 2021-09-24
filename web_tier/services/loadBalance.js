require("dotenv").config();
var AWS = require("aws-sdk");
var sqs = require('./sqs')
var ec2 = require('./ec2')
var Sentry = require("@sentry/node");

var totalRequests = {value:0};

Sentry.init({
    dsn: process.env.sentry_url,
    tracesSampleRate: 1.0,
});

function scaleInScaleOut(currentInstance){
    if (totalRequests.value > 0){
        try{
            sqs.getNumberOfMessages(process.env.aws_request_queue_url, (numberOfMessages) => {
                try{
                    console.log('numberOfMessages: ', numberOfMessages)
                    ec2.getNumberOfInstances((numberOfAppInstances) => {
                        console.log('numberOfAppInstances: ', numberOfAppInstances)
                        const available = process.env.aws_max_app_instances - numberOfAppInstances;
                        console.log('available: ', available)
                        if (numberOfMessages > 0 && numberOfMessages > numberOfAppInstances && available > 0){
                            var required  = numberOfMessages - numberOfAppInstances;
                            console.log('required: ', required)
                            if(required >= available){
                                required = available;
                            }
                            ec2.createInstances(required, numberOfAppInstances, (existingInstances) => {
                                console.log('Success createInstances', existingInstances);
                                setTimeout(() => {
                                    scaleInScaleOut(existingInstances);
                                }, 1000);
                            });
                        }
                        else{
                            setTimeout(() => {
                                scaleInScaleOut(currentInstance);
                            }, 1000);
                        }
                    });
                }catch(err) {
                    setTimeout(() => {
                        scaleInScaleOut(currentInstance);
                    }, 1000);
                    Sentry.captureException(new Error('scaleInScaleOut'), Sentry.setContext("scaleInScaleOut", err));
                }
            })
        }catch(err) {
            setTimeout(() => {
                scaleInScaleOut(currentInstance);
            }, 1000);
            Sentry.captureException(new Error('scaleInScaleOut'), Sentry.setContext("scaleInScaleOut", err));
        } 
    }else{
        setTimeout(() => {
            scaleInScaleOut(currentInstance);
        }, 1000);
    }
}

module.exports = {
    scaleInScaleOut,
    totalRequests
}