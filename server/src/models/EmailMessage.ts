import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailAttachment {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface IEmailMessage extends Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  emailAccountId: mongoose.Types.ObjectId;
  provider: 'gmail' | 'outlook';
  providerMessageId: string;
  providerThreadId: string;
  from: {
    name: string;
    email: string;
  };
  to: Array<{
    name: string;
    email: string;
  }>;
  cc: Array<{
    name: string;
    email: string;
  }>;
  bcc: Array<{
    name: string;
    email: string;
  }>;
  subject: string;
  snippet: string;
  bodyText: string;
  bodyHtml: string;
  date: Date;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  isDraft: boolean;
  isTrash: boolean;
  isSpam: boolean;
  labels: string[];
  attachments: IEmailAttachment[];
  priorityScore?: number;
  priorityReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailMessageSchema = new Schema<IEmailMessage>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    emailAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'EmailAccount',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'outlook'],
      required: true,
    },
    providerMessageId: {
      type: String,
      required: true,
    },
    providerThreadId: {
      type: String,
      required: true,
      index: true,
    },
    from: {
      name: { type: String, default: '' },
      email: { type: String, required: true, lowercase: true, trim: true },
    },
    to: [
      {
        name: { type: String, default: '' },
        email: { type: String, required: true, lowercase: true, trim: true },
      },
    ],
    cc: [
      {
        name: { type: String, default: '' },
        email: { type: String, lowercase: true, trim: true },
      },
    ],
    bcc: [
      {
        name: { type: String, default: '' },
        email: { type: String, lowercase: true, trim: true },
      },
    ],
    subject: {
      type: String,
      default: '(No Subject)',
      trim: true,
    },
    snippet: {
      type: String,
      default: '',
    },
    bodyText: {
      type: String,
      default: '',
    },
    bodyHtml: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isStarred: {
      type: Boolean,
      default: false,
      index: true,
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    isTrash: {
      type: Boolean,
      default: false,
      index: true,
    },
    isSpam: {
      type: Boolean,
      default: false,
      index: true,
    },
    labels: {
      type: [String],
      default: [],
      index: true,
    },
    attachments: [
      {
        attachmentId: { type: String, required: true },
        filename: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, default: 0 },
      },
    ],
    priorityScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    priorityReason: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound indexes for high-speed mailbox querying and search
emailMessageSchema.index({ owner: 1, emailAccountId: 1, providerMessageId: 1 }, { unique: true });
emailMessageSchema.index({ owner: 1, emailAccountId: 1, isTrash: 1, isSpam: 1, date: -1 });
emailMessageSchema.index({ owner: 1, providerThreadId: 1, date: 1 });

// Full-text search index
emailMessageSchema.index(
  {
    subject: 'text',
    snippet: 'text',
    bodyText: 'text',
    'from.name': 'text',
    'from.email': 'text',
  },
  {
    weights: {
      subject: 10,
      'from.name': 5,
      'from.email': 5,
      snippet: 3,
      bodyText: 1,
    },
    name: 'email_text_search',
  }
);

export const EmailMessage = mongoose.model<IEmailMessage>(
  'EmailMessage',
  emailMessageSchema
);
