import User from '../models/User.js';
import Book from '../models/Book.js';
import Message from '../models/Message.js';
import Settings from '../models/Settings.js';
import { sendResponseEmail } from '../utils/email.js';
import Purchase from '../models/Purchase.js';

// @desc    Obtenir les statistiques du dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalBooks = await Book.countDocuments();
    const activeBooks = await Book.countDocuments({ isActive: true });
    const unreadMessages = await Message.countDocuments({ isRead: false });
    const totalPurchases = await Book.aggregate([
      { $group: { _id: null, total: { $sum: '$purchaseCount' } } }
    ]);

    // Statistiques des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const newBooksLast30Days = await Book.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Livres les plus populaires
    const popularBooks = await Book.find({ isActive: true })
      .sort({ purchaseCount: -1 })
      .limit(5)
      .select('title author purchaseCount price');

    // Utilisateurs récents
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt isActive');

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalBooks,
          activeBooks,
          unreadMessages,
          totalPurchases: totalPurchases[0]?.total || 0,
          newUsersLast30Days,
          newBooksLast30Days
        },
        popularBooks,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive
    } = req.query;

    // Construire la requête
    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Pagination
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
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
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, isActive } = req.body;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher la modification de son propre compte
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas modifier votre propre compte'
      });
    }

    // Vérifier si l'email est déjà utilisé
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher la suppression de son propre compte
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
};

// @desc    Obtenir tous les livres (admin)
// @route   GET /api/admin/books
// @access  Private (Admin)
export const getAllBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isActive
    } = req.query;

    // Construire la requête
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Pagination
    const skip = (page - 1) * limit;

    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('addedBy', 'firstName lastName');

    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      data: books,
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
      message: 'Erreur lors de la récupération des livres',
      error: error.message
    });
  }
};

// @desc    Obtenir tous les messages
// @route   GET /api/admin/messages
// @access  Private (Admin)
export const getMessages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      isRead
    } = req.query;

    // Construire la requête
    const query = {};

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    // Pagination
    const skip = (page - 1) * limit;

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('readBy', 'firstName lastName')
      .populate('response.sentBy', 'firstName lastName');

    const total = await Message.countDocuments(query);

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

// @desc    Marquer un message comme lu
// @route   PUT /api/admin/messages/:id/read
// @access  Private (Admin)
export const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true,
        readAt: new Date(),
        readBy: req.user.id
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Message marqué comme lu',
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du message',
      error: error.message
    });
  }
};

// @desc    Répondre à un message
// @route   POST /api/admin/messages/:id/reply
// @access  Private (Admin)// Dans server/controllers/adminController.js
export const replyToMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    // Ajouter la réponse
    message.response = {
      content,
      sentAt: new Date(),
      sentBy: req.user._id // ou req.user.id
    };

    // Marquer comme lu
    message.isRead = true;
    message.readAt = new Date();
    message.readBy = req.user._id;

    await message.save();

    // Essayer d'envoyer l'email, mais ne pas bloquer la réponse si ça échoue
    try {
      await sendResponseEmail(
        message.email,
        message.subject,
        content,
        message.content
      );
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email de réponse :", emailError);
      // On continue quand même
    }

    res.json({
      success: true,
      message: 'Réponse envoyée avec succès',
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi de la réponse",
      error: error.message
    });
  }
};

// @desc    Obtenir les paramètres
// @route   GET /api/admin/settings
// @access  Private (Admin)
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres',
      error: error.message
    });
  }
};

// @desc    Mettre à jour les paramètres
// @route   PUT /api/admin/settings
// @access  Private (Admin)
export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findOneAndUpdate(
        {},
        req.body,
        { new: true, runValidators: true }
      );
    }

    res.json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des paramètres',
      error: error.message
    });
  }
};

// @desc    Obtenir tous les achats
// @route   GET /api/admin/purchases
// @access  Private (Admin)
export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('user_id', 'firstName lastName email')
      .populate('book_id', 'title author price')
      .sort({ purchased_at: -1 });

    res.json({
      success: true,
      data: purchases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des achats',
      error: error.message
    });
  }
};