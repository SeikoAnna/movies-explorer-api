const router = require('express').Router();
const moviesController = require('../controllers/movies');
const celebrates = require('../middlewares/validate');

router.get('/', moviesController.getMovies);
router.post('/', celebrates.validateCreateMovie, moviesController.createMovie);
router.delete('/:movieId', celebrates.validateMovieId, moviesController.deleteMovie);
// router.put('/:cardId/likes', celebrates.validateMovieId, moviesController.likeMovie);
// router.delete('/:cardId/likes', celebrates.validateMovieId, moviesController.dislikeMovie);

module.exports = router;
