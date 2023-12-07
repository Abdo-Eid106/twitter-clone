const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

exports.resizeProfilePhoto = (req, res, next) => {
  if (!req.file) 
    return next(new Error('No file is uploaded'));

  req.file.filename = path.join('/images', `${req.session.user._id}_${Date.now()}.jpeg`);
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(path.join(__dirname, '..', 'public', req.file.filename));
    next();
}

exports.resizeCoverPhoto = (req, res, next) => {
  if (!req.file) 
    return next(new Error('No file is uploaded'));

  req.file.filename = path.join('/images', `${req.session.user._id}_${Date.now()}.jpeg`);
  sharp(req.file.buffer)
    .resize(2000, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(path.join(__dirname, '..', 'public', req.file.filename));
    next();
}

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) {
    return cb(new Error('the file should be an image'), false);
  }
  cb(null, true);
}

exports.upload = multer({
  fileFilter,
  storage
});