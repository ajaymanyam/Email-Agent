import mongoose, { Document, Schema } from 'mongoose';

export type EmailProviderType = 'gmail' | 'outlook';
export type AccountStatusType = 'connected' | 'disconnected' | 'expired' | 'revoked' | 'error';

export interface IEmailAccount extends Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  provider: EmailProviderType;
  email: string;
  providerAccountId: string;
  encryptedAccessToken?: string;
  encryptedRefreshToken?: string;
  scopes: string[];
  expiresAt: Date;
  isConnected: boolean;
  status: AccountStatusType;
  createdAt: Date;
  updatedAt: Date;
}

const emailAccountSchema = new Schema<IEmailAccount>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'outlook'],
      required: [true, 'Provider is required'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
    },
    providerAccountId: {
      type: String,
      required: [true, 'Provider account ID is required'],
    },
    encryptedAccessToken: {
      type: String,
      default: '',
      select: false, // Never return tokens in standard queries
    },
    encryptedRefreshToken: {
      type: String,
      default: '',
      select: false, // Never return tokens in standard queries
    },
    scopes: {
      type: [String],
      default: [],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    isConnected: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected', 'expired', 'revoked', 'error'],
      default: 'connected',
    },
  },
  { timestamps: true }
);

// Compound index: one owner can connect multiple distinct email accounts
emailAccountSchema.index({ owner: 1, email: 1, provider: 1 }, { unique: true });

// Always strip encrypted tokens from JSON serialization
emailAccountSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, any>) => {
    delete ret['encryptedAccessToken'];
    delete ret['encryptedRefreshToken'];
    return ret;
  },
});

emailAccountSchema.set('toObject', {
  transform: (_doc, ret: Record<string, any>) => {
    delete ret['encryptedAccessToken'];
    delete ret['encryptedRefreshToken'];
    return ret;
  },
});

export const EmailAccount = mongoose.model<IEmailAccount>(
  'EmailAccount',
  emailAccountSchema
);
