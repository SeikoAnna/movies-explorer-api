const { ValidationError, CastError } = require('mongoose').Error;

const BadRequest = require('../utils/errors/BadRequest');
const Forbidden = require('../utils/errors/Forbidden');
const NotFound = require('../utils/errors/NotFound');
const messages = require('../utils/response/movies');

const Movie = require('../models/movie');

const getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movie) => res.status(200).send(movie))
    .catch(next);
};

const createMovie = (req, res, next) => {
  Movie.create({
    ...req.body,
    owner: req.user._id,
  })
    .then((movie) => res.status(201).send(movie))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequest(messages.errors.INCORRECT_DATA));
      } else {
        next(err);
      }
    });
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(new NotFound(messages.errors.NOT_FOUND))
    .then((movie) => {
      if (!movie.owner.equals(req.user._id)) {
        throw new Forbidden(messages.errors.CANT_DELETE);
      }
      return movie.deleteOne().then(() => res.send({ message: messages.ok.REMOVED })).catch(next);
    })
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest(messages.errors.INCORRECT_DATA));
      } else {
        next(err);
      }
    });
};

// const likeCard = (req, res, next) => {
//   Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $addToSet: { likes: req.user._id } },
//     { new: true },
//   )
//     .orFail(new NotFound('Такой карточки не существует'))
//     .then((card) => res.send(card))
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         next(new BadRequest('Введены некорректные данные'));
//       } else {
//         next(err);
//       }
//     });
// };

// const dislikeCard = (req, res, next) => {
//   Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $pull: { likes: req.user._id } },
//     { new: true },
//   )
//     .orFail(new NotFound('Такой карточки не существует'))
//     .then((card) => res.send(card))
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         next(new BadRequest('Введены некорректные данные'));
//       } else {
//         next(err);
//       }
//     });
// };

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
