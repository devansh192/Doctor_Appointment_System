const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { bookAppointment, getAppointments, getStats } = require('../controllers/appointmentController');

const bookingValidation = [
  body('patientName')
    .trim()
    .notEmpty().withMessage('Patient name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Patient name must be between 2 and 100 characters'),
  body('specialization')
    .trim()
    .notEmpty().withMessage('Specialization is required')
    .isLength({ min: 2, max: 100 }).withMessage('Specialization must be between 2 and 100 characters'),
];

router.get('/stats', getStats);
router.get('/', getAppointments);
router.post('/book', bookingValidation, bookAppointment);

module.exports = router;
