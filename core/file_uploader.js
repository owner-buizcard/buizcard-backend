// const AWS = require('aws-sdk');
// const path = require('path');
// const fs = require('fs');

// const accessKeyId = 'AKIATPFKBFSE2DOYEP22';
// const secretAccessKey = '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';
// const region = 'ap-south-1';

const BUCKET = 'bc-dev-v1';

// module.exports.uploadFileToFirestore=async(firebaseApp, folderName, file)=>{
//     const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
    
//     const storage = getStorage(firebaseApp);
//     const storageRef = ref(storage, 'your-storage-path/' + file.name);
//     await uploadBytes(storageRef, file.data, {
//         contentType: 'image/jpeg',
//       });
//     const downloadURL = await getDownloadURL(storageRef);
//     return downloadURL;
// }

module.exports.uploadFile=async(folderName, file)=>{
    let _uploadFolder = folderName;
    var extension = file.name.substr(file.name.lastIndexOf(".") + 1, file.name.length - 1);
    console.log(extension);
    const newName = `${_uploadFolder}${this.makeid(30)}.${extension}`;
    const _fileUrl = await this.uploadObjectToS3Bucket(newName, file.mimetype, file.data);
    const file_url = _fileUrl.substring(0, _fileUrl.indexOf('?'));
    return file_url;
}

module.exports.uploadObjectToS3Bucket=async(objectName, mimeType, objectData)=>{
    console.log()
    const aws = require('aws-sdk');
    const BUCKET_NAME = BUCKET;
    const params = {
        Bucket: BUCKET_NAME,
        Key: objectName,
        Body: objectData,
        ContentType: mimeType,
    };
    const s3 = new aws.S3({});
    const _result = await s3.putObject(params).promise();
    const _params = { Bucket: BUCKET_NAME, Key: objectName };
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

