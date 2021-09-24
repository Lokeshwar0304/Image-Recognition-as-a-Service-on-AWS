require("dotenv").config();
var AWS = require("aws-sdk");
var cache = require('./cache');
var Sentry = require("@sentry/node");

Sentry.init({
    dsn: process.env.sentry_url,
    tracesSampleRate: 1.0,
});

let queue = new AWS.SQS({
    region: process.env.aws_region,
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key
});

function sendMessage(queueURI, message, callback){
  var params = {
       DelaySeconds: 0,
       MessageBody: message,
       QueueUrl: queueURI
     };
     queue.sendMessage(params).promise().then((data) => {
        console.log('Succesfully sent to the request queue...', data.MessageId);
        callback();
    }).catch((err) => {
        Sentry.captureException(new Error('sendMessage'), Sentry.setContext("sendMessage", err));
    });
}

function receiveMessage(queueURI, key, callback){
    if (key in cache){
        callback(cache[key]);
        delete cache[key];
    }else{
        const params = {
            MaxNumberOfMessages: 1,
            VisibilityTimeout: 15,
            WaitTimeSeconds: 0,
            QueueUrl: queueURI
        };
        queue.receiveMessage(params).promise().then((data)=>{
            if (data.Messages && data.Messages.length != 0){
                const message = data.Messages[0];
                console.log("Success receiveMessage", message.Body);
                deleteMessage(queueURI, message);
                var values = message.Body.split('#');
                const image = values[0];
                const prediction = values[1];
                cache[image] = prediction;
            }
            receiveMessage(queueURI, key, callback);
        }).catch((err)=>{
            Sentry.captureException(new Error('receiveMessage'), Sentry.setContext("receiveMessage", err));
        });
    }
}

function deleteMessage(queueURI, message){
    const params = {
        QueueUrl: queueURI,
        ReceiptHandle: message.ReceiptHandle
        };
    queue.deleteMessage(params).promise().then((data)=>{
        console.log("Message Deleted", data);
    }).catch((err) => {
        Sentry.captureException(new Error('deleteMessage'), Sentry.setContext("deleteMessage", err));
    });
}

function getNumberOfMessages(queueURI, callback){
    // console.log(queueURI);
    const params = {
        QueueUrl: queueURI,
        AttributeNames: ['ApproximateNumberOfMessages']
    };
    queue.getQueueAttributes(params).promise().then((data)=>{
        callback(data.Attributes.ApproximateNumberOfMessages);
    }).catch((err) => {
        Sentry.captureException(new Error('getNumberOfMessages'), Sentry.setContext("getNumberOfMessages", err));
    });
}
  
module.exports = {
    sendMessage, 
    receiveMessage, 
    getNumberOfMessages
}