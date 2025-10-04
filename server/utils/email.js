import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendPasswordResetEmail = async (email, temporaryPassword) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset - Expense Management',
      html: `
        <h2>Password Reset</h2>
        <p>Your temporary password is: <strong>${temporaryPassword}</strong></p>
        <p>Please login and change your password immediately.</p>
      `
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

export { sendPasswordResetEmail };