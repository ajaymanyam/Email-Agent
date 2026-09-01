import mongoose, { Document, Schema } from 'mongoose';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface IActionItem extends Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  emailId?: mongoose.Types.ObjectId;
  emailAccountId?: mongoose.Types.ObjectId;
  threadId?: string;
  task: string;
  assignee?: string;
  deadline?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  sourceEmailSubject?: string;
  sourceEmailSender?: string;
  createdAt: Date;
  updatedAt: Date;
}

const actionItemSchema = new Schema<IActionItem>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    emailId: {
      type: Schema.Types.ObjectId,
      ref: 'EmailMessage',
      default: null,
    },
    emailAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'EmailAccount',
      default: null,
    },
    threadId: {
      type: String,
      default: null,
    },
    task: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
    },
    assignee: {
      type: String,
      default: '',
      trim: true,
    },
    deadline: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    sourceEmailSubject: {
      type: String,
      default: '',
    },
    sourceEmailSender: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

actionItemSchema.index({ owner: 1, status: 1, priority: 1, createdAt: -1 });

export const ActionItem = mongoose.model<IActionItem>('ActionItem', actionItemSchema);
