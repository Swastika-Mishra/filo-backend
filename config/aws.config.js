const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
require('dotenv').config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const s3 = new AWS.S3();