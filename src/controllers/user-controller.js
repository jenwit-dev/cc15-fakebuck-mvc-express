const fs = require("fs/promises");

const createError = require("../utils/create-error");
// const cloudinary = require("../config/cloudinary");
const { upload } = require("../utils/cloudinary-service");
const prisma = require("../models/prisma");
const { checkUserIdSchema } = require("../validators/user-validator");
const {
  AUTH_USER,
  UNKNOWN,
  STATUS_ACCEPTED,
  FRIEND,
  REQUESTER,
  RECEIVER,
} = require("../config/constants");

const getTargetUserStatusWithAuthUser = async (targetUserId, authUserId) => {
  if (targetUserId === authUserId) {
    return AUTH_USER;
  }

  const relationship = await prisma.friend.findFirst({
    where: {
      OR: [
        { requesterId: authUserId, receiverId: targetUserId },
        { requesterId: targetUserId, receiverId: authUserId },
      ],
    },
  });

  if (!relationship) {
    return UNKNOWN;
  }

  if (relationship.status === STATUS_ACCEPTED) {
    return FRIEND;
  }

  if (relationship.requesterId === authUserId) {
    return REQUESTER;
  }

  return RECEIVER;
};

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

    let status = null;
    // let friends = null;
    if (user) {
      delete user.password;
      // auth user id  : req.user.id (the currently logged in user that you get from authenticateMiddleware)
      // userId (userId in Express or profileId in React is the user that you see on the profile page)
      status = await getTargetUserStatusWithAuthUser(userId, req.user.id);
      //   friends = await getTargetUserFriends(userId);
    }

    // Determine relationship status using if-else statements
    // not recommended because of hard readability, better to use the function getTargetUserStatusWithAuthUser
    // if (req.user.id === userId) {
    //   status = AUTH_USER;
    // } else {
    //   const relationship = await prisma.friend.findFirst({
    //     where: {
    //       OR: [
    //         { requesterId: req.user.id, receiverId: userId },
    //         { requesterId: userId, receiverId: req.user.id },
    //       ],
    //     },
    //   });

    //   if (!relationship) {
    //     status = UNKNOWN;
    //   } else {
    //     if (relationship.status === STATUS_ACCEPTED) {
    //       status = FRIEND;
    //     } else {
    //       if (relationship.requesterId === userId) {
    //         status = REQUESTER;
    //       } else {
    //         status = RECEIVER;
    //       }
    //     }
    //   }
    // }

    // res.status(200).json({ user, status, friends });

    res.set("Cache-Control", "no-store"); // Disable caching
    res.status(200).json({ user, status });
  } catch (err) {
    next(err);
  }
};
