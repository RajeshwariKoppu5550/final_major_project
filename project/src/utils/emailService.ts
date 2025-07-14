// Gmail Email Service for WorkLink Platform
// This service handles sending professional email notifications

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface ContactRequestData {
  contractorName: string;
  contractorEmail: string;
  workerName: string;
  workerEmail: string;
  jobTitle?: string;
  workType?: string;
  location?: string;
  budget?: string;
  message: string;
  action: string;
}

interface JobApplicationData {
  workerName: string;
  workerEmail: string;
  contractorName: string;
  contractorEmail: string;
  jobTitle: string;
  workType: string;
  location: string;
  budget: string;
  skill: string;
  experience: string;
  message: string;
  action: string;
}

// Email templates
const getContactRequestEmailTemplate = (data: ContactRequestData) => {
  const timestamp = new Date().toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return {
    subject: `New Connection Request on WorkLink - ${data.contractorName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WorkLink - Connection Request</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .subtitle { font-size: 16px; opacity: 0.9; }
          .content { padding: 20px 0; }
          .highlight-box { background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .job-details { background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .detail-label { font-weight: 600; color: #475569; }
          .detail-value { color: #1e293b; }
          .cta-container { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; padding: 12px 30px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: all 0.3s ease; }
          .btn-accept { background-color: #10b981; color: white; }
          .btn-accept:hover { background-color: #059669; }
          .btn-decline { background-color: #ef4444; color: white; }
          .btn-decline:hover { background-color: #dc2626; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e2e8f0; margin-top: 30px; color: #64748b; font-size: 14px; }
          .timestamp { color: #64748b; font-size: 12px; text-align: center; margin-top: 15px; }
          @media (max-width: 600px) {
            .container { margin: 10px; padding: 15px; }
            .btn { display: block; margin: 10px 0; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">WorkLink</div>
            <div class="subtitle">Professional Construction Network</div>
          </div>
          
          <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 20px;">New Connection Request</h2>
            
            <div class="highlight-box">
              <p style="margin: 0; font-size: 18px; color: #1e293b;">
                <strong>${data.contractorName}</strong> is interested in connecting with you for work opportunities.
              </p>
            </div>

            ${data.jobTitle ? `
            <div class="job-details">
              <h3 style="margin-top: 0; color: #374151;">Job Details:</h3>
              <div class="detail-row">
                <span class="detail-label">Job Title:</span>
                <span class="detail-value">${data.jobTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Work Type:</span>
                <span class="detail-value">${data.workType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${data.location}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Budget:</span>
                <span class="detail-value">${data.budget}</span>
              </div>
            </div>
            ` : ''}

            <div class="job-details">
              <h3 style="margin-top: 0; color: #374151;">Contractor Information:</h3>
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${data.contractorName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${data.contractorEmail}</span>
              </div>
            </div>

            <p style="font-size: 16px; color: #475569; margin: 20px 0;">
              ${data.message}
            </p>

            <div class="cta-container">
              <a href="https://worklink.in/accept-request?token=accept_${Date.now()}" class="btn btn-accept">
                ✓ Accept & Connect
              </a>
              <a href="https://worklink.in/decline-request?token=decline_${Date.now()}" class="btn btn-decline">
                ✗ Decline Request
              </a>
            </div>

            <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 20px;">
              Click the buttons above to respond to this connection request.
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0;">
              This email was sent by <strong>WorkLink</strong> - India's Professional Construction Network
            </p>
            <p style="margin: 5px 0 0 0;">
              📧 support@worklink.in | 📞 +91 98765 43210
            </p>
            <div class="timestamp">
              Sent on ${timestamp} IST
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
WorkLink - New Connection Request

${data.contractorName} is interested in connecting with you for work opportunities.

${data.jobTitle ? `
Job Details:
- Title: ${data.jobTitle}
- Work Type: ${data.workType}
- Location: ${data.location}
- Budget: ${data.budget}
` : ''}

Contractor Information:
- Name: ${data.contractorName}
- Email: ${data.contractorEmail}

${data.message}

To respond to this request, please visit: https://worklink.in

Best regards,
WorkLink Team
Sent on ${timestamp} IST
    `
  };
};

const getJobApplicationEmailTemplate = (data: JobApplicationData) => {
  const timestamp = new Date().toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return {
    subject: `New Job Application on WorkLink - ${data.workerName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WorkLink - Job Application</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .subtitle { font-size: 16px; opacity: 0.9; }
          .content { padding: 20px 0; }
          .highlight-box { background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .job-details { background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .detail-label { font-weight: 600; color: #475569; }
          .detail-value { color: #1e293b; }
          .cta-container { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; padding: 12px 30px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: all 0.3s ease; }
          .btn-accept { background-color: #10b981; color: white; }
          .btn-accept:hover { background-color: #059669; }
          .btn-decline { background-color: #ef4444; color: white; }
          .btn-decline:hover { background-color: #dc2626; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e2e8f0; margin-top: 30px; color: #64748b; font-size: 14px; }
          .timestamp { color: #64748b; font-size: 12px; text-align: center; margin-top: 15px; }
          @media (max-width: 600px) {
            .container { margin: 10px; padding: 15px; }
            .btn { display: block; margin: 10px 0; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">WorkLink</div>
            <div class="subtitle">Professional Construction Network</div>
          </div>
          
          <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 20px;">New Job Application</h2>
            
            <div class="highlight-box">
              <p style="margin: 0; font-size: 18px; color: #1e293b;">
                <strong>${data.workerName}</strong> has applied for your job posting: "<strong>${data.jobTitle}</strong>"
              </p>
            </div>

            <div class="job-details">
              <h3 style="margin-top: 0; color: #374151;">Job Details:</h3>
              <div class="detail-row">
                <span class="detail-label">Job Title:</span>
                <span class="detail-value">${data.jobTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Work Type:</span>
                <span class="detail-value">${data.workType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${data.location}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Budget:</span>
                <span class="detail-value">${data.budget}</span>
              </div>
            </div>

            <div class="job-details">
              <h3 style="margin-top: 0; color: #374151;">Worker Profile:</h3>
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${data.workerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${data.workerEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Skill:</span>
                <span class="detail-value">${data.skill}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Experience:</span>
                <span class="detail-value">${data.experience} years</span>
              </div>
            </div>

            <p style="font-size: 16px; color: #475569; margin: 20px 0;">
              ${data.message}
            </p>

            <div class="cta-container">
              <a href="https://worklink.in/accept-application?token=accept_${Date.now()}" class="btn btn-accept">
                ✓ Accept Application
              </a>
              <a href="https://worklink.in/decline-application?token=decline_${Date.now()}" class="btn btn-decline">
                ✗ Decline Application
              </a>
            </div>

            <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 20px;">
              Click the buttons above to respond to this job application.
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0;">
              This email was sent by <strong>WorkLink</strong> - India's Professional Construction Network
            </p>
            <p style="margin: 5px 0 0 0;">
              📧 support@worklink.in | 📞 +91 98765 43210
            </p>
            <div class="timestamp">
              Sent on ${timestamp} IST
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
WorkLink - New Job Application

${data.workerName} has applied for your job posting: "${data.jobTitle}"

Job Details:
- Title: ${data.jobTitle}
- Work Type: ${data.workType}
- Location: ${data.location}
- Budget: ${data.budget}

Worker Profile:
- Name: ${data.workerName}
- Email: ${data.workerEmail}
- Skill: ${data.skill}
- Experience: ${data.experience} years

${data.message}

To respond to this application, please visit: https://worklink.in

Best regards,
WorkLink Team
Sent on ${timestamp} IST
    `
  };
};

// Main email sending function
export const sendEmailNotification = async (type: 'contact_request' | 'job_application', data: ContactRequestData | JobApplicationData): Promise<boolean> => {
  try {
    let emailTemplate;
    let recipientEmail;

    if (type === 'contact_request') {
      const contactData = data as ContactRequestData;
      emailTemplate = getContactRequestEmailTemplate(contactData);
      recipientEmail = contactData.workerEmail;
    } else {
      const jobData = data as JobApplicationData;
      emailTemplate = getJobApplicationEmailTemplate(jobData);
      recipientEmail = jobData.contractorEmail;
    }

    // In a real application, you would use a service like:
    // - Gmail API
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer with SMTP

    // For demonstration, we'll log the email content
    console.log(`
🚀 EMAIL SENT TO: ${recipientEmail}
📧 SUBJECT: ${emailTemplate.subject}

${emailTemplate.text}

📱 HTML VERSION: Professional email template with buttons and styling sent successfully!

⚡ Email Service: This would be sent via Gmail API or SMTP service in production.
🕐 Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
    `);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, you would implement actual email sending here:
    /*
    const emailData: EmailData = {
      to: recipientEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    // Example with Gmail API:
    // await gmailAPI.send(emailData);
    
    // Example with SendGrid:
    // await sgMail.send(emailData);
    
    // Example with Nodemailer:
    // await transporter.sendMail(emailData);
    */

    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
};

// Helper function for contact requests
export const sendContactRequestEmail = (data: ContactRequestData) => {
  return sendEmailNotification('contact_request', data);
};

// Helper function for job applications
export const sendJobApplicationEmail = (data: JobApplicationData) => {
  return sendEmailNotification('job_application', data);
};

// Email validation helper
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Gmail-specific helper (for future Gmail API integration)
export const isGmailAddress = (email: string): boolean => {
  return email.toLowerCase().includes('@gmail.com');
};