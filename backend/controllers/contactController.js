const sendEmail = require('../utils/emailService');

exports.submitContactForm = async (req, res, next) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Please provide all fields: name, email, message' });
        }

        const companyEmail = process.env.EMAIL_USER || 'support.easystay@gmail.com';

        const htmlMessage = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <div style="background-color: #2563eb; padding: 30px 40px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">EasyStay Support</h1>
                        <p style="color: #bfdbfe; margin: 8px 0 0 0; font-size: 14px;">New Contact Inquiry Received</p>
                    </div>
                    
                    <!-- Body -->
                    <div style="padding: 40px;">
                        <div style="margin-bottom: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <h3 style="margin-top: 0; margin-bottom: 15px; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Sender Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; width: 60px; font-weight: 600; font-size: 14px;">Name:</td>
                                    <td style="padding: 8px 0; color: #0f172a; font-weight: 500; font-size: 14px;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Email:</td>
                                    <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${email}</a></td>
                                </tr>
                            </table>
                        </div>

                        <div style="margin-bottom: 10px;">
                            <h3 style="margin-top: 0; margin-bottom: 15px; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Message</h3>
                            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-left-width: 4px; border-left-color: #2563eb; border-radius: 0 8px 8px 0; color: #334155; line-height: 1.6; white-space: pre-wrap; font-size: 15px;">${message}</div>
                        </div>
                        
                        <div style="margin-top: 40px; text-align: center;">
                            <a href="mailto:${email}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 15px;">Reply to ${name}</a>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0; color: #94a3b8; font-size: 12px;">This is an automated message from the EasyStay Contact Us form.</p>
                        <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} EasyStay Management System</p>
                    </div>
                </div>
            </div>
        `;

        await sendEmail({
            email: companyEmail,
            subject: `New Contact Inquiry from ${name}`,
            message: message, // fallback plain text
            html: htmlMessage
        });

        res.status(200).json({ success: true, message: 'Your message has been sent successfully.' });
    } catch (err) {
        console.error('Contact Form Delivery Error:', err);
        res.status(500).json({ success: false, message: 'Unable to send your message at this time. Please try again later.' });
    }
};
