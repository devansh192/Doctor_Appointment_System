const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllDoctors,
  getDoctorById,
  addDoctor,
  deleteDoctor,
  resetDailyAppointments,
  getSpecializations,
} = require('../controllers/doctorController');

// Validation rules for adding a doctor
const doctorValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Doctor name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('specialization')
    .trim()
    .notEmpty().withMessage('Specialization is required')
    .isLength({ min: 2, max: 100 }).withMessage('Specialization must be between 2 and 100 characters'),
  body('maxDailyPatients')
    .notEmpty().withMessage('Max daily patients is required')
    .isInt({ min: 1, max: 100 }).withMessage('Max daily patients must be between 1 and 100'),
  body('doctorId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Doctor ID cannot exceed 50 characters'),
];

router.get('/specializations', getSpecializations);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.post('/', doctorValidation, addDoctor);
router.delete('/:id', deleteDoctor);
router.post('/reset/daily', resetDailyAppointments);

module.exports = router;
