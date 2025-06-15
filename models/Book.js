import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  shortDescription: {
    type: String,
    required: [true, 'La description courte est requise'],
    maxlength: [300, 'La description courte ne peut pas dépasser 300 caractères']
  },
  author: {
    type: String,
    required: [true, 'L\'auteur est requis'],
    trim: true,
    maxlength: [100, 'Le nom de l\'auteur ne peut pas dépasser 100 caractères']
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: [
      'Programmation',
      'Business',
      'Art & Design',
      'Cuisine',
      'Santé & Bien-être',
      'Sciences',
      'Histoire',
      'Fiction',
      'Biographie',
      'Développement personnel',
      'Autre'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif'],
    max: [99999999, 'Le prix ne peut pas dépasser 99999999']
  },
  coverImage: {
    public_id: String,
    url: {
      type: String,
      required: [true, 'L\'image de couverture est requise']
    }
  },
  pdfFile: {
    public_id: String,
    url: {
      type: String,
      required: [true, 'Le fichier PDF est requis']
    },
    originalName: String,
    size: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  telegramContact: {
    type: String,
    default: process.env.TELEGRAM_CONTACT || '@davybookzone'
  },
  whatsappContact: {
    type: String,
    default: process.env.WHATSAPP_CONTACT || '+33123456789'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index pour la recherche
bookSchema.index({
  title: 'text',
  description: 'text',
  author: 'text',
  tags: 'text'
});

// Index pour les performances
bookSchema.index({ category: 1, isActive: 1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ purchaseCount: -1 });

export default mongoose.model('Book', bookSchema);