const router = require('express').Router();
const userController = require('../controllers/users');
const celebrates = require('../middlewares/validate');

router.get('/me', userController.getUserById);
router.patch('/me', celebrates.validateUpdateUser, userController.updateUser);

module.exports = router;
