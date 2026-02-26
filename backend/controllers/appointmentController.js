const { validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Book an appointment by specialization
// @route   POST /api/appointments/book
// @access  Public
const bookAppointment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { specialization, patientName } = req.body;

    // Find all active doctors with the requested specialization
    const doctors = await Doctor.find({
      specialization: { $regex: new RegExp(`^${specialization}$`, 'i') },
      isActive: true,
    });

    if (!doctors.length) {
      const appointment = await Appointment.create({
        patientName,
        specialization,
        status: 'rejected',
        rejectionReason: `No doctors found with specialization: ${specialization}`,
      });

      return res.status(404).json({
        success: false,
        status: 'rejected',
        message: `No doctors found with specialization: "${specialization}"`,
        data: appointment,
      });
    }

    // Perform daily reset check for each doctor
    const resetDoctors = await Promise.all(doctors.map((d) => d.checkAndResetDaily()));

    // Filter available doctors (currentAppointments < maxDailyPatients)
    const availableDoctors = resetDoctors.filter((d) => d.currentAppointments < d.maxDailyPatients);

    if (!availableDoctors.length) {
      const appointment = await Appointment.create({
        patientName,
        specialization,
        status: 'rejected',
        rejectionReason: `All ${doctors.length} doctor(s) in "${specialization}" are fully booked for today`,
      });

      return res.status(409).json({
        success: false,
        status: 'rejected',
        message: `All ${doctors.length} doctor(s) specializing in "${specialization}" are fully booked for today`,
        totalDoctors: doctors.length,
        data: appointment,
      });
    }

    // Allocate doctor with FEWEST current appointments (core logic)
    availableDoctors.sort((a, b) => {
      // Primary: fewest appointments
      if (a.currentAppointments !== b.currentAppointments) {
        return a.currentAppointments - b.currentAppointments;
      }
      // Secondary: highest remaining capacity (tie-breaker)
      return b.slotsRemaining - a.slotsRemaining;
    });

    const selectedDoctor = availableDoctors[0];

    // Atomically increment currentAppointments to prevent race conditions
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      selectedDoctor._id,
      { $inc: { currentAppointments: 1 } },
      { new: true, runValidators: true }
    );

    if (!updatedDoctor || updatedDoctor.currentAppointments > updatedDoctor.maxDailyPatients) {
      // Race condition: slot was taken, retry logic
      return res.status(409).json({
        success: false,
        status: 'rejected',
        message: 'Appointment slot was just taken. Please try again.',
      });
    }

    // Create appointment record
    const appointment = await Appointment.create({
      patientName,
      specialization,
      doctor: updatedDoctor._id,
      doctorId: updatedDoctor.doctorId,
      doctorName: updatedDoctor.name,
      status: 'booked',
      appointmentDate: new Date(),
    });

    res.status(201).json({
      success: true,
      status: 'booked',
      message: `Appointment booked successfully with Dr. ${updatedDoctor.name}`,
      data: {
        appointment,
        doctor: updatedDoctor,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Public
const getAppointments = async (req, res, next) => {
  try {
    const { status, specialization, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (specialization) filter.specialization = { $regex: new RegExp(specialization, 'i') };

    const appointments = await Appointment.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('doctor', 'name specialization doctorId');

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointment stats
// @route   GET /api/appointments/stats
// @access  Public
const getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalBooked, totalRejected, todayBooked, todayRejected] = await Promise.all([
      Appointment.countDocuments({ status: 'booked' }),
      Appointment.countDocuments({ status: 'rejected' }),
      Appointment.countDocuments({ status: 'booked', createdAt: { $gte: today } }),
      Appointment.countDocuments({ status: 'rejected', createdAt: { $gte: today } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: { booked: totalBooked, rejected: totalRejected },
        today: { booked: todayBooked, rejected: todayRejected },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { bookAppointment, getAppointments, getStats };
