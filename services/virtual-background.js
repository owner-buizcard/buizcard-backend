const depManager = require("../core/depManager");
const responser = require("../core/responser");
const { uploadFile, resizedImage, makeid, uploadObjectToS3Bucket } = require("../core/utils");

async function uploadVirtualBG(req, res) {
    try {

        const { image } = req.files;
        const { folder } = req.body;

        const imageUrl = await uploadFile(`${folder}/`, image);
        const resized = await resizedImage(imageUrl);
        const _fileUrl = await uploadObjectToS3Bucket(`${folder}/${makeid(30)}.jpg`, 'image/jpeg', resized);
        const smallImageUrl = _fileUrl.substring(0, _fileUrl.indexOf('?'));

        const data = {
            large: imageUrl,
            normal: smallImageUrl,
            category: folder
        }

        const created = await depManager.VIRTUAL_BACKGROUND.getVirtualBackgroundModel().create(data);

        return responser.success(res, created, "IMAGES_UPLOADED_SUCCESSFULLY");
    } catch (error) {
        console.error(error);
        return responser.error(res, "Failed to upload images", "IMAGE_UPLOAD_ERROR");
    }
}

async function getVirtualBgs(req, res) {
    try {

        const vbs = await depManager.VIRTUAL_BACKGROUND.getVirtualBackgroundModel().find();

        const groupedData = vbs.reduce((result, item) => {
            const category = item.category;
            const existingCategory = result.find(group => group.category === category);
          
            if (existingCategory) {
              existingCategory.items.push(item);
            } else {
              result.push({ category, items: [item] });
            }
          
            return result;
        }, []);

        const extractedData = groupedData.map(categoryData => ({
            category: categoryData.category,
            items: categoryData.items.map(item => ({ _id: item._id, normal: item.normal }))
        }));

        return responser.success(res, extractedData, "VBG_S001");
    } catch (error) {
        console.error(error);
        return responser.success(res, null, "GLOBAL_E001");
    }
}


module.exports = {
    uploadVirtualBG,
    getVirtualBgs
}