import Message from '../models/Message.js';
import { notifyAdminNewMessage } from '../utils/email.js';

// @desc    Créer un nouveau message
// @route   POST /api/messages
// @access  Public
export const createMessage = async (req, res) => {
  try {
    const { from, email, subject, content } = req.body;

    const message = await Message.create({
      from,
      email,
      subject,
      content
    });

    // Notifier l'admin par email
    await notifyAdminNewMessage({
      from,
      email,
      subject,
      content
    });

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message
    });
  }
};

// @desc    Obtenir les messages d'un utilisateur
// @route   GET /api/messages/user/:userId
// @access  Private
export const getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const messages = await Message.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('subject content createdAt isRead response');

    const total = await Message.countDocuments({ user: userId });

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: error.message
    });
  }
};