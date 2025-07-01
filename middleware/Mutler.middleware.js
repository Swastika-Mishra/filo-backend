const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
require("dotenv").config();

const bucketName = process.env.AWS_BUCKET_NAME;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const multerFilter = (req, file, cb) => {
  const allowedMimeTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/json",
    "application/xml",
    "text/xml",
    "text/markdown",
    "text/x-python",
    "text/x-java-source",
    "text/java",
    "text/x-c",
    "text/x-c++src",
    "application/x-sh",
    "text/x-shellscript",
    "application/x-bash",
    "text/csv",
    "application/x-yaml",
    "text/yaml",
    "application/x-tex",
    "text/x-tex",
    "text/html",
    "application/javascript",
    "text/javascript",
    "application/typescript",
    "text/typescript",
    "text/css",
    "text/x-dockerfile",
    "application/sql",
    "text/sql",
  ]);
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    // acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      console.log(file.originalname);
      cb(null, file.originalname);
    },
  }),
  multerFilter
});

module.exports = upload;
