import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import process from 'node:process';

const generateToken = (id) => {
  console.log('JWT_SECRET in generateToken:', process.env.JWT_SECRET); // DIAGNOSTIC LOG
  if (!process.env.JWT_SECRET) {
    throw new Error('CRITICAL: JWT_SECRET is undefined in generateToken!');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User already exists with this email');
  }
  const user = await User.create({ name, email, password, role });

  // Exclude password from the returned user object TODO: handle this on db level making sure that select:false is working
  const userResponse = user.toObject();
  delete userResponse.password;

  return { user: userResponse, token: generateToken(user._id) };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Exclude password from the returned user object TODO: handle this on db level making sure that select:false is working
  const userResponse = user.toObject();
  delete userResponse.password;

  return { user: userResponse, token: generateToken(user._id) };
};
