# DavyBookZone Backend API

Backend complet pour la plateforme DavyBookZone - API REST avec Node.js, Express et MongoDB.

## 🚀 Fonctionnalités

### Authentification & Autorisation
- Inscription et connexion utilisateur
- Authentification JWT
- Gestion des rôles (utilisateur/admin)
- Protection des routes sensibles
- Rate limiting pour la sécurité

### Gestion des Livres
- CRUD complet des livres
- Upload d'images de couverture et fichiers PDF
- Système de catégories
- Recherche et filtrage
- Statistiques de vues et achats

### Administration
- Dashboard avec statistiques
- Gestion des utilisateurs
- Gestion des livres
- Système de messagerie
- Paramètres configurables

### Messagerie
- Contact depuis le frontend
- Notifications email automatiques
- Système de réponses admin

### Sécurité
- Validation des données
- Sanitisation des entrées
- Protection CORS
- Rate limiting
- Helmet pour les headers de sécurité

## 📋 Prérequis

- Node.js 18+
- MongoDB 5.0+
- Compte Cloudinary (pour les fichiers)
- Compte email SMTP (pour les notifications)

## 🛠️ Installation

1. **Cloner et installer les dépendances**
```bash
cd server
npm install
```

2. **Configuration de l'environnement**
```bash
cp .env.example .env
```

3. **Configurer les variables d'environnement**
Éditer le fichier `.env` avec vos paramètres :

```env
# Database
MONGODB_URI=mongodb://localhost:27017/davybookzone

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Admin par défaut
ADMIN_EMAIL=admin@davybookzone.com
ADMIN_PASSWORD=admin123
```

4. **Initialiser la base de données**
```bash
npm run seed
```

5. **Démarrer le serveur**
```bash
# Développement
npm run dev

# Production
npm start
```

## 📚 API Endpoints

### Authentification
```
POST /api/auth/register     - Inscription
POST /api/auth/login        - Connexion
GET  /api/auth/me          - Profil utilisateur
PUT  /api/auth/profile     - Mise à jour profil
PUT  /api/auth/password    - Changement mot de passe
```

### Livres
```
GET    /api/books              - Liste des livres
GET    /api/books/:id          - Détails d'un livre
GET    /api/books/categories   - Catégories disponibles
POST   /api/books/:id/purchase - Incrémenter compteur achat
POST   /api/books             - Créer livre (Admin)
PUT    /api/books/:id          - Modifier livre (Admin)
DELETE /api/books/:id          - Supprimer livre (Admin)
```

### Messages
```
POST /api/messages           - Envoyer message
GET  /api/messages/user/:email - Messages d'un utilisateur
```

### Administration
```
GET    /api/admin/stats        - Statistiques dashboard
GET    /api/admin/users        - Liste utilisateurs
PUT    /api/admin/users/:id    - Modifier utilisateur
DELETE /api/admin/users/:id    - Supprimer utilisateur
GET    /api/admin/books        - Liste tous les livres
GET    /api/admin/messages     - Liste messages
PUT    /api/admin/messages/:id/read - Marquer message lu
POST   /api/admin/messages/:id/reply - Répondre message
GET    /api/admin/settings     - Paramètres
PUT    /api/admin/settings     - Modifier paramètres
```

## 🔧 Structure du Projet

```
server/
├── config/
│   └── database.js         # Configuration MongoDB
├── controllers/
│   ├── authController.js   # Authentification
│   ├── bookController.js   # Gestion livres
│   ├── messageController.js # Messages
│   └── adminController.js  # Administration
├── middleware/
│   ├── auth.js            # Authentification JWT
│   ├── validation.js      # Validation données
│   └── upload.js          # Upload fichiers
├── models/
│   ├── User.js            # Modèle utilisateur
│   ├── Book.js            # Modèle livre
│   ├── Message.js         # Modèle message
│   └── Settings.js        # Modèle paramètres
├── routes/
│   ├── auth.js            # Routes auth
│   ├── books.js           # Routes livres
│   ├── messages.js        # Routes messages
│   └── admin.js           # Routes admin
├── scripts/
│   └── seedDatabase.js    # Script d'initialisation
├── utils/
│   ├── cloudinary.js      # Gestion fichiers
│   └── email.js           # Envoi emails
└── server.js              # Point d'entrée
```

## 🔐 Sécurité

- **Authentification JWT** avec expiration
- **Validation stricte** des données d'entrée
- **Rate limiting** pour prévenir les attaques
- **Helmet** pour sécuriser les headers HTTP
- **CORS** configuré pour les domaines autorisés
- **Sanitisation** des données utilisateur

## 📧 Configuration Email

Pour les notifications email, configurez un compte SMTP :

### Gmail
1. Activer l'authentification à 2 facteurs
2. Générer un mot de passe d'application
3. Utiliser ce mot de passe dans `EMAIL_PASS`

### Autres fournisseurs
Adapter les paramètres `EMAIL_HOST` et `EMAIL_PORT` selon votre fournisseur.

## ☁️ Configuration Cloudinary

1. Créer un compte sur [Cloudinary](https://cloudinary.com)
2. Récupérer les clés API depuis le dashboard
3. Configurer les variables d'environnement

## 🚀 Déploiement

### Variables d'environnement production
```env
NODE_ENV=production
MONGODB_URI_PROD=mongodb+srv://...
```

### Plateformes recommandées
- **Railway** - Déploiement simple avec base de données
- **Render** - Alternative gratuite
- **Heroku** - Solution classique
- **DigitalOcean App Platform** - Performance optimale

## 📊 Monitoring

L'API inclut :
- **Health check** sur `/api/health`
- **Logging** avec Morgan
- **Gestion d'erreurs** centralisée
- **Métriques** de performance

## 🧪 Tests

```bash
# Tester la connexion
curl http://localhost:5005/api/health

# Tester l'authentification
curl -X POST http://localhost:5005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@davybookzone.com","password":"admin123"}'
```

## 📝 Comptes par défaut

Après l'initialisation :
- **Admin** : admin@davybookzone.com / admin123
- **Utilisateur** : user@example.com / password

## 🤝 Support

Pour toute question ou problème :
1. Vérifier les logs du serveur
2. Consulter la documentation API
3. Tester avec les endpoints de santé