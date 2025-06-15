import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  sections: {
    heroSection: {
      type: Boolean,
      default: true
    },
    booksSection: {
      type: Boolean,
      default: true
    },
    contactSection: {
      type: Boolean,
      default: true
    }
  },
  contacts: {
    telegram: {
      type: String,
      default: '@davybookzone'
    },
    whatsapp: {
      type: String,
      default: '+2250799781292'
    },
    email: {
      type: String,
      default: 'contact@davybookzone.com'
    }
  },
  siteInfo: {
    siteName: {
      type: String,
      default: 'DavyBookZone'
    },
    siteDescription: {
      type: String,
      default: 'Votre destination pour les livres numériques PDF'
    },
    logo: {
      public_id: String,
      url: String
    }
  },
  emailSettings: {
    enableNotifications: {
      type: Boolean,
      default: true
    },
    adminEmail: {
      type: String,
      default: process.env.CONTACT_EMAIL || 'admin@davybookzone.com'
    }
  },
  paymentSettings: {
    acceptedMethods: [{
      type: String,
      enum: ['telegram', 'whatsapp', 'email']
    }],
    instructions: {
      type: String,
      default: 'Contactez-nous via Telegram ou WhatsApp pour finaliser votre achat.'
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Settings', settingsSchema);