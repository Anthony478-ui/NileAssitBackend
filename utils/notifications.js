// backend/utils/notifications.js
const nodemailer = require("nodemailer");

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendNewContactNotification = async (contactData) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@nileassist.com",
      to: process.env.ADMIN_EMAIL || "admin@nileassist.com",
      subject: "🚀 New Contact Request - Nile Assist",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0A2540, #1e40af); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Nile Assist</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">New Contact Request</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #0A2540; margin-bottom: 20px;">New Lead Alert! 🎯</h2>
            
            <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #0A2540; margin-bottom: 15px;">Contact Information</h3>
              <p><strong>Name:</strong> ${contactData.name}</p>
              <p><strong>Email:</strong> ${contactData.email}</p>
              <p><strong>Business Type:</strong> ${
                contactData.businessType || "Not specified"
              }</p>
              <p><strong>Service Needed:</strong> ${contactData.service}</p>
            </div>
            
            <div style="background: white; border-radius: 10px; padding: 20px;">
              <h3 style="color: #0A2540; margin-bottom: 15px;">Message</h3>
              <p style="line-height: 1.6;">${contactData.message}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${
                process.env.ADMIN_URL || "http://localhost:5173/admin"
              }" 
                 style="background: #0A2540; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View in Admin Dashboard
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #64748b; font-size: 14px;">
            <p>This is an automated notification from Nile Assist</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Contact notification email sent");
  } catch (error) {
    console.error("Error sending email notification:", error);
  }
};

const sendCustomQuoteNotification = async (quoteData) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@nileassist.com",
      to: process.env.ADMIN_EMAIL || "admin@nileassist.com",
      subject: "💎 New Custom Quote Request - Nile Assist",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #D4AF37, #f59e0b); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Nile Assist</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Custom Quote Request</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #0A2540; margin-bottom: 20px;">New Custom Quote Request! 💰</h2>
            
            <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 15px;">
              <h3 style="color: #0A2540; margin-bottom: 15px;">Client Information</h3>
              <p><strong>Name:</strong> ${quoteData.name}</p>
              <p><strong>Email:</strong> ${quoteData.email}</p>
              <p><strong>Company:</strong> ${
                quoteData.company || "Not specified"
              }</p>
              <p><strong>Business Type:</strong> ${
                quoteData.businessType || "Not specified"
              }</p>
            </div>
            
            <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 15px;">
              <h3 style="color: #0A2540; margin-bottom: 15px;">Project Details</h3>
              <p><strong>Budget:</strong> ${
                quoteData.budget || "Not specified"
              }</p>
              <p><strong>Timeline:</strong> ${
                quoteData.timeline || "Flexible"
              }</p>
              <p><strong>Urgency:</strong> ${
                quoteData.urgency || "Standard"
              }</p>
            </div>
            
            <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 15px;">
              <h3 style="color: #0A2540; margin-bottom: 15px;">Services Needed</h3>
              <ul>
                ${quoteData.servicesNeeded
                  .map((service) => `<li>${service}</li>`)
                  .join("")}
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${
                process.env.ADMIN_URL || "http://localhost:5173/admin"
              }" 
                 style="background: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Review Quote Request
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #64748b; font-size: 14px;">
            <p>This is an automated notification from Nile Assist</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Custom quote notification email sent");
  } catch (error) {
    console.error("Error sending custom quote email:", error);
  }
};

module.exports = {
  sendNewContactNotification,
  sendCustomQuoteNotification,
};
