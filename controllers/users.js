const jsonWebToken = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ValidationError, CastError } = require('mongoose').Error;
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const BadRequest = require('../utils/errors/BadRequest');
const NotFound = require('../utils/errors/NotFound');
const Conflict = require('../utils/errors/Conflict');
const Unauthorized = require('../utils/errors/Unauthorized');
const messages = require('../utils/response/users');

// const getUsers = (req, res, next) => {
//   User.find({})
//     .then((users) => res.send(users))
//     .catch(next);
// };

const getUserById = (req, res, next) => {
  const userId = req.params.id ? req.params.id : req.user._id;

  User.findById(userId)
    .orFail(new NotFound(messages.errors.NOT_FOUND))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest(messages.errors.INCORRECT_DATA));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
  const { password } = req.body;
  bcrypt.hash(String(password), 10)
    .then((hash) => User.create({ ...req.body, password: hash }))
    .then((user) => {
      const {
        _id, name, email,
      } = user;
      return res.status(201).send({
        _id, name, email,
      });
    })
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequest(messages.errors.INCORRECT_DATA));
      } else if (err.code === 11000) {
        next(new Conflict(messages.errors.EXIST));
      } else {
        next(err);
      }
    });
};

const updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.code === 11000) {
        next(new Conflict(messages.errors.EXIST));
        return;
      }

      if (err instanceof ValidationError) {
        next(new BadRequest(messages.errors.INCORRECT_DATA));
        return;
      }

      next(err);
    });
};

// const updateUserAvatar = (req, res, next) => {
//   const { avatar } = req.body;
//   User.findByIdAndUpdate(
//     req.user._id,
//     { avatar },
//     { new: true, runValidators: true },
//   )
//     .orFail(new NotFound('Пользователь не найден'))
//     .then((user) => res.send(user))
//     .catch((err) => {
//       if (err.name === 'ValidationError') {
//         next(new BadRequest('Введены некорректные данные'));
//       } else {
//         next(err);
//       }
//     });
// };

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select('+password')
    .orFail(new Unauthorized(messages.errors.LOG_OR_PASS))
    .then((user) => {
      bcrypt.compare(password, user.password)
        .then((isValidUser) => {
          if (isValidUser) {
            const jwt = jsonWebToken.sign({
              _id: user._id,
            }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
            res.cookie('jwt', jwt, {
              maxAge: 3600 * 24 * 7,
              httpOnly: true,
              sameSite: true,
            });
            // const userResponse = {
            //   _id: user._id,
            //   name: user.name,
            //   about: user.about,
            //   avatar: user.avatar,
            //   email: user.email,
            // };
            res.send({ jwt });
          } else {
            throw new Unauthorized(messages.errors.LOG_OR_PASS);
          }
        })
        .catch(next);
    })
    .catch(next);
};

const logout = (req, res) => {
  res.clearCookie('jwt').send({ message: messages.ok.LOGOUT });
};

module.exports = {
  getUserById,
  createUser,
  updateUser,
  login,
  logout,
};
