const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validators/auth-validator");
const prisma = require("../models/prisma");
const createError = require("../utils/create-error");

exports.register = async (req, res, next) => {
  try {
    const { value, error } = registerSchema.validate(req.body);
    if (error) {
      // error.statusCode = 400;
      return next(error);
    }
    // console.log("value", value);
    value.password = await bcrypt.hash(value.password, 12);
    const user = await prisma.user.create({
      data: value,
    });
    const payload = { userId: user.id };
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY || "secret2",
      { expiresIn: process.env.JWT_EXPIRE }
    );
    res.status(201).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) {
      // console.log(error.name); // ValidationError
      // error.statusCode = 400;
      return next(error);
    }
    // SELECT * FROM user WHERE email = value.emailOrMobile OR mobile = value.emailOrMobile
    // findUnique can use only for unique column
    // findUnique can not be used with OR condition, so we have to use findFirst instead
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: value.emailOrMobile }, { mobile: value.emailOrMobile }],
      },
    });
    if (!user) {
      return next(createError("Invalid Credential", 400));
    }

    const isMatch = await bcrypt.compare(value.password, user.password);
    if (!isMatch) {
      return next(createError("Invalid Credential", 400));
    }

    const payload = { userId: user.id };
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY || "secret2",
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};
