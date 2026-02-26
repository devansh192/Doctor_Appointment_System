const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const doctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      unique: true,
      default: () => `DOC-${uuidv4().split('-')[0].toUpperCase()}`,
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      minlength: [2, 'Specialization must be at least 2 characters'],
      maxlength: [100, 'Specialization cannot exceed 100 characters'],
    },
    maxDailyPatients: {
      type: Number,
      required: [true, 'Max daily patients is required'],
      min: [1, 'Max daily patients must be at least 1'],
      max: [100, 'Max daily patients cannot exceed 100'],
    },
    currentAppointments: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastResetDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: slots remaining
doctorSchema.virtual('slotsRemaining').get(function () {
  return Math.max(0, this.maxDailyPatients - this.currentAppointments);
});

// Virtual: availability status
doctorSchema.virtual('isAvailable').get(function () {
  return this.currentAppointments < this.maxDailyPatients && this.isActive;
});

// Auto-reset currentAppointments at midnight (checked on read)
doctorSchema.methods.checkAndResetDaily = async function () {
  const now = new Date();
  const lastReset = new Date(this.lastResetDate);
  const isSameDay =
    now.getFullYear() === lastReset.getFullYear() &&
    now.getMonth() === lastReset.getMonth() &&
    now.getDate() === lastReset.getDate();

  if (!isSameDay) {
    this.currentAppointments = 0;
    this.lastResetDate = now;
    await this.save();
  }
  return this;
};

module.exports = mongoose.model('Doctor', doctorSchema);
