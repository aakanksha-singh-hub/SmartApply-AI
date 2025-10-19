const { Schema } = require('mongoose');
const { mongoose } = require('../db');

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  accessLevel: { type: String, required: true, default: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
