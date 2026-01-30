const { db } = require('../config/firebase');

// @desc    Get list of users (id, username, email)
// @access  Private
const getUsers = async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const users = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({ id: doc.id, username: data.username || '', email: data.email || '' });
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers };