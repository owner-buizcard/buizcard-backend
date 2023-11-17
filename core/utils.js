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
  const _uploadFolder = folderName;
  const extension = file.name.substr(file.name.lastIndexOf('.') + 1);
  console.log(extension);
  const newName = `${_uploadFolder}${this.makeid(30)}.${extension}`;
  const fileUrl = await this.uploadObjectToS3Bucket(newName, file.mimetype, file.data);
  return fileUrl.substring(0, fileUrl.indexOf('?'));
}

module.exports.uploadObjectToS3Bucket = async (objectName, mimeType, objectData) => {
  const aws = require('aws-sdk');
  aws.config.update({
    secretAccessKey: "AKIARFRP5ILSGOVHVDB6",
    accessKeyId: "+qOmID128azJlTiHoe3cjB+00HHPCfSGnuf3zpwc",
    region: 'ap-south-1'
  })
  const BUCKET = "bizcard-dev";
  const params = {
    Bucket: BUCKET,
    Key: objectName,
    Body: objectData,
    ContentType: mimeType,
  };
  const s3 = new aws.S3({});
  const _result = await s3.putObject(params).promise();
  const _params = { Bucket: BUCKET, Key: objectName };
  const url = s3.getSignedUrl('getObject', _params);
  return url;
};