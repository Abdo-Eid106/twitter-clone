const AppError = require(`${__dirname}/AppError.js`);
const catchAsync = require(`${__dirname}/catchAsync.js`);

const serviceAccount = require(`${__dirname}/../config/twitter-clone-60655-firebase-adminsdk-8utcq-1cad249165.json`);
const admin = require('firebase-admin');
const multer = require('multer');
const sharp = require('sharp');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.bucket,
});
const bucket = admin.storage().bucket();

const factory = (width, height) => catchAsync(async (req, res, next) => {
  if (!req.file)
    return next(new AppError('No file is uploaded', 400));

  const processedImageBuffer = await sharp(req.file.buffer)
    .resize(width, height)
    .toFormat('jpeg')
    .toBuffer();

  const filename = `${req.user._id}_${Date.now()}.jpeg`;
  const file = bucket.file(filename);

  await file.save(processedImageBuffer, {
    metadata: {
      contentType: 'image/jpeg'
    }
  });

  const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${filename}?alt=media`;
  req.file.filename = imageUrl;
  next();
})

exports.resizeProfilePhoto = factory(500, 500);
exports.resizeCoverPhoto = factory(2000, 500);

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) 
    return cb(new Error('the file should be an image'), false);
  cb(null, true);
}

const storage = multer.memoryStorage();
exports.upload = multer({
  fileFilter,
  storage
});