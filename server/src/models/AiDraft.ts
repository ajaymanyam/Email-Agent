import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAiDraft extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  emailAccountId: Types.ObjectId;
  emailMessageId?: Types.ObjectId;
  providerThreadId: string;
  recipientEmail: string;
  recipientName?: string;
  originalSubject: string;
  suggestedSubject: string;
  suggestedBody: string;
  tone: string;
  keyPointsCovered: string[];
  status: 'suggested' | 'accepted' | 'discarded';
  confidenceScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const AiDraftSchema = new Schema<IAiDraft>(
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
    emailMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'EmailMessage',
      index: true,
    },
    providerThreadId: {
      type: String,
      required: true,
      index: true,
    },
    recipientEmail: {
      type: String,
      required: true,
    },
    recipientName: {
      type: String,
      default: '',
    },
    originalSubject: {
      type: String,
      required: true,
    },
    suggestedSubject: {
      type: String,
      required: true,
    },
    suggestedBody: {
      type: String,
      required: true,
    },
    tone: {
      type: String,
      default: 'Professional',
    },
    keyPointsCovered: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['suggested', 'accepted', 'discarded'],
      default: 'suggested',
      index: true,
    },
    confidenceScore: {
      type: Number,
      default: 85,
    },
  },
  { timestamps: true }
);

AiDraftSchema.index({ owner: 1, status: 1, createdAt: -1 });

export const AiDraft = mongoose.model<IAiDraft>('AiDraft', AiDraftSchema);
