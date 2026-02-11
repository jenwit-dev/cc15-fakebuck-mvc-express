const { upload } = require("../utils/cloudinary-service");
const createError = require("../utils/create-error");
const prisma = require("../models/prisma");
const fs = require("fs/promises");
const { checkPostIdSchema } = require("../validators/post-validator");
const { STATUS_ACCEPTED } = "../config/constants";

const getFriendIds = async (targetUserId) => {
  const relationship = await prisma.friend.findMany({
    where: {
      status: STATUS_ACCEPTED,
      OR: [{ requesterId: targetUserId }, { receiverId: targetUserId }],
    },
  });

  const friendIds = relationship.map((el) => {
    return el.requesterId === targetUserId ? el.receiverId : el.requesterId;
  });

  return friendIds;
};

exports.createPost = async (req, res, next) => {
  try {
    const { message } = req.body;

    // console.log(req.body);
    // console.log(message);
    // console.log(req.file);

    if ((!message || !message.trim()) && !req.file) {
      return next(createError("message or image is required", 400));
    }

    const data = { userId: req.user.id };

    if (req.file) {
      data.image = await upload(req.file.path);
    }

    if (message) {
      data.message = message;
    }

    const post = await prisma.post.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    });

    res.status(201).json({ message: "post created", post });
  } catch (err) {
    next(err);
  } finally {
    if (req.file) {
      fs.unlink(req.file.path);
    }
  }
};

exports.getAllPostIncludeFriendPost = async (req, res, next) => {
  try {
    const friendIds = await getFriendIds(req.user.id); // [6, 12 ,7]
    // SELECT * FROM post WHERE userId IN (6, 12, 7)
    const posts = await prisma.post.findMany({
      where: {
        userId: {
          in: [...friendIds, req.user.id],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        likes: {
          // select user select
          select: {
            // user: {
            // select user info from user table, one relation line in prisma schema
            //   select: {
            // use nested select to second select only specific needed fields
            //     id: true,
            //     firstName: true,
            //     lastname: true,
            //   },
            // },

            userId: true,
          },
        },
      },
    });

    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { value, error } = checkPostIdSchema.validate(req.params);

    if (error) {
      return next(error);
    }

    const existPost = await prisma.post.findFirst({
      where: {
        id: value.postId,
        userId: req.user.id,
      },
    });

    if (!existPost) {
      return next(createError("can't delete this post", 400));
    }

    await prisma.post.delete({
      where: {
        id: existPost.id,
      },
    });

    res.status(200).json({ message: "deleted post successfully" });
  } catch (err) {
    next(err);
  }
};
