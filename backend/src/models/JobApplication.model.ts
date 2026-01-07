import mongoose, { Document, Schema } from 'mongoose';

export interface IJobApplication extends Document {
  job: mongoose.Types.ObjectId;
  applicantName: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  education: string;
  currentCompany?: string;
  currentPosition?: string;
  expectedSalary?: string;
  noticePeriod: string;
  resume: string; // URL to uploaded resume
  resumePublicId?: string; // Cloudinary public_id for generating signed URLs
  coverLetter?: string;
  linkedIn?: string;
  portfolio?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  notes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicantName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
    },
    education: {
      type: String,
    },
    currentCompany: {
      type: String,
      trim: true,
    },
    currentPosition: {
      type: String,
      trim: true,
    },
    expectedSalary: {
      type: String,
    },
    noticePeriod: {
      type: String,
    },
    resume: {
      type: String,
      required: true,
    },
    resumePublicId: {
      type: String,
    },
    coverLetter: {
      type: String,
    },
    linkedIn: {
      type: String,
    },
    portfolio: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'],
      default: 'pending',
    },
    notes: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const JobApplication = mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema);

export default JobApplication;
