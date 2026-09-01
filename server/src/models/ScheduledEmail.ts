import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IScheduledEmail extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  emailAccountId: Types.ObjectId;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyText: string;
  bodyHtml: string;
  providerThreadId?: string;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  error?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledEmailSchema = new Schema<IScheduledEmail>(
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
    to: {
      type: [String],
      required: true,
    },
    cc: {
      type: [String],
      default: [],
    },
    bcc: {
      type: [String],
      default: [],
    },
    subject: {
      type: String,
      required: true,
    },
    bodyText: {
      type: String,
      default: '',
    },
    bodyHtml: {
      type: String,
      default: '',
    },
    providerThreadId: {
      type: String,
    },
    scheduledFor: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'cancelled', 'failed'],
      default: 'pending',
      index: true,
    },
    error: {
      type: String,
    },
    sentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

ScheduledEmailSchema.index({ status: 1, scheduledFor: 1 });

export const ScheduledEmail = mongoose.model<IScheduledEmail>(
  'ScheduledEmail',
  ScheduledEmailSchema
);
