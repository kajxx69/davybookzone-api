import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Message from '../models/Message.js';
import Settings from '../models/Settings.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Nettoyer la base de données
    await User.deleteMany();
    await Book.deleteMany();
    await Message.deleteMany();
    await Settings.deleteMany();

    // Créer l'utilisateur admin
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
    const admin = await User.create({
      firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.ADMIN_LAST_NAME || 'DavyBookZone',
      email: process.env.ADMIN_EMAIL || 'admin@davybookzone.com',
      password: adminPassword,
      role: 'admin'
    });

    // Créer des utilisateurs de test
    const userPassword = await bcrypt.hash('password', 12);
    const users = await User.create([
      {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'user@example.com',
        password: userPassword,
        role: 'user'
      },
      {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie@example.com',
        password: userPassword,
        role: 'user'
      },
      {
        firstName: 'Pierre',
        lastName: 'Durand',
        email: 'pierre@example.com',
        password: userPassword,
        role: 'user'
      }
    ]);

    // Créer des livres de démonstration
    const books = await Book.create([
      {
        title: 'Développement Web Moderne',
        description: 'Un guide complet pour apprendre le développement web avec les technologies modernes. Ce livre couvre React, Node.js, et les meilleures pratiques de développement.',
        shortDescription: 'Guide complet du développement web moderne',
        author: 'Pierre Développeur',
        category: 'Programmation',
        price: 29.99,
        coverImage: {
          url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        pdfFile: {
          url: 'https://example.com/dev-web-moderne.pdf',
          originalName: 'dev-web-moderne.pdf',
          size: 5242880
        },
        isActive: true,
        purchaseCount: 45,
        viewCount: 120,
        tags: ['react', 'nodejs', 'javascript', 'web'],
        addedBy: admin._id
      },
      {
        title: 'Marketing Digital Efficace',
        description: 'Stratégies et techniques de marketing digital pour réussir en ligne. Apprenez les secrets du marketing sur les réseaux sociaux, le SEO et la publicité en ligne.',
        shortDescription: 'Stratégies de marketing digital',
        author: 'Sophie Marketing',
        category: 'Business',
        price: 24.99,
        coverImage: {
          url: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        pdfFile: {
          url: 'https://example.com/marketing-digital.pdf',
          originalName: 'marketing-digital.pdf',
          size: 3145728
        },
        isActive: true,
        purchaseCount: 32,
        viewCount: 89,
        tags: ['marketing', 'digital', 'seo', 'social media'],
        addedBy: admin._id
      },
      {
        title: 'Photographie Créative',
        description: 'Techniques avancées de photographie pour créer des images saisissantes. Explorez la composition, l\'éclairage et la post-production.',
        shortDescription: 'Techniques avancées de photographie',
        author: 'Marc Photographe',
        category: 'Art & Design',
        price: 19.99,
        coverImage: {
          url: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        pdfFile: {
          url: 'https://example.com/photographie-creative.pdf',
          originalName: 'photographie-creative.pdf',
          size: 7340032
        },
        isActive: true,
        purchaseCount: 28,
        viewCount: 67,
        tags: ['photographie', 'art', 'créativité'],
        addedBy: admin._id
      },
      {
        title: 'Cuisine Française Authentique',
        description: 'Recettes traditionnelles de la cuisine française avec des techniques modernes. Découvrez les secrets des grands chefs français.',
        shortDescription: 'Recettes traditionnelles françaises',
        author: 'Chef Antoine',
        category: 'Cuisine',
        price: 22.99,
        coverImage: {
          url: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        pdfFile: {
          url: 'https://example.com/cuisine-francaise.pdf',
          originalName: 'cuisine-francaise.pdf',
          size: 4194304
        },
        isActive: true,
        purchaseCount: 18,
        viewCount: 45,
        tags: ['cuisine', 'français', 'recettes'],
        addedBy: admin._id
      },
      {
        title: 'Intelligence Artificielle Pratique',
        description: 'Introduction pratique à l\'IA et au machine learning. Apprenez à créer vos premiers modèles d\'IA avec Python.',
        shortDescription: 'Introduction pratique à l\'IA',
        author: 'Dr. Sarah IA',
        category: 'Programmation',
        price: 34.99,
        coverImage: {
          url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        pdfFile: {
          url: 'https://example.com/ia-pratique.pdf',
          originalName: 'ia-pratique.pdf',
          size: 6291456
        },
        isActive: true,
        purchaseCount: 15,
        viewCount: 38,
        tags: ['ia', 'machine learning', 'python', 'data science'],
        addedBy: admin._id
      }
    ]);

    // Créer des messages de démonstration
    await Message.create([
      {
        from: 'Jean Dupont',
        email: 'jean@example.com',
        subject: 'Question sur un livre',
        content: 'Bonjour, j\'aimerais savoir si vous avez d\'autres livres sur le développement web?',
        isRead: false
      },
      {
        from: 'Marie Martin',
        email: 'marie@example.com',
        subject: 'Problème de téléchargement',
        content: 'J\'ai acheté un livre hier mais je n\'arrive pas à le télécharger. Pouvez-vous m\'aider?',
        isRead: true,
        readAt: new Date(),
        readBy: admin._id
      },
      {
        from: 'Paul Durand',
        email: 'paul@example.com',
        subject: 'Suggestion de livre',
        content: 'Pourriez-vous ajouter des livres sur la cybersécurité? C\'est un domaine qui m\'intéresse beaucoup.',
        isRead: false
      }
    ]);

    // Créer les paramètres par défaut
    await Settings.create({
      sections: {
        heroSection: true,
        booksSection: true,
        contactSection: true
      },
      contacts: {
        telegram: process.env.TELEGRAM_CONTACT || '@davybookzone',
        whatsapp: process.env.WHATSAPP_CONTACT || '+33123456789',
        email: process.env.CONTACT_EMAIL || 'contact@davybookzone.com'
      },
      siteInfo: {
        siteName: 'DavyBookZone',
        siteDescription: 'Votre destination pour les livres numériques PDF'
      },
      emailSettings: {
        enableNotifications: true,
        adminEmail: process.env.CONTACT_EMAIL || 'admin@davybookzone.com'
      },
      paymentSettings: {
        acceptedMethods: ['telegram', 'whatsapp'],
        instructions: 'Contactez-nous via Telegram ou WhatsApp pour finaliser votre achat.'
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
};

seedDatabase();