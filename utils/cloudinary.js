import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload d'image
export const uploadImage = async (buffer, folder = 'davybookzone') => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: folder,
          transformation: [
            { width: 800, height: 1200, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              public_id: result.public_id,
              url: result.secure_url
            });
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    throw new Error('Erreur lors de l\'upload de l\'image');
  }
};

// Upload de PDF
export const uploadPDF = async (buffer, originalName, folder = 'davybookzone/pdfs') => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: folder,
          public_id: `${Date.now()}-${originalName.replace(/\.[^/.]+$/, "")}`,
          use_filename: true
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              public_id: result.public_id,
              url: result.secure_url,
              originalName: originalName,
              size: result.bytes
            });
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    throw new Error('Erreur lors de l\'upload du PDF');
  }
};

// Supprimer un fichier
export const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    throw new Error('Erreur lors de la suppression du fichier');
  }
};

export default cloudinary;