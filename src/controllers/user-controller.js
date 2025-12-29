const fs = require("fs/promises");

const createError = require("../utils/create-error");
// const cloudinary = require("../config/cloudinary");
const { upload } = require("../utils/cloudinary-service");
const prisma = require("../models/prisma");
const { checkUserIdSchema } = require("../validators/user-validator");

exports.updateProfile = async (req, res, next) => {
  try {
    // the image file is in object req.file since it's uploadMiddlewre.single("qwerty")
    // console.log(req.file); // returns object req.file for only method .single ex. uploadMiddleware.single("qwerty")
    // console.log(req.files); // returns array req.fileS for method .array since it's one field and has many fileS like uploadMiddleware.array("qwerty")
    // console.log(req.files); // returns object req.fileS that contains array of objects for method .fields

    if (!req.files) {
      return next(createError("Profile image or cover image is required"));
    }

    const response = {};

    if (req.files.profileImage) {
      const url = await upload(req.files.profileImage[0].path);
      response.profileImage = url;
      // console.log(result);
      await prisma.user.update({
        data: {
          profileImage: url,
        },
        where: {
          id: req.user.id,
        },
      });
    }

    if (req.files.coverImage) {
      const url = await upload(req.files.coverImage[0].path);
      response.coverImage = url;
      await prisma.user.update({
        data: {
          coverImage: url,
        },
        where: {
          id: req.user.id,
        },
      });
    }

    res.status(200).json(response);
  } catch (err) {
    next(err);
  } finally {
    if (req.files.profileImage) {
      fs.unlink(req.files.profileImage[0].path);
    }

    if (req.files.coverImage) {
      fs.unlink(req.files.coverImage[0].path);
    }
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { error } = checkUserIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }

    const userId = +req.params.userId;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // let status = null;
    // let friends = null;
    if (user) {
      delete user.password;
      //   status = await getTargetUserStatusWithAuthUser(userId, req.user.id);
      //   friends = await getTargetUserFriends(userId);
    }

    // res.status(200).json({ user, status, friends });
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};
