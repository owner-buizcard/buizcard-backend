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
module.exports.uploadFile=async(folderName, file, fileName)=>{
  let _uploadFolder = folderName;
  var extension = file.name.substr(file.name.lastIndexOf(".") + 1, file.name.length - 1);
  console.log(extension);
  const newName = fileName!=null
    ? `${_uploadFolder}${fileName}.${extension}`
    : `${_uploadFolder}${this.makeid(30)}.${extension}`;
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

module.exports.generateQrImage = async (cardId) => {
  const qr = require('qrcode');
  const Jimp = require('jimp');

  const qrData = `${process.env.ORIGIN}/app/p/card/${cardId}`;
  const qrDataURL = await qr.toDataURL(qrData, { margin: 1 });
  const qrImage = await Jimp.read(Buffer.from(qrDataURL.split(',')[1], 'base64'));

  const buffer = await qrImage.getBufferAsync(Jimp.MIME_JPEG);

  const _fileUrl = await this.uploadObjectToS3Bucket(`${cardId}/qr-code.jpg`, 'image/jpeg', buffer);
  const file_url = _fileUrl.substring(0, _fileUrl.indexOf('?'));
  return file_url;
}

module.exports.generateVbImage = async (card, bgImage) => {
  const qr = require('qrcode');
  const Jimp = require('jimp');

  const qrData = `${process.env.ORIGIN}/app/p/card/${card._id}`;
  const qrDataURL = await qr.toDataURL(qrData, { margin: 1 });

  const [qrImageBuffer, backgroundImage, fonts] = await Promise.all([
    Buffer.from(qrDataURL.split(',')[1], 'base64'),
    Jimp.read(bgImage),
    loadFonts(),
  ]);

  const qrImage = await Jimp.read(qrImageBuffer);
  qrImage.resize(qrImage.bitmap.height * 2.4, qrImage.bitmap.height * 2.4);

  const textColor = 0xFF0000;

  const printText = async (text, font, x, y) => {
    if (text) {
      backgroundImage.print(
        font,
        x,
        y,
        {
          text,
          alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
          alignmentY: Jimp.VERTICAL_ALIGN_TOP,
          rgba: textColor,
        },
        backgroundImage.bitmap.width - 20
      );
    }
  };

  const textPrints = [
    printText('Bizcard', fonts.bold, backgroundImage.bitmap.width - 80, backgroundImage.bitmap.height - 40),
    printText(`${card.name?.firstName} ${card.name?.lastName}`, fonts.name, 30, 90),
    printText(`${card.company?.title}`, fonts.sub, 30, 140),
  ];

  await Promise.all(textPrints);

  const xPosition = backgroundImage.bitmap.width - qrImage.bitmap.width - 105;
  const yPosition = 105;

  backgroundImage.composite(qrImage, xPosition, yPosition);

  const buffer = await backgroundImage.getBufferAsync(Jimp.MIME_JPEG);
  const _fileUrl = await this.uploadObjectToS3Bucket(`${card._id}/bizcard-virtual-background.jpg`, 'image/jpeg', buffer);
  const file_url = _fileUrl.substring(0, _fileUrl.indexOf('?'));
  return file_url;
};

async function loadFonts() {
  const [bold, name, sub] = await Promise.all([
    Jimp.loadFont(Jimp.FONT_SANS_32_WHITE),
    Jimp.loadFont(Jimp.FONT_SANS_128_WHITE),
    Jimp.loadFont(Jimp.FONT_SANS_64_WHITE),
  ]);

  return { bold, name, sub };
}


module.exports.generatePreviewImage = async (card) => {
  const qr = require('qrcode');
  const Jimp = require('jimp');

  const backgroundImagePath ='https://firebasestorage.googleapis.com/v0/b/bizcard-web.appspot.com/o/preview%2Fbackground.png?alt=media&token=214f70c1-4f00-46bb-a4a9-9bf93b3a8666';
  const appLogoPath = 'https://firebasestorage.googleapis.com/v0/b/bizcard-spiderlingz.appspot.com/o/logo%2Fcard.png?alt=media&token=ded33d94-1fb7-4538-9bd4-e307d8bd778a';

  const qrData = `${process.env.ORIGIN}/app/p/card/${card._id}`;
  const qrDataURL = await qr.toDataURL(qrData, { margin: 1 });

  // Make images readable
  const [image, qrImage, profileImage, appLogo] = await Promise.all([
    Jimp.read(backgroundImagePath),
    Jimp.read(Buffer.from(qrDataURL.split(',')[1], 'base64')),
    card.picture ? Jimp.read(card.picture) : null,
    Jimp.read(appLogoPath),
  ]);

  // Combine image with QR code
  image.resize(image.bitmap.width * 0.5, image.bitmap.height * 0.5);
  qrImage.resize(image.bitmap.height * 0.3, image.bitmap.height * 0.3);
  appLogo.resize(appLogo.bitmap.height * 0.08, appLogo.bitmap.height * 0.08);

  const xPosition = image.bitmap.width - qrImage.bitmap.width - 35;
  const yPosition = 105;

  image.composite(qrImage, xPosition, yPosition);

  image.composite(appLogo, image.bitmap.width-180, 20);

  if (profileImage) {
    profileImage.resize(image.bitmap.height * 0.5, image.bitmap.height * 0.5);
    profileImage.circle();
    image.composite(profileImage, 30, (image.bitmap.height / 2) - (profileImage.bitmap.height / 2)-50);
  }

  const boldFont = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  const textColor = 0xFF0000; 
  image.print(
    boldFont,
    image.bitmap.width-80, 
    image.bitmap.height-40, 
    {
      text: 'Bizcard',
      alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
      alignmentY: Jimp.VERTICAL_ALIGN_TOP,
      rgba: textColor, 
    },
    image.bitmap.width - 20 // maximum width
  );

  if(card.name?.firstName && card.name?.lastName){
    const nameFont = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    image.print(
      nameFont,
      30, 
      image.bitmap.height-90, 
      {
        text: `${card.name?.firstName} ${card.name?.lastName}`,
        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP,
        rgba: textColor, 
      },
      image.bitmap.width - 20 // maximum width
    );
  }

    if(card.company?.title){
      const subFont = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
      image.print(
        subFont,
        30, 
        image.bitmap.height-50, 
        {
          text: `${card.company?.title}`,
          alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
          alignmentY: Jimp.VERTICAL_ALIGN_TOP,
          rgba: textColor, 
        },
        image.bitmap.width - 20 // maximum width
      );
    }

  const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

  const _fileUrl = await this.uploadObjectToS3Bucket(`${card._id}/previewImage.jpg`, 'image/jpeg', buffer);
  const file_url = _fileUrl.substring(0, _fileUrl.indexOf('?'));
  return file_url;
};


module.exports.resizedImage = async (input) => {
  const Jimp = require('jimp');
  try {
      const image = await Jimp.read(input);
      const targetHeight = (image.bitmap.height / image.bitmap.width) * 500;
      image.resize(500, targetHeight);
      const imageBuffer = await image.getBufferAsync(Jimp.MIME_JPEG); 
      return imageBuffer;
  } catch (error) {
      console.error('Error resizing image:', error);
      throw new Error('Failed to resize image');
  }
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