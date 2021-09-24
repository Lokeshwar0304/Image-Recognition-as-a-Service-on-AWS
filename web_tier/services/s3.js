require("dotenv").config();
var AWS = require("aws-sdk");
var Sentry = require("@sentry/node");

Sentry.init({
    dsn: process.env.sentry_url,
    tracesSampleRate: 1.0,
});

let bucket = new AWS.S3({
    region: process.env.aws_region,
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key
});

function upload(bucketName, key, file, callback){
    var params = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read"
    };
    bucket.upload(params).promise().then((data) => {
        console.log('Succesfully uploaded to the bucket...', data);
        callback();
    }).catch((err) => {
        Sentry.captureException(new Error('upload'), Sentry.setContext("upload", err));
    });
}

module.exports = {
    upload
};