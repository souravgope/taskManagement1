const express = require('express');
const { getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected: any authenticated user can fetch minimal user list
router.get('/', protect, getUsers);

module.exports = router;