const multer = require('multer');
const { MulterError } = multer;
const path = require('path');

const limits = {
  fileSize: 2000000, // 1MB
};

const fileFilter = function fileFilter(req, file, cb) {
  if (!file.mimetype.includes('image/')) {
    return cb(new MulterError('File type not accepted.'), false);
  }

  cb(null, true); // accept
};

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = {
  upload,
};