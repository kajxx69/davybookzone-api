import Book from '../models/Book.js';
import User from '../models/User.js';
import { uploadImage, uploadPDF, deleteFile } from '../utils/cloudinary.js';

// @desc    Obtenir tous les livres actifs
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construire la requête
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Options de tri
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    const books = await Book.find(query)
      .sort(sortOptions)
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

// @desc    Obtenir un livre par ID
// @route   GET /api/books/:id
// @access  Public
export const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('addedBy', 'firstName lastName');

    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }

    // Incrémenter le compteur de vues
    book.viewCount += 1;
    await book.save();

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du livre',
      error: error.message
    });
  }
};

// @desc    Créer un nouveau livre
// @route   POST /api/books
// @access  Private (Admin)
export const createBook = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      author,
      category,
      price,
      tags
    } = req.body;

    // Vérifier que les fichiers sont présents
    if (!req.files || !req.files.coverImage || !req.files.pdfFile) {
      return res.status(400).json({
        success: false,
        message: 'Image de couverture et fichier PDF requis'
      });
    }

    // Upload de l'image de couverture
    const coverImageResult = await uploadImage(
      req.files.coverImage[0].buffer,
      'davybookzone/covers'
    );

    // Upload du fichier PDF
    const pdfResult = await uploadPDF(
      req.files.pdfFile[0].buffer,
      req.files.pdfFile[0].originalname,
      'davybookzone/pdfs'
    );

    // Créer le livre
    const book = await Book.create({
      title,
      description,
      shortDescription,
      author,
      category,
      price: parseFloat(price),
      coverImage: coverImageResult,
      pdfFile: pdfResult,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      addedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Livre créé avec succès',
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du livre',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un livre
// @route   PUT /api/books/:id
// @access  Private (Admin)
export const updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }

    const {
      title,
      description,
      shortDescription,
      author,
      category,
      price,
      tags,
      isActive
    } = req.body;

    // Préparer les données de mise à jour
    const updateData = {
      title,
      description,
      shortDescription,
      author,
      category,
      price: parseFloat(price),
      tags: tags ? tags.split(',').map(tag => tag.trim()) : book.tags,
      isActive: isActive !== undefined ? isActive : book.isActive
    };

    // Gérer l'upload de nouvelle image de couverture
    if (req.files && req.files.coverImage) {
      // Supprimer l'ancienne image
      if (book.coverImage.public_id) {
        await deleteFile(book.coverImage.public_id, 'image');
      }

      // Upload de la nouvelle image
      const coverImageResult = await uploadImage(
        req.files.coverImage[0].buffer,
        'davybookzone/covers'
      );
      updateData.coverImage = coverImageResult;
    }

    // Gérer l'upload de nouveau PDF
    if (req.files && req.files.pdfFile) {
      // Supprimer l'ancien PDF
      if (book.pdfFile.public_id) {
        await deleteFile(book.pdfFile.public_id, 'raw');
      }

      // Upload du nouveau PDF
      const pdfResult = await uploadPDF(
        req.files.pdfFile[0].buffer,
        req.files.pdfFile[0].originalname,
        'davybookzone/pdfs'
      );
      updateData.pdfFile = pdfResult;
    }

    book = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Livre mis à jour avec succès',
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du livre',
      error: error.message
    });
  }
};

// @desc    Supprimer un livre
// @route   DELETE /api/books/:id
// @access  Private (Admin)
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }

    // Supprimer les fichiers de Cloudinary
    if (book.coverImage.public_id) {
      await deleteFile(book.coverImage.public_id, 'image');
    }
    if (book.pdfFile.public_id) {
      await deleteFile(book.pdfFile.public_id, 'raw');
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Livre supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du livre',
      error: error.message
    });
  }
};

// @desc    Obtenir les catégories disponibles
// @route   GET /api/books/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Book.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories',
      error: error.message
    });
  }
};

// @desc    Incrémenter le compteur d'achat
// @route   POST /api/books/:id/purchase
// @access  Public
export const incrementPurchaseCount = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }

    book.purchaseCount += 1;
    await book.save();

    res.json({
      success: true,
      message: 'Compteur d\'achat mis à jour'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du compteur',
      error: error.message
    });
  }
};