const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Use path module here

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/siva", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true }
});
const adminschema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: {type:String,required:true},
  photo: {type:String,required:true},
  description: {type:String,required:true},
});


const adminuser = mongoose.model('card', adminschema);

app.get('/api/users', async (req, res) => {
  try {
    const users = await adminuser.find();
    res.json(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/api/users', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'Photo file is required' });
    }
    console.log('File received:', req.file.filename);
    console.log('Body received:', req.body);

    const {  name, designation, description } = req.body;
    const photo = `/uploads/${req.file.filename}`;

    const user = new adminuser({ name, designation, photo, description });

    await user.save();
    res.status(201).send(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send({ message: 'Internal Server Error', error });
  }
});

app.put('/api/users/:id', upload.single('photo'), async (req, res) => {
  try {
    const { name, designation, description } = req.body;
    const updateData = { name, designation, description };

    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    const user = await adminuser.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send({ message: 'Internal Server Error', error });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await adminuser.findByIdAndDelete(req.params.id);
    if (!user) {
      console.log(`User with ID ${req.params.id} not found.`);
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ message: 'Internal Server Error', error });
  }
});
const User = mongoose.model('User', userSchema);

const secretKey = process.env.SECRET_KEY || 'nanzu';
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Middleware to parse JSON bodies
app.use(express.json());
//admin edit






// Register route
app.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Create new user instance
    const newUser = new User({ username, email, password: hashedPassword, role });

    // Save user to database
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user', error: err });
  }
});

//login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)
  try {
    const user = await User.findOne({ username });
    console.log(user.password)

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials of user' });
    }

    // Here you should validate the password, assuming plaintext for simplicity
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
