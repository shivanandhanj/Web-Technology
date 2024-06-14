const express = require('express');
const router = express.Router();
const multer = require('multer');
const Employee = require('../models/employee');

// Multer storage configuration

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directory where images will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// POST route to create a new employee
router.post('/employees', upload.single('image'), async (req, res) => {
  try {
    const { designation, name } = req.body;
    const imagePath = req.file.path; // Path to the uploaded image

    const newEmployee = new Employee({
      designation,
      name,
      image: imagePath,
    });

    const savedEmployee = await newEmployee.save();
    res.json(savedEmployee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
