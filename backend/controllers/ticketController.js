const Ticket = require('../models/Ticket');
const nodemailer = require('nodemailer');

// Reuse your secure Nodemailer Transporter configuration block
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.createTicket = async (req, res) => {
    try {
        const { userId, name, email, subject, message } = req.body;

        if (!userId || !subject || !message) {
            return res.status(400).json({ message: "Required dispatch validation data criteria missing." });
        }

        // 1. Save Support Ticket payload data properties to MongoDB
        const newTicket = new Ticket({
            userId,
            name,
            email,
            subject,
            message
        });
        await newTicket.save();

        // 2. Transmit automated email receipt payload back to user client
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `🔧 Majisa Garage Ticket Registered: ${subject}`,
            html: `
                <div style="font-family: monospace; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px;">
                    <h2 style="color: #1a202c; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">MAJISA GARAGE SUPPORT TERMINAL</h2>
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>We have safely captured your desk communication payload. Our system support crew will examine your details shortly.</p>
                    <hr style="border: 0; border-top: 1px dashed #ccc; margin: 20px 0;" />
                    <p><strong>Ticket ID:</strong> ${newTicket._id}</p>
                    <p><strong>Category:</strong> ${subject}</p>
                    <p><strong>Your Message:</strong></p>
                    <blockquote style="background: #f8f9fa; padding: 10px; border-left: 4px solid #3b82f6; font-style: italic;">
                        ${message}
                    </blockquote>
                    <hr style="border: 0; border-top: 1px dashed #ccc; margin: 20px 0;" />
                    <p style="font-size: 11px; color: #666;">This is an automated operational transmission validation step. Do not reply directly to this mail pipeline node.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            success: true,
            message: "Ticket metrics logged successfully. Confirmation communication sent.",
            ticket: newTicket
        });

    } catch (err) {
        console.error("Support transmission layout workflow fault:", err);
        res.status(500).json({ message: "Internal server error execution fault processing ticket data.", error: err.message });
    }
};