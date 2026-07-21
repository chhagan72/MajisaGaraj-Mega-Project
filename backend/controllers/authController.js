const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Configure Nodemailer Transporter securely
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

// Helper function to generate and send 4-digit OTP with strict error handshakes
const sendOtpEmail = async (email, userInstance) => {
    // 1. Ensure env variables exist before launching mail client hooks
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("SMTP Credentials missing in environment (.env configuration targets).");
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Secure 4 Digit Node
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 Mins

    userInstance.otp = otp;
    userInstance.otpExpires = otpExpires;
    await userInstance.save();

    const mailOptions = {
        from: `"Majisa Garage" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Secure Security Identity Verification Key",
        html: `
            <div style="font-family: monospace; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 500px;">
                <h2 style="color: #0d6efd;">🔧 MAJISA GARAGE</h2>
                <p>Your authentication dynamic key request has triggered validation nodes.</p>
                <div style="background: #f8f9fa; font-size: 24px; font-weight: bold; padding: 15px; text-align: center; border-radius: 4px; letter-spacing: 5px; color: #333;">
                    ${otp}
                </div>
                <p style="font-size: 12px; color: #777; margin-top: 20px;">This OTP node sequence automatically expires in 10 minutes.</p>
            </div>
        `
    };

    // Trigger asynchronous transmission loop
    await transporter.sendMail(mailOptions);
};

// @desc    Register standard users safely & send OTP
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email formatting blueprint pattern." });
        }

        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: "Password syntax structure rejected requirement criteria verification loops." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });
        
        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ message: "This email entity address mapping already carries an active verified profile." });
            }
            // User exists but unverified, update name/password
            const salt = await bcrypt.genSalt(10);
            user.name = name;
            user.password = await bcrypt.hash(password, salt);
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({
                name,
                email: normalizedEmail,
                password: hashedPassword,
                role: 'user',
                isVerified: false
            });
        }

        // Attempt Email Delivery Node
        try {
            await sendOtpEmail(normalizedEmail, user);
            res.status(200).json({ message: "Verification OTP transmitted! Verify security digits to deploy node configuration." });
        } catch (mailErr) {
            console.error("Nodemailer Error Node Caught:", mailErr.message);
            res.status(500).json({ 
                message: "Email sending failed. Please check backend .env variables and verify your Gmail App Password setup.", 
                error: mailErr.message 
            });
        }

    } catch (err) {
        res.status(500).json({ message: "Internal server execution fault exception error context logged.", error: err.message });
    }
};

// @desc    Authenticate credentials session & issue OTP
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(400).json({ message: "Security clearance rejection. Re-verify requested context mapping fields." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Security clearance rejection. Re-verify requested context mapping fields." });

        // Generate and send login authentication OTP code safely
        try {
            await sendOtpEmail(normalizedEmail, user);
            res.json({ otpRequired: true, message: "Security checkpoint active. Enter the 4-digit code sent to your email connection channel." });
        } catch (mailErr) {
            console.error("Nodemailer Error Node Caught during Login:", mailErr.message);
            res.status(500).json({ 
                message: "Failed to dispatch authentication OTP. Ensure your server's Gmail App Password config is complete.", 
                error: mailErr.message 
            });
        }

    } catch (err) {
        res.status(500).json({ message: "Internal server execution fault exception error context logged.", error: err.message });
    }
};

// @desc    Verify OTP for Registration & Login Complete Sequence
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(404).json({ message: "Identity node mapping not found." });

        if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
            return res.status(400).json({ message: "Invalid or expired authorization verification security digits." });
        }

        // Wipe OTP nodes upon validation pass clearance
        user.otp = null;
        user.otpExpires = null;
        user.isVerified = true; 
        await user.save();

        // Sign token session validation layer
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' }
        );

        res.status(200).json({
            message: "Security authorization verification loop cleared successfully!",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: "Internal server validation exception fault.", error: err.message });
    }
};

// @desc    Change authenticated user or admin password safely
exports.changePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if (!email || !oldPassword || !newPassword) {
            return res.status(400).json({ message: "All authentication fields are mandatory." });
        }

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ message: "New password requirements: 8+ characters, 1 uppercase letter, 1 number, and 1 special character." });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.status(404).json({ message: "Identity node mapping not found." });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Current password validation failed. Access denied." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Security credentials re-calibrated successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Internal server compilation logic error.", error: err.message });
    }
};

// @desc    Update specific standard authenticated customer account workspace properties
// @route   PUT /api/auth/profile/:id
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // ADDED: vehicleNumber and fuelType to the destructuring assignment block from req.body
        const { name, phone, bikeModel, profileImage, address, vehicleNumber, fuelType } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Identity schema node target trace not found." });
        }

        // Apply property mutations safely
        if (name) user.name = name;
        user.phone = phone || user.phone;
        user.bikeModel = bikeModel || user.bikeModel;
        user.profileImage = profileImage || user.profileImage;
        user.address = address || user.address;
        user.vehicleNumber = vehicleNumber || user.vehicleNumber; // Integrated property
        user.fuelType = fuelType || user.fuelType;               // Integrated property

        await user.save();

        res.status(200).json({
            message: "User context layout metadata refreshed successfully.",
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                bikeModel: user.bikeModel,
                profileImage: user.profileImage,
                address: user.address,
                vehicleNumber: user.vehicleNumber, // Sent to frontend state
                fuelType: user.fuelType           // Sent to frontend state
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Internal server execution fault mapping alterations.", error: err.message });
    }
};