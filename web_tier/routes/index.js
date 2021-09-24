require("dotenv").config();
var express = require('express');
var multer  = require('multer')
var s3 = require('../services/s3');
var sqs = require('../services/sqs');
var loadBalance = require('../services/loadBalance');

var router = express.Router();

var storage = multer.memoryStorage();
var upload = multer({ storage: storage })

var s3InputURI = 's3://'+process.env.aws_input_bucket+'/'

setTimeout(() => {
  loadBalance.scaleInScaleOut(0);
}, 1000);

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Deep Recognition' });
});

router.get('/interactive', (req, res, next) => {
  res.render('interactive', { title: 'Deep Recognition' });
});

router.post('/', upload.array('file', 200), (req,res) => {
  const timestamp = new Date().toISOString();
  req.output = []
  var responsesReceived = 0
  req.files.forEach((file, index, files) => {
    const originalName = file.originalname.replace(/ /g,'_');
    const key = timestamp.replace(/:/g, '-')+'-'+originalName+'_'+index;
    const imageURI = s3InputURI+key;
    s3.upload(process.env.aws_input_bucket, key, file, ()=>{
      sqs.sendMessage(process.env.aws_request_queue_url, imageURI, ()=>{
        loadBalance.totalRequests.value++;
        sqs.receiveMessage(process.env.aws_response_queue_url, imageURI, (prediction)=>{
          var data = Buffer.from(file.buffer).toString('base64');
          req.output.push({data:data, originalName: originalName, prediction:prediction})
          responsesReceived++;
          loadBalance.totalRequests.value--;
          if (responsesReceived == files.length){
            res.render('response', {output: req.output, title: 'Deep Recognition' });
          }
        });
      });
    });
  });
});

router.post('/interactive', upload.single('file'), (req,res) => {
  const timestamp = new Date().toISOString();
  const file = req.file;
  const originalName = file.originalname.replace(/ /g,'_');
  const key = timestamp.replace(/:/g, '-')+'-'+originalName;
  const imageURI = s3InputURI+key;
  s3.upload(process.env.aws_input_bucket, key, file, ()=>{
    sqs.sendMessage(process.env.aws_request_queue_url, imageURI, ()=>{
      loadBalance.totalRequests.value++;
      sqs.receiveMessage(process.env.aws_response_queue_url, imageURI, (prediction)=>{
        var data = Buffer.from(file.buffer).toString('base64');
        loadBalance.totalRequests.value--;
        res.send({data:data, originalName: originalName, prediction:prediction});
      });
    });
  });
});

module.exports = router;
