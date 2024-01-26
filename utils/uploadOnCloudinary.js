const AppError = require(`${__dirname}/AppError.js`);
const catchAsync = require(`${__dirname}/catchAsync.js`);

const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const factory = (width, height) => catchAsync(async (req, res, next) => {
  if (!req.file)
    return next(new AppError('No file is uploaded', 400));

  await sharp(req.file.buffer)
    .resize(width, height)
    .toFormat('jpeg')
    .toFile(`${__dirname}/uploadedImage.jpeg`);
    
  const result = await cloudinary.uploader.upload(`${__dirname}/uploadedImage.jpeg`, { folder: "uploads" });
  req.file.filename = result.secure_url;
  next();
})

exports.resizeProfilePhoto = factory(500, 500);
exports.resizeCoverPhoto = factory(2000, 500);

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) 
    return cb(new AppError('the file should be an image'), false);
  cb(null, true);
}

const storage = multer.memoryStorage();
exports.upload = multer({
  fileFilter,
  storage
});