import mongoose, { Document, Schema } from 'mongoose';

export type TemplateCategory = 'sponsorship' | 'outreach' | 'follow_up' | 'meeting' | 'general';

export interface IEmailTemplate extends Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  category: TemplateCategory;
  placeholders: string[];
  usageCount: number;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const emailTemplateSchema = new Schema<IEmailTemplate>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Template subject is required'],
      trim: true,
    },
    bodyText: {
      type: String,
      required: [true, 'Template body text is required'],
    },
    bodyHtml: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['sponsorship', 'outreach', 'follow_up', 'meeting', 'general'],
      default: 'general',
    },
    placeholders: {
      type: [String],
      default: [],
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

emailTemplateSchema.index({ owner: 1, category: 1, isFavorite: 1, createdAt: -1 });

export const EmailTemplate = mongoose.model<IEmailTemplate>('EmailTemplate', emailTemplateSchema);
