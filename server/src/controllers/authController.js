const { db } = require("../config/firebase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

// Helper to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
const signup = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // 1. Check if user already exists
    const userRef = db.collection("users");
    const snapshot = await userRef.where("email", "==", email).get();

    if (!snapshot.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user in Firestore
    // Default to 'User' role if not provided, ensuring security
    const userRole = role === "Admin" ? "Admin" : "User";

    const newUser = {
      username,
      email,
      password: hashedPassword,
      role: userRole,
      createdAt: new Date().toISOString(),
    };

    const docRef = await userRef.add(newUser);

    // 4. Respond with Token
    res.status(201).json({
      id: docRef.id,
      username,
      email,
      role: userRole,
      token: generateToken(docRef.id, userRole),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send password reset token (dev: returns token in response)
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      // Don't reveal whether the email exists in production
      return res.status(200).json({ message: 'If an account exists, a reset link has been sent' });
    }

    const userDoc = snapshot.docs[0];
    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour

    await usersRef.doc(userDoc.id).update({
      passwordResetToken: token,
      passwordResetExpires: expires,
    });

    // In production you'd email the token/link. For dev we return it in the response so you can test.
    res.json({ message: 'Password reset token created', resetToken: token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('passwordResetToken', '==', token).get();

    if (snapshot.empty) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    if (!userData.passwordResetExpires || userData.passwordResetExpires < Date.now()) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await usersRef.doc(userDoc.id).update({
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    res.json({ message: 'Password has been reset' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Firestore returns a snapshot, we need the first document
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // 2. Check password
    const isMatch = await bcrypt.compare(password, userData.password);

    if (isMatch) {
      res.json({
        id: userDoc.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        token: generateToken(userDoc.id, userData.role),
      });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, forgotPassword, resetPassword };
