const ServiceJob = require('../models/ServiceJob');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Import User model to fetch user email address
const nodemailer = require('nodemailer');

let availableBikeSlots = 15; 

// Configure Nodemailer Transport System
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @desc      Get remaining slot configurations
exports.getSlots = (req, res) => {
    res.json({ bikeSlots: availableBikeSlots });
};

// @desc      Submit a bike service request (Creates Admin Radar notification entry)
exports.bookService = async (req, res) => {
    try {
        const { userId, bikeModel, registrationNumber, serviceType, partsToReplace } = req.body;

        if (availableBikeSlots <= 0) {
            return res.status(400).json({ message: "No operational service slots remaining for today." });
        }

        let baseRate = serviceType === 'Full Servicing' ? 120 : 50;
        let partsCost = (partsToReplace || []).length * 35; 
        let totalEstimated = baseRate + partsCost;

        const newJob = new ServiceJob({
            userId,
            vehicleType: 'bike',
            bikeModel,
            registrationNumber,
            serviceType,
            partsToReplace,
            estimatedCost: totalEstimated,
            status: 'Pending'
        });

        await newJob.save();
        availableBikeSlots -= 1;

        // GENERATE ADMIN RADAR SYSTEM NOTIFICATION
        const adminAlert = new Notification({
            recipientId: 'admin',
            title: 'New Dispatch Logged',
            message: `New request received for vehicle model ${bikeModel} [Reg No: ${registrationNumber}]`,
            jobId: newJob._id,
            isRead: false
        });
        await adminAlert.save();

        res.status(201).json({ message: "Maintenance booking dispatched successfully!", job: newJob });
    } catch (err) {
        res.status(500).json({ message: "Booking rejected.", error: err.message });
    }
};

