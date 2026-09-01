import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  preferences: {
    defaultTone: 'professional' | 'friendly' | 'formal' | 'concise';
    theme: 'light' | 'dark' | 'system';
    emailsPerPage: number;
    autoSummarize: boolean;
    notificationsEnabled: boolean;
  };
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned by default in queries
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    preferences: {
      defaultTone: {
        type: String,
        enum: ['professional', 'friendly', 'formal', 'concise'],
        default: 'professional',
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      emailsPerPage: { type: Number, default: 20 },
      autoSummarize: { type: Boolean, default: false },
      notificationsEnabled: { type: Boolean, default: true },
    },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method — never returns the hash
userSchema.methods['comparePassword'] = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password as string);
};

// Remove password from JSON output
userSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, any>) => {
    delete ret['password'];
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
