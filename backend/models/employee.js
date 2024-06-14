const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  designation: String,
  name: String,
  image: String, // Store the URL or path to the image
});

module.exports = mongoose.model('Employee', employeeSchema);
