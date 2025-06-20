const { GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
require("dotenv").config();
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");

const bucketName = process.env.AWS_BUCKET_NAME;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.uploadFile = async (req, res) => {
  if (req.file) {
    res.status(200).send(`File uploaded successfully`);
  } else {
    res.status(400).send("No file uploaded");
  }
};

exports.listDir = async (req, res, next) => {
  try {
    const command = new ListObjectsV2Command({Bucket: bucketName});
    const result = await s3.send(command);
    const files = (result.Contents || []).map((item) => ({
      filename: item.Key,
      size : `${(item.Size / 1024).toFixed(2)} KB`,
      lastModified : item.LastModified,
    }));
    res.status(200).json(files);
  } catch (err) {
    console.error("Failed to list files", err.stack);
    next(err);
  }
};

exports.downloadFile = async (req, res, next) =>{
  try{
    const file = req.params.filename;
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: file,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // Presigned URL
    res.json({ url });
  } catch (err){
    console.error("Failed to generate download URL", err.stack);
    next(err);
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const filename = req.params.filename;
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filename,
    });
    await s3.send(command);
    res.status(204).send("Deleted successfully");
  } catch (err) {
    console.error("Failed to delete the file", err.stack);
    next(err);
  }
};
