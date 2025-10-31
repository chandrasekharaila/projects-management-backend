import multer from "multer";

const destination = function (req, file, cb) {
  cb(null, "./public/images");
};

const filename = function (req, file, cb) {
  cb(null, `${Date.now()}-${file.originalname}`);
};

const storage = multer.diskStorage({ destination, filename });

export const upload = multer({
  storage,
  limits: {
    fileSize: 1 * 1000 * 1000,
  },
});
