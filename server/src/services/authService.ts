import { User, IUser } from '../models/User';
import { signToken } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  name?: string;
  preferences?: Partial<IUser['preferences']>;
}

export interface AuthResult {
  token: string;
  user: Omit<IUser, 'password' | 'comparePassword'>;
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw createError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
    }

    const user = await User.create({
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      password: input.password,
    });

    const token = signToken({ userId: user._id.toString(), email: user.email });

    logger.info('User registered', { userId: user._id.toString() });

    return { token, user: user.toJSON() as unknown as IUser };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
    if (!user) {
      throw createError('Invalid email or password.', 401, 'AUTH_INVALID');
    }

    const valid = await user.comparePassword(input.password);
    if (!valid) {
      throw createError('Invalid email or password.', 401, 'AUTH_INVALID');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken({ userId: user._id.toString(), email: user.email });

    logger.info('User logged in', { userId: user._id.toString() });

    return { token, user: user.toJSON() as unknown as IUser };
  },

  async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found.', 404, 'USER_NOT_FOUND');
    }
    return user;
  },

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<IUser> {
    const updateData: Record<string, unknown> = {};
    if (input.name) updateData['name'] = input.name.trim();
    if (input.preferences) {
      Object.entries(input.preferences).forEach(([key, val]) => {
        updateData[`preferences.${key}`] = val;
      });
    }

    const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true });
    if (!user) {
      throw createError('User not found.', 404, 'USER_NOT_FOUND');
    }

    logger.info('User profile updated', { userId });
    return user;
  },

  async deleteAccount(userId: string): Promise<void> {
    await User.findByIdAndDelete(userId);
    logger.info('User account deleted', { userId });
  },
};
