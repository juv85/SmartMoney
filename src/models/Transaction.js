// Transaction model for managing mobile money transactions
import { getDatabase } from './index';

class Transaction {
  constructor(data = {}) {
    this.id = data.id || null;
    this.accountId = data.account_id || data.accountId || null;
    this.categoryId = data.category_id || data.categoryId || null;
    this.amount = data.amount || 0;
    this.type = data.type || 'expense'; // 'income', 'expense', 'transfer'
    this.description = data.description || '';
    this.recipientPhone = data.recipient_phone || data.recipientPhone || '';
    this.recipientName = data.recipient_name || data.recipientName || '';
    this.transactionId = data.transaction_id || data.transactionId || '';
    this.fees = data.fees || 0;
    this.status = data.status || 'completed'; // 'pending', 'completed', 'failed'
    this.smsId = data.sms_id || data.smsId || null;
    this.date = data.date || new Date().toISOString();
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;
  }

  // Create a new transaction
  static create(transactionData) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const transaction = new Transaction(transactionData);

      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO transactions (
            account_id, category_id, amount, type, description, 
            recipient_phone, recipient_name, transaction_id, fees, 
            status, sms_id, date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            transaction.accountId, transaction.categoryId, transaction.amount,
            transaction.type, transaction.description, transaction.recipientPhone,
            transaction.recipientName, transaction.transactionId, transaction.fees,
            transaction.status, transaction.smsId, transaction.date
          ],
          (_, result) => {
            transaction.id = result.insertId;
            resolve(transaction);
          },
          (_, error) => {
            console.error('Error creating transaction:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Find transaction by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      db.transaction(tx => {
        tx.executeSql(
          `SELECT t.*, a.name as account_name, a.phone_number, 
           c.name as category_name, c.color as category_color, c.icon as category_icon
           FROM transactions t
           LEFT JOIN accounts a ON t.account_id = a.id
           LEFT JOIN categories c ON t.category_id = c.id
           WHERE t.id = ?`,
          [id],
          (_, result) => {
            if (result.rows.length > 0) {
              const transactionData = result.rows.item(0);
              resolve(new Transaction(transactionData));
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Error finding transaction:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Find transaction by transaction ID
  static findByTransactionId(transactionId) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM transactions WHERE transaction_id = ?',
          [transactionId],
          (_, result) => {
            if (result.rows.length > 0) {
              const transactionData = result.rows.item(0);
              resolve(new Transaction(transactionData));
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Error finding transaction by transaction ID:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Get all transactions with filters
  static findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      let query = `
        SELECT t.*, a.name as account_name, a.phone_number,
        c.name as category_name, c.color as category_color, c.icon as category_icon
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE 1=1
      `;
      
      const params = [];

      // Apply filters
      if (filters.accountId) {
        query += ' AND t.account_id = ?';
        params.push(filters.accountId);
      }

      if (filters.categoryId) {
        query += ' AND t.category_id = ?';
        params.push(filters.categoryId);
      }

      if (filters.type) {
        query += ' AND t.type = ?';
        params.push(filters.type);
      }

      if (filters.status) {
        query += ' AND t.status = ?';
        params.push(filters.status);
      }

      if (filters.startDate) {
        query += ' AND t.date >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND t.date <= ?';
        params.push(filters.endDate);
      }

      if (filters.minAmount) {
        query += ' AND t.amount >= ?';
        params.push(filters.minAmount);
      }

      if (filters.maxAmount) {
        query += ' AND t.amount <= ?';
        params.push(filters.maxAmount);
      }

      // Add ordering and pagination
      query += ' ORDER BY t.date DESC';
      
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
        
        if (filters.offset) {
          query += ' OFFSET ?';
          params.push(filters.offset);
        }
      }

      db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, result) => {
            const transactions = [];
            for (let i = 0; i < result.rows.length; i++) {
              transactions.push(new Transaction(result.rows.item(i)));
            }
            resolve(transactions);
          },
          (_, error) => {
            console.error('Error fetching transactions:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Get recent transactions
  static getRecent(limit = 10) {
    return Transaction.findAll({ limit, status: 'completed' });
  }

  // Get transactions by date range
  static getByDateRange(startDate, endDate, accountId = null) {
    const filters = { startDate, endDate };
    if (accountId) filters.accountId = accountId;
    return Transaction.findAll(filters);
  }

  // Update transaction
  update(updateData) {
    return new Promise((resolve, reject) => {
      if (!this.id) {
        reject(new Error('Cannot update transaction without ID'));
        return;
      }

      const db = getDatabase();
      
      // Update local properties
      Object.keys(updateData).forEach(key => {
        if (key === 'account_id') this.accountId = updateData[key];
        else if (key === 'category_id') this.categoryId = updateData[key];
        else if (key === 'recipient_phone') this.recipientPhone = updateData[key];
        else if (key === 'recipient_name') this.recipientName = updateData[key];
        else if (key === 'transaction_id') this.transactionId = updateData[key];
        else if (key === 'sms_id') this.smsId = updateData[key];
        else if (this.hasOwnProperty(key)) this[key] = updateData[key];
      });

      db.transaction(tx => {
        tx.executeSql(
          `UPDATE transactions SET 
           account_id = ?, category_id = ?, amount = ?, type = ?, description = ?,
           recipient_phone = ?, recipient_name = ?, transaction_id = ?, fees = ?,
           status = ?, sms_id = ?, date = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            this.accountId, this.categoryId, this.amount, this.type, this.description,
            this.recipientPhone, this.recipientName, this.transactionId, this.fees,
            this.status, this.smsId, this.date, this.id
          ],
          (_, result) => {
            if (result.rowsAffected > 0) {
              resolve(this);
            } else {
              reject(new Error('Transaction not found or no changes made'));
            }
          },
          (_, error) => {
            console.error('Error updating transaction:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Update status
  updateStatus(status) {
    return this.update({ status });
  }

  // Update category
  updateCategory(categoryId) {
    return this.update({ category_id: categoryId });
  }

  // Delete transaction
  static delete(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM transactions WHERE id = ?',
          [id],
          (_, result) => {
            resolve(result.rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error deleting transaction:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Get transaction statistics
  static getStatistics(filters = {}) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      let query = `
        SELECT 
          type,
          COUNT(*) as count,
          SUM(amount) as total_amount,
          AVG(amount) as average_amount
        FROM transactions 
        WHERE status = 'completed'
      `;
      
      const params = [];

      if (filters.accountId) {
        query += ' AND account_id = ?';
        params.push(filters.accountId);
      }

      if (filters.startDate) {
        query += ' AND date >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND date <= ?';
        params.push(filters.endDate);
      }

      query += ' GROUP BY type';

      db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, result) => {
            const stats = {
              income: { count: 0, total: 0, average: 0 },
              expense: { count: 0, total: 0, average: 0 },
              transfer: { count: 0, total: 0, average: 0 }
            };

            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              stats[row.type] = {
                count: row.count,
                total: row.total_amount,
                average: row.average_amount
              };
            }

            resolve(stats);
          },
          (_, error) => {
            console.error('Error fetching transaction statistics:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Search transactions
  static search(searchTerm, filters = {}) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      let query = `
        SELECT t.*, a.name as account_name, a.phone_number,
        c.name as category_name, c.color as category_color, c.icon as category_icon
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE (
          t.description LIKE ? OR 
          t.recipient_name LIKE ? OR 
          t.recipient_phone LIKE ? OR
          t.transaction_id LIKE ?
        )
      `;
      
      const searchPattern = `%${searchTerm}%`;
      const params = [searchPattern, searchPattern, searchPattern, searchPattern];

      // Apply additional filters
      if (filters.accountId) {
        query += ' AND t.account_id = ?';
        params.push(filters.accountId);
      }

      if (filters.type) {
        query += ' AND t.type = ?';
        params.push(filters.type);
      }

      query += ' ORDER BY t.date DESC';
      
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, result) => {
            const transactions = [];
            for (let i = 0; i < result.rows.length; i++) {
              transactions.push(new Transaction(result.rows.item(i)));
            }
            resolve(transactions);
          },
          (_, error) => {
            console.error('Error searching transactions:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Get formatted amount
  getFormattedAmount() {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(this.amount).replace('XOF', 'FCFA');
  }

  // Get formatted date
  getFormattedDate() {
    return new Date(this.date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get transaction direction for display
  getDirection() {
    switch (this.type) {
      case 'income':
        return 'Entrant';
      case 'expense':
        return 'Sortant';
      case 'transfer':
        return 'Transfert';
      default:
        return 'Inconnu';
    }
  }

  // Check if transaction is recent (within last 24 hours)
  isRecent() {
    const now = new Date();
    const transactionDate = new Date(this.date);
    const diffInHours = (now - transactionDate) / (1000 * 60 * 60);
    return diffInHours <= 24;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      accountId: this.accountId,
      categoryId: this.categoryId,
      amount: this.amount,
      type: this.type,
      description: this.description,
      recipientPhone: this.recipientPhone,
      recipientName: this.recipientName,
      transactionId: this.transactionId,
      fees: this.fees,
      status: this.status,
      smsId: this.smsId,
      date: this.date,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default Transaction;
