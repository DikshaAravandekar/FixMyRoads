require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bodyParser = require('body-parser');

const Complaint = require('./models/Complaint');
const User = require('./models/User');

const app = express();

// --------------------
// Middleware
// --------------------

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || true,
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  name: 'fixmyroads.sid',
  secret: process.env.SESSION_SECRET || 'change-this-secret-before-running',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// --------------------
// Authentication middleware
// --------------------

function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }

  return res.status(401).json({
    ok: false,
    error: 'Unauthorized. Please log in.'
  });
}

function ensureAdmin(req, res, next) {
  if (
    req.session &&
    req.session.adminAuthenticated === true &&
    req.session.role === 'admin'
  ) {
    return next();
  }

  return res.status(401).json({
    ok: false,
    error: 'Admin login required.'
  });
}

// --------------------
// Static files
// --------------------

const uploadsDirectory = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

app.use('/uploads', express.static(uploadsDirectory));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// --------------------
// Admin login
// --------------------

app.post('/admin/login', async (req, res) => {
  try {
    const { password } = req.body || {};
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD is missing from backend/.env');

      return res.status(500).json({
        ok: false,
        message: 'Admin login is not configured on the server.'
      });
    }

    if (!password) {
      return res.status(400).json({
        ok: false,
        message: 'Please enter the admin password.'
      });
    }

    if (password !== adminPassword) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid admin password.'
      });
    }

    // Create a fresh session after successful admin authentication.
    req.session.regenerate((err) => {
      if (err) {
        console.error('Admin session error:', err);

        return res.status(500).json({
          ok: false,
          message: 'Could not create admin session.'
        });
      }

      req.session.role = 'admin';
      req.session.adminAuthenticated = true;

      req.session.save((saveError) => {
        if (saveError) {
          console.error('Admin session save error:', saveError);

          return res.status(500).json({
            ok: false,
            message: 'Could not save admin session.'
          });
        }

        return res.json({
          ok: true,
          message: 'Admin login successful.'
        });
      });
    });
  } catch (err) {
    console.error('Admin login error:', err);

    return res.status(500).json({
      ok: false,
      message: 'Server error during admin login.'
    });
  }
});

// Check whether the current browser has an admin session.
app.get('/admin/session', ensureAdmin, (req, res) => {
  return res.json({
    ok: true,
    authenticated: true,
    role: 'admin'
  });
});

// --------------------
// Multer upload setup
// --------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory);
  },

  filename: (req, file, cb) => {
    const safeName = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, '_');

    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }

    cb(null, true);
  }
});

// --------------------
// Signup
// --------------------

app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        error: 'Password must contain at least 6 characters.'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(400).json({
        error: 'Email already registered. Try logging in.'
      });
    }

    // Public signup must never allow a user to choose the admin role.
    const user = new User({
      name,
      email: normalizedEmail,
      phone,
      role: 'user'
    });

    await user.setPassword(password);
    await user.save();

    req.session.userId = String(user._id);
    req.session.role = 'user';
    req.session.adminAuthenticated = false;

    req.session.save((err) => {
      if (err) {
        console.error('Signup session error:', err);

        return res.status(500).json({
          error: 'Account created, but login session could not be saved.'
        });
      }

      return res.status(201).json({
        success: true,
        role: 'user',
        id: String(user._id)
      });
    });
  } catch (err) {
    console.error('Signup error:', err);

    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Email already exists.'
      });
    }

    return res.status(500).json({
      error: 'Signup failed.'
    });
  }
});

// --------------------
// User login
// --------------------

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials.'
      });
    }

    const passwordValid = await user.validatePassword(password);

    if (!passwordValid) {
      return res.status(401).json({
        error: 'Invalid credentials.'
      });
    }

    // Regenerate the session to help prevent session fixation.
    req.session.regenerate((err) => {
      if (err) {
        console.error('User session error:', err);

        return res.status(500).json({
          error: 'Could not create login session.'
        });
      }

      req.session.userId = String(user._id);
      req.session.role = user.role || 'user';
      req.session.adminAuthenticated = false;

      req.session.save((saveError) => {
        if (saveError) {
          console.error('User session save error:', saveError);

          return res.status(500).json({
            error: 'Could not save login session.'
          });
        }

        return res.json({
          success: true,
          role: req.session.role,
          id: String(user._id)
        });
      });
    });
  } catch (err) {
    console.error('Login error:', err);

    return res.status(500).json({
      error: 'Login failed.'
    });
  }
});

// --------------------
// Logout
// --------------------

app.post('/logout', (req, res) => {
  if (!req.session) {
    return res.json({ success: true });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);

      return res.status(500).json({
        success: false,
        error: 'Logout failed.'
      });
    }

    res.clearCookie('fixmyroads.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return res.json({ success: true });
  });
});

// --------------------
// Create a complaint
// --------------------

