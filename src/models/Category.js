// Category model for transaction categorization
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './index';

class Category {
  constructor(data = {}) {
    this.id = data.id || null;
    // this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.type = data.type || 'depense'; // 'revenu', 'depense', or 'virement'
    this.createdAt = data.created_at || data.createdAt || new Date().toISOString();
    this.updatedAt = data.updated_at || data.updatedAt || new Date().toISOString();
  }

  // Create a new category
  static create(categoryData) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const category = new Category(categoryData);

      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO categories (name, type) 
           VALUES (?, ?)`,
          [category.name, category.type],
          (_, result) => {
            category.id = result.insertId;
            resolve(category);
          },
          (_, error) => {
            console.error('Error creating category:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Find category by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM categories WHERE id = ?',
          [id],
          (_, result) => {
            if (result.rows.length > 0) {
              const categoryData = result.rows.item(0);
              resolve(new Category(categoryData));
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Error finding category:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Find category by name
  static findByName(name) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM categories WHERE name = ?',
          [name],
          (_, result) => {
            if (result.rows.length > 0) {
              const categoryData = result.rows.item(0);
              resolve(new Category(categoryData));
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Error finding category by name:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Get all categories
  static findAll(type = null) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      let query = 'SELECT * FROM categories ORDER BY name ASC';
      let params = [];

      if (type) {
        query = 'SELECT * FROM categories WHERE type = ? ORDER BY name ASC';
        params = [type];
      }

      db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, result) => {
            const categories = [];
            if (result.rows.length > 0) {
              for (let i = 0; i < result.rows.length; i++) {
                categories.push(new Category(result.rows.item(i)));
              }
            }
            resolve(categories);
          },
          (_, error) => {
            console.error('Error fetching categories:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Get income categories
  static getIncomeCategories() {
    return Category.findAll('income');
  }

  // Get expense categories
  static getExpenseCategories() {
    return Category.findAll('expense');
  }

  // Get default categories
  static getDefaultCategories() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM categories WHERE is_default = 1 ORDER BY name ASC',
          [],
          (_, result) => {
            const categories = [];
            for (let i = 0; i < result.rows.length; i++) {
              categories.push(new Category(result.rows.item(i)));
            }
            resolve(categories);
          },
          (_, error) => {
            console.error('Error fetching default categories:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Update category
  update(updateData) {
    return new Promise((resolve, reject) => {
      if (!this.id) {
        reject(new Error('Cannot update category without ID'));
        return;
      }

      const db = getDatabase();
      
      // Update local properties
      Object.keys(updateData).forEach(key => {
        if (key === 'is_default') this.isDefault = updateData[key];
        else if (this.hasOwnProperty(key)) this[key] = updateData[key];
      });

      db.transaction(tx => {
        tx.executeSql(
          `UPDATE categories SET 
           name = ?, type = ?, color = ?, icon = ?, is_default = ?
           WHERE id = ?`,
          [this.name, this.type, this.color, this.icon, this.isDefault, this.id],
          (_, result) => {
            if (result.rowsAffected > 0) {
              resolve(this);
            } else {
              reject(new Error('Category not found or no changes made'));
            }
          },
          (_, error) => {
            console.error('Error updating category:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Delete category
  static delete(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      // First check if category is being used by any transactions
      db.transaction(tx => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
          [id],
          (_, result) => {
            const count = result.rows.item(0).count;
            if (count > 0) {
              reject(new Error('Cannot delete category that is being used by transactions'));
              return;
            }

            // Safe to delete
            tx.executeSql(
              'DELETE FROM categories WHERE id = ? AND is_default = 0',
              [id],
              (_, deleteResult) => {
                if (deleteResult.rowsAffected > 0) {
                  resolve(true);
                } else {
                  reject(new Error('Category not found or is a default category'));
                }
              },
              (_, error) => {
                console.error('Error deleting category:', error);
                reject(error);
              }
            );
          },
          (_, error) => {
            console.error('Error checking category usage:', error);
            reject(error);
          }
        );
      });
    });
  }

  getTransactions(limit = 50, offset = 0) {
    console.log('id cat: ', this.id)
    return new Promise((resolve, reject) => {
      const db = getDatabase(); // Ensure this function provides your SQLite DB instance
  
      db.transaction(tx => {
        tx.executeSql(
          `SELECT
             t.*,
             a.phone_number as account_phone_number,
             a.operator_name as account_operator_name
           FROM
             transactions t
           LEFT JOIN
             accounts a ON t.account_id = a.id
           WHERE
             t.category_id = ?
           ORDER BY
             t.transaction_date DESC
           LIMIT ? OFFSET ?`,
          [this.id, limit, offset],
          (_, result) => {
            const transactions = [];
            for (let i = 0; i < result.rows.length; i++) {
              transactions.push(result.rows.item(i));
            }
            resolve(transactions);
          },
          (_, error) => {
            console.error('Error fetching category transactions:', error);
            reject(error);
            return true; // Indicate that the error was handled
          }
        );
      });
    });
  }

  // Get category statistics
  getStatistics(startDate = null, endDate = null) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      let query = `
        SELECT 
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount,
          AVG(amount) as average_amount,
          MIN(amount) as min_amount,
          MAX(amount) as max_amount
        FROM transactions 
        WHERE category_id = ?
      `;
      
      let params = [this.id];

      if (startDate && endDate) {
        query += ' AND date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, result) => {
            const stats = result.rows.item(0);
            resolve({
              transactionCount: stats.transaction_count || 0,
              totalAmount: stats.total_amount || 0,
              averageAmount: stats.average_amount || 0,
              minAmount: stats.min_amount || 0,
              maxAmount: stats.max_amount || 0
            });
          },
          (_, error) => {
            console.error('Error fetching category statistics:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Auto-categorize based on transaction description or recipient
  static suggestCategory(transactionData) {
    const { description = '', recipient_name = '', amount, type } = transactionData;
    const text = `${description} ${recipient_name}`.toLowerCase();

    // Define categorization rules
    const rules = [
      { keywords: ['credit', 'recharge', 'airtime'], category: 'Achat de crédit' },
      { keywords: ['bill', 'facture', 'electricity', 'water', 'internet'], category: 'Paiement facture' },
      { keywords: ['withdraw', 'retrait', 'atm'], category: 'Retrait d\'argent' },
      { keywords: ['deposit', 'dépôt', 'depot'], category: 'Dépôt d\'argent' },
      { keywords: ['fee', 'frais', 'commission'], category: 'Frais de service' },
      { keywords: ['transfer', 'send', 'envoi'], category: type === 'income' ? 'Réception d\'argent' : 'Transfert d\'argent' }
    ];

    for (const rule of rules) {
      if (rule.keywords.some(keyword => text.includes(keyword))) {
        return Category.findByName(rule.category);
      }
    }

    // Default categorization based on transaction type
    return Category.findByName(type === 'income' ? 'Réception d\'argent' : 'Autre');
  }

  // Get icon component name or emoji
  getIconDisplay() {
    const iconMap = {
      'send': '📤',
      'receive': '📥',
      'phone': '📱',
      'bill': '🧾',
      'withdraw': '🏧',
      'deposit': '💰',
      'fee': '💸',
      'other': '📋'
    };
    
    return iconMap[this.icon] || iconMap['other'];
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      color: this.color,
      icon: this.icon,
      isDefault: this.isDefault,
      createdAt: this.createdAt
    };
  }
}

export default Category;
