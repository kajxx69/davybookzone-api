import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuration du transporteur email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465 || process.env.EMAIL_PORT == '465', // true pour 465 (SSL)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Envoyer un email de bienvenue
export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"DavyBookZone" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Bienvenue sur DavyBookZone !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563EB;">Bienvenue sur DavyBookZone !</h1>
          <p>Bonjour ${userName},</p>
          <p>Merci de vous être inscrit sur DavyBookZone. Nous sommes ravis de vous compter parmi nos lecteurs !</p>
          <p>Vous pouvez maintenant :</p>
          <ul>
            <li>Parcourir notre catalogue de livres PDF</li>
            <li>Contacter nos vendeurs directement</li>
            <li>Gérer votre profil</li>
          </ul>
          <p>Bonne lecture !</p>
          <p>L'équipe DavyBookZone</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    // console.error('Erreur envoi email de bienvenue:', error);
  }
};

// Notifier l'admin d'un nouveau message
export const notifyAdminNewMessage = async (messageData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"DavyBookZone" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL,
      subject: `Nouveau message: ${messageData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563EB;">Nouveau message reçu</h1>
          <p><strong>De:</strong> ${messageData.from}</p>
          <p><strong>Email:</strong> ${messageData.email}</p>
          <p><strong>Sujet:</strong> ${messageData.subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px;">
            ${messageData.content}
          </div>
          <p>Connectez-vous à l'administration pour répondre.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    // console.error('Erreur notification admin:', error);
  }
};

// Envoyer un email de réponse
export const sendResponseEmail = async (userEmail, subject, responseContent, originalMessage) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"DavyBookZone" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563EB;">Réponse à votre message</h1>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3>Notre réponse:</h3>
            ${responseContent}
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
            <h4>Votre message original:</h4>
            <p><strong>Sujet:</strong> ${subject}</p>
            <p>${originalMessage}</p>
          </div>
          <p>L'équipe DavyBookZone</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    // console.error('Erreur envoi réponse:', error);
  }
};