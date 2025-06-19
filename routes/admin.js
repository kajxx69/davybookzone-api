import express from 'express';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Message from '../models/Message.js';
import {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getAllBooks,
  getMessages,
  markMessageAsRead,
  replyToMessage,
  getSettings,
  updateSettings,
  getAllPurchases
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes admin nécessitent une authentification et le rôle admin
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// Gestion des utilisateurs
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
// Activer/désactiver un utilisateur
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Gestion des livres
router.get('/books', getAllBooks);
// Activer/désactiver un livre
router.put('/books/:id/toggle-status', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Livre non trouvé' });
    book.isActive = !book.isActive;
    await book.save();
    res.json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Gestion des messages
router.get('/messages', getMessages);
router.put('/messages/:id/read', markMessageAsRead);
router.post('/messages/:id/reply', replyToMessage);
// Marquer un message comme lu/non lu
router.put('/messages/:id/toggle-read', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message non trouvé' });
    message.isRead = !message.isRead;
    await message.save();
    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Gestion des achats
router.get('/purchases', getAllPurchases);

// Paramètres
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;