module.exports.isNumeric = (value) => {
  return /^-?\d+$/.test(value);
};

module.exports.isStatusCode = (statusCode) => {
  return this.isNumeric(statusCode) && statusCode >= 100 && statusCode < 600;
};

module.exports.isValidDate = (date) => {
  console.log(date, !isNaN(Date.parse(date)));
  return !isNaN(Date.parse(date));
};

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

module.exports.getYYYYMMDDHHMM = () => {
  var x = new Date();
  var y = x.getFullYear().toString();
  var m = (x.getMonth() + 1).toString();
  var d = x.getDate().toString();
  var hours = x.getHours().toString();
  var minutes = x.getMinutes().toString();

  (d.length == 1) && (d = '0' + d);
  (m.length == 1) && (m = '0' + m);
  (hours.length == 1) && (hours = '0' + hours);
  (minutes.length == 1) && (minutes = '0' + minutes);

  var yyyymmddhhmm = y + m + d + hours + minutes;
  return yyyymmddhhmm;
};

module.exports.getDDMMYYYY = (currentDate = new Date(), seperator = '-') => {

  var month = currentDate.getMonth() + 1;
  if (month < 10) month = "0" + month;
  var dateOfMonth = currentDate.getDate();
  if (dateOfMonth < 10) dateOfMonth = "0" + dateOfMonth;
  var year = currentDate.getFullYear();
  var formattedDate = dateOfMonth + seperator + month + seperator + year;
  return formattedDate;

}

const accessKeyId = 'AKIATPFKBFSE5AYZRBKA';
const secretAccessKey = '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';
const region = 'ap-south-1';
const BUCKET = 'bc-dev-v1';

module.exports.uploadFile=async(folderName, file)=>{
  let _uploadFolder = folderName;
  var extension = file.name.substr(file.name.lastIndexOf(".") + 1, file.name.length - 1);
  console.log(extension);
  const newName = `${_uploadFolder}${this.makeid(30)}.${extension}`;
  const _fileUrl = await this.uploadObjectToS3Bucket(newName, file.mimetype, file.data);
  const file_url = _fileUrl.substring(0, _fileUrl.indexOf('?'));
  return file_url;
}

module.exports.uploadObjectToS3Bucket = async (objectName, mimeType, objectData) => {
  const aws = require('aws-sdk');
  const BUCKET_NAME = 'bc-dev-v1';
  const params = {
    Bucket: BUCKET_NAME,
    Key: 'test.jpeg',
    Body: objectData,
    ContentEncoding: 'base64',
    ContentType: mimeType,
  };
  console.log(params)
  const s3 = new aws.S3({});
  const _result = await s3.putObject(params).promise();
  console.log(_result)
  const _params = { Bucket: BUCKET_NAME, Key: 'test.jpeg' };
  const url = s3.getSignedUrl('getObject', _params);
  return url;
};

module.exports.generatePreviewImage = async(jobId)=>{

  const qr = require('qrcode');
  const Jimp = require('jimp');
  
  const backgroundImagePath =
    'https://firebasestorage.googleapis.com/v0/b/bizcard-web.appspot.com/o/preview%2Fbackground.png?alt=media&token=214f70c1-4f00-46bb-a4a9-9bf93b3a8666';

  const profileUrl =
    'https://firebasestorage.googleapis.com/v0/b/bizcard-web.appspot.com/o/WhatsApp%20Image%202023-11-23%20at%2010.30.25%20PM.jpeg?alt=media&token=c853d384-161f-49cc-bf91-a590f81d0cc8';

  const qrData = `test`;
  let qrDataURL = await qr.toDataURL(qrData, { margin: 1 });

  // Make images readable
  let [image, qrImage, profileImage] = await Promise.all([
    Jimp.read(backgroundImagePath),
    Jimp.read(Buffer.from(qrDataURL.split(',')[1], 'base64')),
    Jimp.read(profileUrl),
  ]);

  // Combine image with QR code
  image.resize(image.bitmap.width * 0.5, image.bitmap.height * 0.5);
  qrImage.resize(image.bitmap.height * 0.4, image.bitmap.height * 0.4);

  profileImage.resize(image.bitmap.height * 0.4, image.bitmap.height * 0.4);

  const xPosition = image.bitmap.width - qrImage.bitmap.width - 45;
  const yPosition = (image.bitmap.height - qrImage.bitmap.height) / 1.2;

  image.composite(qrImage, xPosition, yPosition);

  image.composite(profileImage, 20, 20);

  // Your HTML content goes here
  // const htmlContent = `<div style="margin: 16px; color: black; font-size: 24px; background: transparent; position: relative; height: 320px; width: 560px">
  //   <p style="position: absolute; top: 0px; right: 10px; color: white; font-size: 16px">
  //     <b>Instrive Softlabs Pvt ltd</b>
  //   </p>
  //   <p style="position: absolute; bottom: 60px; ">
  //     <b>Dhana Sekaran R</b>
  //   </p>
  //   <p style="position: absolute; color: dimgrey; font-size: 16px; bottom: 40px;">
  //     Flutter Developer
  //   </p>
  // </div>`;

  // Use html2canvas to capture the screenshot
  // const canvas = await html2canvas(document.createRange().createContextualFragment(htmlContent));
  // const screenshotBuffer = await canvas.toDataURL('image/jpeg');
  // const screenshotImage = await Jimp.read(Buffer.from(screenshotBuffer.split(',')[1], 'base64'));

  // const maxWidth = image.bitmap.width - 20;

  // image.composite(screenshotImage, 0, 0, {
  //   mode: Jimp.BLEND_SOURCE_OVER,
  //   opacitySource: 1,
  //   opacityDest: 1,
  // });

  let buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

  const _fileUrl = await this.uploadObjectToS3Bucket(`previewImage.jpg`, 'image/jpeg', buffer);
  const file_url = _fileUrl.substring(0, _fileUrl.indexOf('?'));
  return file_url;
}