app.post('/api/complaints', (req, res, next) => {
  upload.single('photo')(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({
        message: 'Upload error',
        error: uploadError.message
      });
    }

    try {
      const {
        title,
        description,
        category,
        severity,
        latitude,
        longitude,
        address,
        landmark,
        anonymous
      } = req.body || {};

      if (!title || !description) {
        return res.status(400).json({
          message: 'Title and description are required.'
        });
      }

      const imagePath = req.file
        ? `/uploads/${req.file.filename}`
        : undefined;

      // Prefer the authenticated user's ID over any client-supplied ID.
      const reporterValue = req.session?.userId || undefined;

      const hasLatitude = latitude !== undefined && latitude !== '';
      const hasLongitude = longitude !== undefined && longitude !== '';
      const hasLocationDetails = Boolean(
        hasLatitude ||
        hasLongitude ||
        (typeof address === 'string' && address.trim()) ||
        (typeof landmark === 'string' && landmark.trim())
      );

      const parsedLatitude = hasLatitude ? Number(latitude) : undefined;
      const parsedLongitude = hasLongitude ? Number(longitude) : undefined;

      if (
        (hasLatitude && !Number.isFinite(parsedLatitude)) ||
        (hasLongitude && !Number.isFinite(parsedLongitude))
      ) {
        return res.status(400).json({
          message: 'Latitude and longitude must be valid numbers.'
        });
      }

      const isAnonymous = anonymous === true ||
        String(anonymous).toLowerCase() === 'true';

      const complaint = new Complaint({
        title: String(title).trim(),
        description: String(description).trim(),
        category,
        severity,
        photos: imagePath ? [imagePath] : [],
        location: hasLocationDetails
          ? {
              lat: parsedLatitude,
              lng: parsedLongitude,
              address: typeof address === 'string' ? address.trim() : '',
              landmark: typeof landmark === 'string' ? landmark.trim() : ''
            }
          : undefined,
        anonymous: isAnonymous,
        reporter: reporterValue
      });

      await complaint.save();

      return res.status(201).json({
        message: 'Complaint created successfully.',
        complaint
      });
    } catch (err) {
      console.error('Create complaint error:', err);

      return res.status(500).json({
        message: 'Could not create complaint.'
      });
    }
  });
});

// --------------------
// List complaints
// Kept public for the public complaints page.
// --------------------

app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('reporter', 'name')
      .sort({ createdAt: -1 })
      .limit(200);

    // Do not expose the reporter's identity for anonymous complaints.
    const publicComplaints = complaints.map((complaint) => {
      const data = complaint.toObject();
      if (data.anonymous) data.reporter = null;
      return data;
    });

    return res.json(publicComplaints);
  } catch (err) {
    console.error('Get complaints error:', err);

    return res.status(500).json({
      message: 'Could not retrieve complaints.'
    });
  }
});

// --------------------
// Get one complaint
// --------------------

app.get('/api/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let complaint = null;

    if (mongoose.isValidObjectId(id)) {
      complaint = await Complaint.findById(id).populate('reporter', 'name');
    }

    if (!complaint) {
      complaint = await Complaint.findOne({ id }).populate('reporter', 'name');
    }

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found.'
      });
    }

    const complaintData = complaint.toObject();
    if (complaintData.anonymous) complaintData.reporter = null;

    return res.json(complaintData);
  } catch (err) {
    console.error('Get single complaint error:', err);

    return res.status(500).json({
      message: 'Could not retrieve complaint.'
    });
  }
});

// --------------------
// Get complaints for signed-in user
// --------------------

app.get('/api/mycomplaints', ensureAuthenticated, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      reporter: req.session.userId
    })
      .sort({ createdAt: -1 })
      .limit(500);

    return res.json({
      ok: true,
      complaints
    });
  } catch (err) {
    console.error('My complaints error:', err);

    return res.status(500).json({
      ok: false,
      error: 'Could not retrieve your complaints.'
    });
  }
});

// --------------------
// Admin: update complaint status
// ADMIN AUTHENTICATION IS REQUIRED.
// --------------------

app.patch(
  '/admin/complaints/:id/status',
  ensureAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, remark } = req.body || {};

      const allowedStatuses = [
        'Submitted',
        'Verified',
        'In Progress',
        'Resolved',
        'Closed'
      ];

      if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: 'Please provide a valid complaint status.'
        });
      }

      let complaint = null;

      if (mongoose.isValidObjectId(id)) {
        complaint = await Complaint.findById(id);
      }

      if (!complaint) {
        complaint = await Complaint.findOne({ id });
      }

      if (!complaint) {
        return res.status(404).json({
          message: 'Complaint not found.'
        });
      }

      complaint.status = status;

      if (remark !== undefined) {
        complaint.remark = String(remark).trim();
      }

      await complaint.save();

      console.log(
        `Admin updated complaint ${complaint._id} to ${status}`
      );

      return res.json({
        message: 'Complaint status updated successfully.',
        complaint
      });
    } catch (err) {
      console.error('Update complaint status error:', err);

      return res.status(500).json({
        message: 'Could not update complaint status.'
      });
    }
  }
);

// --------------------
// Error handler
// --------------------

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    message: 'Internal server error.'
  });
});

// --------------------
// Connect MongoDB and start server
// --------------------

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing from backend/.env');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Admin login: http://localhost:${PORT}/admin-login.html`);
      console.log(`Admin dashboard: http://localhost:${PORT}/admin.html`);
      console.log(`Public page: http://localhost:${PORT}/index.html`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });