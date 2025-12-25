const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // req
    // req is the same request object that Express created
    // file
    // file is the uploaded file data from <EditProfileForm> in frontend
    // ex. { fieldname: "qwerty", originalname: "picture_1.jpg" }, multer created object file for us
    // cb
    // cb stands for callback fn
    // cb(new Error()); // throw error
    // do not confuse between filename and fieldname
    // object file returns an object with key fieldname which is uploadMiddleware.single("qwerty")
    // while filename is the key of object options ( multer.diskStorage(optionsObject) )
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    // console.log(file);
    const split = file.originalname.split(".");
    cb(
      null,
      "" +
        Date.now() +
        Math.round(Math.random() * 1_000_000) +
        "." +
        split[split.length - 1]
    );
  },
});

const upload = multer({ storage: storage });
// upload returns uploadMiddleware fn
// so that it can use methods like uploadMiddleware.single("qwerty")

module.exports = upload;
