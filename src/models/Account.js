// Account model for managing mobile money accounts
import { getDatabase } from './index';
// UUID is now imported in index.js

class Account {
  constructor(data = {}) {
    // Don't generate a new ID here, let the database handle it with AUTOINCREMENT
    this.id = data.id || null;
    this.phoneNumber = data.phone_number || data.phoneNumber || '';
    this.operatorName = data.operator_name || data.operatorName || '';
    this.currentBalance = data.current_balance || data.currentBalance || 0;
    this.createdAt = data.created_at || data.createdAt || new Date().toISOString();
    this.updatedAt = data.updated_at || data.updatedAt || new Date().toISOString();
  }

  // Create a new account
  static create(accountData) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const account = new Account(accountData);

      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO accounts (phoneNumber, operatorName, currentBalance) VALUES (?, ?, ?)',
          [account.phoneNumber, account.operatorName, account.currentBalance],
          (_, result) => {
            // Get the inserted row to ensure we have all fields
            tx.executeSql(
              'SELECT * FROM accounts WHERE rowid = ?',
              [result.insertId],
              (_, { rows }) => {
                const savedAccount = new Account(rows.item(0));
                resolve(savedAccount);
              },
              (_, error) => {
                console.error('Error fetching created account:', error);
                reject(error);
              }
            );
          },
          (_, error) => {
            console.error('Error creating account:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Find account by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM accounts WHERE id = ?',
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              const accountData = rows.item(0);
              resolve(new Account(accountData));
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Error finding account:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Find account by phone number
  static findByPhoneNumber(phoneNumber) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM accounts WHERE phone_number = ?',
          [phoneNumber],
          (_, { rows }) => {
            if (rows.length > 0) {
              const accountData = rows.item(0);
              resolve(new Account(accountData));
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Error finding account by phone number:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Get all accounts
  static findAll(activeOnly = false) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const query = activeOnly 
        ? 'SELECT * FROM accounts WHERE is_active = 1 ORDER BY created_at DESC'
        : 'SELECT * FROM accounts ORDER BY created_at DESC';

      db.transaction(tx => {
        tx.executeSql(
          query,
          [],
          (_, result) => {
            const accounts = [];
            for (let i = 0; i < result.rows.length; i++) {
              accounts.push(new Account(result.rows.item(i)));
            }
            resolve(accounts);
          },
          (_, error) => {
            console.error('Error fetching accounts:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Update account
  update(updateData) {
    return new Promise((resolve, reject) => {
      if (!this.id) {
        reject(new Error('Cannot update account without ID'));
        return;
      }

      const db = getDatabase();
      
      // Update local properties
      Object.keys(updateData).forEach(key => {
        if (key === 'phone_number') this.phoneNumber = updateData[key];
        else if (key === 'is_active') this.isActive = updateData[key];
        else if (this.hasOwnProperty(key)) this[key] = updateData[key];
      });

      db.transaction(tx => {
        tx.executeSql(
          `UPDATE accounts SET 
           name = ?, phone_number = ?, provider = ?, balance = ?, 
           currency = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [this.name, this.phoneNumber, this.provider, this.balance, this.currency, this.isActive, this.id],
          (_, result) => {
            if (result.rowsAffected > 0) {
              resolve(this);
            } else {
              reject(new Error('Account not found or no changes made'));
            }
          },
          (_, error) => {
            console.error('Error updating account:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Update balance
  updateBalance(newBalance) {
    return this.update({ balance: newBalance });
  }

  // Deactivate account
  deactivate() {
    return this.update({ is_active: false });
  }

  // Activate account
  activate() {
    return this.update({ is_active: true });
  }

  // Delete account (soft delete by deactivating)
  delete() {
    return this.deactivate();
  }

  // Hard delete account
  static hardDelete(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM accounts WHERE id = ?',
          [id],
          (_, result) => {
            resolve(result.rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error deleting account:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Get account transactions
  getTransactions(limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      db.transaction(tx => {
        tx.executeSql(
          `SELECT t.*, c.name as category_name, c.color as category_color 
           FROM transactions t 
           LEFT JOIN categories c ON t.category_id = c.id 
           WHERE t.account_id = ? 
           ORDER BY t.date DESC 
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
            console.error('Error fetching account transactions:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Get formatted phone number
  getFormattedPhoneNumber() {
    if (!this.phoneNumber) return '';
    
    // Format phone number for display (assuming West African format)
    const cleaned = this.phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`;
    }
    return this.phoneNumber;
  }

  // Get provider logo/color
  getProviderInfo() {
    const providers = {
      'Orange': { color: '#FF6600', logo: 'orange-logo' },
      'MTN': { color: '#FFCC00', logo: 'mtn-logo' },
      'Moov': { color: '#00A651', logo: 'moov-logo' },
      'Airtel': { color: '#FF0000', logo: 'airtel-logo' }
    };
    
    return providers[this.provider] || { color: '#007AFF', logo: 'default-logo' };
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      phoneNumber: this.phoneNumber,
      provider: this.provider,
      balance: this.balance,
      currency: this.currency,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default Account;
