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
  const BUCKET_NAME = process.env.S3_BUCKET_NAME;
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
};

module.exports.generatePreviewImage = async(card)=>{

  const qr = require('qrcode');
  const Jimp = require('jimp');
  
  const backgroundImagePath =
    'https://firebasestorage.googleapis.com/v0/b/bizcard-web.appspot.com/o/preview%2Fbackground.png?alt=media&token=214f70c1-4f00-46bb-a4a9-9bf93b3a8666';

    
  const qrData = `${process.env.ORIGIN}/app/p?cardId=${card._id}`;
  let qrDataURL = await qr.toDataURL(qrData, { margin: 1 });

  // Make images readable
  let [image, qrImage, profileImage] = await Promise.all([
    Jimp.read(backgroundImagePath),
    Jimp.read(Buffer.from(qrDataURL.split(',')[1], 'base64')),
    card.picture!=null ? Jimp.read(card.picture) : null
  ]);

  // Combine image with QR code
  image.resize(image.bitmap.width * 0.5, image.bitmap.height * 0.5);
  qrImage.resize(image.bitmap.height * 0.4, image.bitmap.height * 0.4);

  const xPosition = image.bitmap.width - qrImage.bitmap.width - 45;
  const yPosition = (image.bitmap.height - qrImage.bitmap.height) / 1.2;

  image.composite(qrImage, xPosition, yPosition);

  if(profileImage){
    profileImage.resize(image.bitmap.height * 0.4, image.bitmap.height * 0.4);
    image.composite(profileImage, 20, 20);
  }


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

  const _fileUrl = await this.uploadObjectToS3Bucket(`${card._id}/previewImage.jpg`, 'image/jpeg', buffer);
  const file_url = _fileUrl.substring(0, _fileUrl.indexOf('?'));
  return file_url;
}



module.exports.sendEmail=async(toEmail, subject, renderedTemplate)=>{

  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(process.env.EMAIL_API_KEY)

  try{

    const msg = {
      to: toEmail,
      from: {
        name: process.env.FROM_EMAIL_NAME,
        email: process.env.FROM_EMAIL
      },
      subject: subject,
      html: renderedTemplate
    }

    await sgMail.send(msg);
  }catch(e){
    console.log(e.toString());
  }
}