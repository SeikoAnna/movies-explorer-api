const router = require('express').Router();
const { auth } = require('../middlewares/auth');
const userRoutes = require('./users');
const movieRouter = require('./movies');

const { login, createUser, logout } = require('../controllers/users');
const NotFound = require('../utils/errors/NotFound');
const celebrates = require('../middlewares/validate');

router.use('/signin', celebrates.validateLoginUser, login);
router.use('/signup', celebrates.validateCreateUser, createUser);
router.use('/signout', logout);
router.use(auth);
router.use('/users', userRoutes);
router.use('/movies', movieRouter);

router.use('/*', (req, res, next) => {
  next(new NotFound('Такой страницы не существует'));
});

module.exports = router;
