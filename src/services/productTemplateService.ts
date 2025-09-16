import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { ProductTemplate } from '../types';

const COLLECTION_NAME = 'productTemplates';

export class ProductTemplateService {
  // Create a new product template
  static async createProductTemplate(template: Omit<ProductTemplate, 'id' | 'createdAt'>, userId: string): Promise<string> {
    try {
      const templateData = {
        ...template,
        userId,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), templateData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating product template:', error);
      throw new Error('Failed to create product template');
    }
  }

  // Update an existing product template
  static async updateProductTemplate(templateId: string, updates: Partial<ProductTemplate>, userId: string): Promise<void> {
    try {
      const templateRef = doc(db, COLLECTION_NAME, templateId);
      
      // Verify ownership
      const templateDoc = await getDoc(templateRef);
      if (!templateDoc.exists()) {
        throw new Error('Product template not found');
      }
      
      const templateData = templateDoc.data();
      if (templateData.userId !== userId) {
        throw new Error('Unauthorized: You can only update your own product templates');
      }

      // Recalculate total price if items are being updated
      let updatedData = { ...updates };
      if (updates.items) {
        updatedData.totalPrice = updates.items.reduce(
          (total, item) => total + (item.quantity * item.unitPrice), 
          0
        );
      }

      await updateDoc(templateRef, {
        ...updatedData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating product template:', error);
      throw new Error('Failed to update product template');
    }
  }

  // Get a specific product template by ID
  static async getProductTemplate(templateId: string, userId: string): Promise<ProductTemplate | null> {
    try {
      const templateRef = doc(db, COLLECTION_NAME, templateId);
      const templateDoc = await getDoc(templateRef);
      
      if (!templateDoc.exists()) {
        return null;
      }
      
      const templateData = templateDoc.data();
      
      // Verify ownership
      if (templateData.userId !== userId) {
        throw new Error('Unauthorized: You can only access your own product templates');
      }
      
      return {
        id: templateDoc.id,
        ...templateData,
        createdAt: templateData.createdAt?.toDate().toISOString() || new Date().toISOString()
      } as ProductTemplate;
    } catch (error) {
      console.error('Error getting product template:', error);
      throw new Error('Failed to get product template');
    }
  }

  // Get all product templates for a user
  static async getUserProductTemplates(userId: string): Promise<ProductTemplate[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const templates: ProductTemplate[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        templates.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          items: data.items,
          category: data.category,
          totalPrice: data.totalPrice,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        });
      });
      
      return templates;
    } catch (error) {
      console.error('Error getting user product templates:', error);
      throw new Error('Failed to get product templates');
    }
  }

  // Get product templates by category
  static async getProductTemplatesByCategory(userId: string, category: string): Promise<ProductTemplate[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const templates: ProductTemplate[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        templates.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          items: data.items,
          category: data.category,
          totalPrice: data.totalPrice,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        });
      });
      
      return templates;
    } catch (error) {
      console.error('Error getting product templates by category:', error);
      throw new Error('Failed to get product templates by category');
    }
  }

  // Delete a product template
  static async deleteProductTemplate(templateId: string, userId: string): Promise<void> {
    try {
      const templateRef = doc(db, COLLECTION_NAME, templateId);
      
      // Verify ownership
      const templateDoc = await getDoc(templateRef);
      if (!templateDoc.exists()) {
        throw new Error('Product template not found');
      }
      
      const templateData = templateDoc.data();
      if (templateData.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own product templates');
      }
      
      await deleteDoc(templateRef);
    } catch (error) {
      console.error('Error deleting product template:', error);
      throw new Error('Failed to delete product template');
    }
  }

  // Real-time listener for user product templates
  static subscribeToProductTemplates(userId: string, callback: (templates: ProductTemplate[]) => void): Unsubscribe {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const templates: ProductTemplate[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        templates.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          items: data.items,
          category: data.category,
          totalPrice: data.totalPrice,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        });
      });
      callback(templates);
    }, (error) => {
      console.error('Error in product templates subscription:', error);
    });
  }

  // Get unique categories for a user's templates
  static async getUserTemplateCategories(userId: string): Promise<string[]> {
    try {
      const templates = await this.getUserProductTemplates(userId);
      const categories = [...new Set(templates.map(template => template.category))];
      return categories.sort();
    } catch (error) {
      console.error('Error getting template categories:', error);
      throw new Error('Failed to get template categories');
    }
  }

  // Duplicate a product template
  static async duplicateProductTemplate(templateId: string, userId: string, newName?: string): Promise<string> {
    try {
      const originalTemplate = await this.getProductTemplate(templateId, userId);
      if (!originalTemplate) {
        throw new Error('Template not found');
      }

      const duplicateData = {
        ...originalTemplate,
        name: newName || `${originalTemplate.name} (Copy)`,
      };

      // Remove id and createdAt as these will be generated
      delete (duplicateData as any).id;
      delete (duplicateData as any).createdAt;

      return await this.createProductTemplate(duplicateData, userId);
    } catch (error) {
      console.error('Error duplicating product template:', error);
      throw new Error('Failed to duplicate product template');
    }
  }
}