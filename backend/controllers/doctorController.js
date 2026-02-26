const { validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');

const getAllDoctors = async (req, res, next) => {
  try {
    const { specialization, available } = req.query;

    const filter = { isActive: true };
    if (specialization) {
      filter.specialization = { $regex: new RegExp(specialization, 'i') };
    }

    let doctors = await Doctor.find(filter).sort({ specialization: 1, name: 1 });

    doctors = await Promise.all(doctors.map((doc) => doc.checkAndResetDaily()));


    if (available === 'true') {
      doctors = doctors.filter((d) => d.isAvailable);
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    await doctor.checkAndResetDaily();
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};


const addDoctor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { name, specialization, maxDailyPatients, doctorId } = req.body;

    // Check duplicate doctorId if provided
    if (doctorId) {
      const existing = await Doctor.findOne({ doctorId });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Doctor ID "${doctorId}" already exists`,
        });
      }
    }

    const doctorData = { name, specialization, maxDailyPatients };
    if (doctorId) doctorData.doctorId = doctorId;

    const doctor = await Doctor.create(doctorData);

    res.status(201).json({
      success: true,
      message: `Dr. ${doctor.name} added successfully`,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    doctor.isActive = false;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Dr. ${doctor.name} removed successfully`,
    });
  } catch (error) {
    next(error);
  }
};

const resetDailyAppointments = async (req, res, next) => {
  try {
    const result = await Doctor.updateMany(
      { isActive: true },
      { $set: { currentAppointments: 0, lastResetDate: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: `Daily appointments reset for ${result.modifiedCount} doctor(s)`,
    });
  } catch (error) {
    next(error);
  }
};

const getSpecializations = async (req, res, next) => {
  try {
    const specializations = await Doctor.distinct('specialization', { isActive: true });
    res.status(200).json({ success: true, data: specializations.sort() });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  addDoctor,
  deleteDoctor,
  resetDailyAppointments,
  getSpecializations,
};
