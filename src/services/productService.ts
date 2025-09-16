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
import { Product } from '../types';

const COLLECTION_NAME = 'products';

export class ProductService {
  // Create a new product
  static async createProduct(product: Omit<Product, 'id' | 'createdAt'>, userId: string): Promise<string> {
    try {
      const productData = {
        ...product,
        userId,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), productData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  // Update an existing product
  static async updateProduct(productId: string, updates: Partial<Product>, userId: string): Promise<void> {
    try {
      const productRef = doc(db, COLLECTION_NAME, productId);
      
      // Verify ownership
      const productDoc = await getDoc(productRef);
      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }
      
      const productData = productDoc.data();
      if (productData.userId !== userId) {
        throw new Error('Unauthorized: You can only update your own products');
      }

      await updateDoc(productRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  // Get a specific product by ID
  static async getProduct(productId: string, userId: string): Promise<Product | null> {
    try {
      const productRef = doc(db, COLLECTION_NAME, productId);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        return null;
      }
      
      const productData = productDoc.data();
      
      // Verify ownership
      if (productData.userId !== userId) {
        throw new Error('Unauthorized: You can only access your own products');
      }
      
      return {
        id: productDoc.id,
        ...productData,
        createdAt: productData.createdAt?.toDate().toISOString() || new Date().toISOString()
      } as Product;
    } catch (error) {
      console.error('Error getting product:', error);
      throw new Error('Failed to get product');
    }
  }

  // Get all products for a user
  static async getUserProducts(userId: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          unitPrice: data.unitPrice,
          category: data.category,
          taxRate: data.taxRate,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error getting user products:', error);
      throw new Error('Failed to get products');
    }
  }

  // Get products by category
  static async getProductsByCategory(userId: string, category: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          unitPrice: data.unitPrice,
          category: data.category,
          taxRate: data.taxRate,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw new Error('Failed to get products by category');
    }
  }

  // Delete a product
  static async deleteProduct(productId: string, userId: string): Promise<void> {
    try {
      const productRef = doc(db, COLLECTION_NAME, productId);
      
      // Verify ownership
      const productDoc = await getDoc(productRef);
      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }
      
      const productData = productDoc.data();
      if (productData.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own products');
      }
      
      await deleteDoc(productRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  // Real-time listener for user products
  static subscribeToProducts(userId: string, callback: (products: Product[]) => void): Unsubscribe {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          unitPrice: data.unitPrice,
          category: data.category,
          taxRate: data.taxRate,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        });
      });
      callback(products);
    }, (error) => {
      console.error('Error in products subscription:', error);
    });
  }

  // Get unique categories for a user
  static async getUserProductCategories(userId: string): Promise<string[]> {
    try {
      const products = await this.getUserProducts(userId);
      const categories = [...new Set(products.map(product => product.category))];
      return categories.sort();
    } catch (error) {
      console.error('Error getting product categories:', error);
      throw new Error('Failed to get product categories');
    }
  }
}