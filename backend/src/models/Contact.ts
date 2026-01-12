import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  isPrimary: boolean;
  relationship?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
  relationship: { type: String },
}, { timestamps: true });

export const Contact = mongoose.model<IContact>('Contact', contactSchema);