// @desc      Fetch specific user tracking records
exports.getUserJobs = async (req, res) => {
    try {
        const jobs = await ServiceJob.find({ userId: req.params.userId, vehicleType: 'bike' }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc      Fetch all incoming bike service records for Admin panel view
exports.getAllBikeJobs = async (req, res) => {
    try {
        const jobs = await ServiceJob.find({ vehicleType: 'bike' }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc      Admin transitions booking status (Saves Invoice, sends user alert loop notification & dispatches automated email)
exports.updateJobStatus = async (req, res) => {
    try {
        const { status, adminNotes, invoice } = req.body;
        const jobId = req.params.id;

        const updatedJob = await ServiceJob.findById(jobId);
        if (!updatedJob) return res.status(404).json({ message: "Service job instance not resolved." });

        updatedJob.status = status;
        if (adminNotes !== undefined) updatedJob.adminNotes = adminNotes;
        
        if (invoice !== undefined) {
            updatedJob.invoice = invoice;
        }

        await updatedJob.save();

        // CONFIGURE TARGETED USER ALERT PAYLOAD TRANSITIONS
        let textPrompt = `Your vehicle ${updatedJob.bikeModel} state updated to: ${status.toUpperCase()}.`;
        
        if (status === 'To Do') {
            textPrompt = `Admin has accepted your request. Your bike ${updatedJob.bikeModel} [Reg: ${updatedJob.registrationNumber}] is placed in queue (TO DO).`;
        } else if (status === 'In Progress') {
            textPrompt = `Your bike service for ${updatedJob.bikeModel} (${updatedJob.registrationNumber}) is now IN PROGRESS in the service bay.`;
        } else if (status === 'In Review') {
            textPrompt = `Quality check active. Your vehicle ${updatedJob.bikeModel} is under final testing and evaluation (IN REVIEW).`;
        } else if (status === 'Done') {
            textPrompt = `Great news! Your bike service for ${updatedJob.bikeModel} is complete, and your invoice has been sent to your email address. Ready for pickup!`;
        }

        // Save dashboard feed alert notification node
        const userNotification = new Notification({
            recipientId: updatedJob.userId,
            title: `Job Phase: ${status}`,
            message: textPrompt,
            jobId: updatedJob._id,
            isRead: false
        });
        await userNotification.save();

        // NEW: DISPATCH INVOICE VIA EMAIL ROUTING LAYER WHEN JOB COMPLETION FLAG IS "DONE"
        if (status === 'Done' && invoice) {
            try {
                // Find registered client user profile data securely to grab their real email
                const clientUser = await User.findById(updatedJob.userId);
                
                if (clientUser && clientUser.email) {
                    const baseAmount = parseFloat(invoice.baseServiceAmount || 0);
                    const discountAmount = parseFloat(invoice.discount || 0);
                    
                    // Generate items dynamic array subtotal computation loops
                    const productsTotal = (invoice.products || []).reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
                    const grossSubtotal = baseAmount + productsTotal;

                    // Compile list table row entries
                    const dynamicItemsHtml = (invoice.products || [])
                        .filter(p => p.name && p.name.trim() !== '')
                        .map(p => `
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee; font-family: monospace;">Additional Part: ${p.name}</td>
                                <td style="padding: 8px 0; text-align: right; border-bottom: 1px dashed #eee; font-family: monospace;">₹${parseFloat(p.amount).toFixed(2)}</td>
                            </tr>
                        `).join('');

                    // Construct elegant HTML email template with customized rules and underlines
                    const emailHtmlPayload = `
                        <div style="max-width: 600px; margin: 0 auto; padding: 30px; font-family: 'Courier New', Courier, monospace; color: #333; background-color: #ffffff; border: 1px solid #ddd;">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <h1 style="margin: 0; font-weight: bold; color: #111; letter-spacing: 1px;">MAJISA GARAGE</h1>
                                <p style="margin: 5px 0; font-size: 13px; text-transform: uppercase; color: #666;">Two-Wheeler Maintenance Hub</p>
                            </div>
                            
                            <div style="font-size: 13px; margin-bottom: 15px; line-height: 1.4;">
                                <strong>Admin Name:</strong> ${invoice.adminName}<br/>
                                <strong>Admin Email:</strong> ${invoice.adminEmail}<br/>
                                <strong>Admin Mobile Number:</strong> ${invoice.adminMobile}<br/>
                                <strong>Address:</strong> ${invoice.address}
                            </div>

                            <div style="border-bottom: 2px solid #000; margin-bottom: 20px;"></div>

                            <h3 style="margin-top: 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Customer Repair Statement</h3>
                            
                            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px;">
                                <thead>
                                    <tr style="border-bottom: 1px solid #000; text-align: left;">
                                        <th style="padding: 6px 0;">Description</th>
                                        <th style="padding: 6px 0; text-align: right;">Amount</th>
                                    </tr>
                                </thead>
                                tbody>
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">
                                            <strong>Vehicle:</strong> ${updatedJob.bikeModel}<br/>
                                            <span style="font-size: 11px; color:#666;">Registration No: ${updatedJob.registrationNumber}</span>
                                        </td>
                                        <td style="padding: 8px 0; text-align: right; border-bottom: 1px dashed #eee;">-</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px dashed #eee; font-family: monospace;">Base Job Operational Objective: ${updatedJob.serviceType}</td>
                                        <td style="padding: 8px 0; text-align: right; border-bottom: 1px dashed #eee; font-family: monospace;">₹${baseAmount.toFixed(2)}</td>
                                    </tr>
                                    ${dynamicItemsHtml}
                                </tbody>
                            </table>

                            <div style="border-bottom: 1px dashed #000; margin-bottom: 15px;"></div>

                            <div style="text-align: right; font-size: 13px; margin-bottom: 20px; line-height: 1.5;">
                                <p style="margin: 3px 0;">Gross Subtotal: ₹${grossSubtotal.toFixed(2)}</p>
                                <p style="margin: 3px 0; color: #cc0000;">Discount Applied: -₹${discountAmount.toFixed(2)}</p>
                                <div style="border-top: 1px solid #000; display: inline-block; width: 220px; margin-top: 5px; padding-top: 5px;">
                                    <strong>Total Amount Due: ₹${parseFloat(invoice.totalAmount).toFixed(2)}</strong>
                                </div>
                            </div>

                            <div style="border-bottom: 2px solid #000; margin-bottom: 25px;"></div>

                           <div style="margin-top: 60px; font-size: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
                                <div>
                                    <p style="margin: 0; font-weight: bold;">Thank you for trusting Majisa Garage!</p>
                                    <p style="margin: 2px 0; color: #777; font-size: 10px;">Automated Invoicing Log Generation: ${new Date(invoice.generatedAt).toLocaleString()}</p>
                                </div>
                               <div style="text-align: center; width: 200px; border-top: 1px solid #333; padding-top: 5px;">
                                    <span style="font-style: italic; display: block;">${invoice.adminName}</span>
                                    <strong>Authorized Signature</strong>
                                </div>
                            </div>
                        </div>
                    `;

                    // Trigger the asynchronous mail transport send engine operation
                    await transporter.sendMail({
                        from: `"Majisa Garage" <${process.env.EMAIL_USER}>`,
                        to: clientUser.email,
                        subject: `🛠️ Service Completed Invoice - ${updatedJob.registrationNumber}`,
                        html: emailHtmlPayload
                    });
                    console.log(`Invoice successfully dispatched via mail setup to user: ${clientUser.email}`);
                }
            } catch (mailErr) {
                // Prevent email failures from locking up status updates in backend workflows
                console.error("Nodemailer routing crashed while dispatching invoice.", mailErr);
            }
        }

        res.status(200).json({ message: `Status updated successfully to ${status}!`, job: updatedJob });
    } catch (err) {
        res.status(500).json({ message: "Failed to modify structural status nodes.", error: err.message });
    }
};

/* ==========================================================================
   NOTIFICATION SYSTEM CONTROLLERS
   ========================================================================== */

// @desc      Fetch live unread notification payloads matching recipient filters
exports.getNotifications = async (req, res) => {
    try {
        const queryTarget = req.params.recipientId; 
        const notifications = await Notification.find({ recipientId: queryTarget }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc      Mark single message notification as read
exports.markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: "Notification flag marked read successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc      Clear all notification maps completely matching recipient context
exports.clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipientId: req.params.recipientId });
        res.json({ message: "Notification terminal cleared down successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};