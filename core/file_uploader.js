const AWS = require('aws-sdk');


const accessKeyId = 'AKIARFRP5ILSHWNXU7EC';
const secretAccessKey = '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';
const region = 'ap-south-1';
const BUCKET = 'bizcard-dev';


module.exports.uploadFile=async(folderName, file)=>{

    const _uploadFolder = folderName;
    const extension = file.name.substr(file.name.lastIndexOf('.') + 1);
    console.log(extension);
    const newName = `${_uploadFolder}${this.makeid(30)}.${extension}`;
    const fileUrl = await this.uploadObjectToS3Bucket(newName, file.mimetype, file.data);
    return fileUrl.substring(0, fileUrl.indexOf('?'));
}

module.exports.uploadObjectToS3Bucket=async(objectName, mimeType, objectData)=>{
    const s3 = new AWS.S3({
        secretAccessKey: secretAccessKey,
        accessKeyId: accessKeyId,
        region: region
      })
    const params = {
        Bucket: BUCKET,
        Key: objectName,
        Body: objectData,
        ContentType: mimeType,
    };
    const _result = await s3.putObject(params).promise();
    const _params = { Bucket: BUCKET, Key: objectName };
    const url = s3.getSignedUrl('getObject', _params);
    return url;
}

module.exports.makeid = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
};

