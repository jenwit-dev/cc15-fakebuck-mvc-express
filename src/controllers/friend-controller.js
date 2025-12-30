const { STATUS_PENDING } = require("../config/constants");
const { checkReceiverIdSchema } = require("../validators/user-validator");
const prisma = require("../models/prisma");
const createError = require("../utils/create-error");

exports.requestFriend = async (req, res, next) => {
  try {
    const { value, error } = checkReceiverIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }

    if (value.receiverId === req.user.id) {
      return next(createError("can not request yourself", 400));
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        id: value.receiverId,
      },
    });

    if (!targetUser) {
      return next(createError("user does not exist", 400));
    }

    // SELECT * FROM friend WHERE (requesterId = 1 AND receiverId = 2)
    // OR (requesterId = 2 AND receiverId = 1)
    const existRelationship = await prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: req.user.id, receiverId: value.receiverId },
          { requesterId: value.receiverId, receiverId: req.user.id },
        ],
      },
    });

    if (existRelationship) {
      return next(createError("user already has a relationship", 400));
    }

    await prisma.friend.create({
      data: {
        requesterId: req.user.id,
        receiverId: value.receiverId,
        status: STATUS_PENDING,
      },
    });

    res.status(201).json({ message: "request has been sent" });
  } catch (err) {
    next(err);
  }
};
