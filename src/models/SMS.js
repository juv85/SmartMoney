// SMS model for managing mobile money SMS messages
import { getDatabase } from './index';

class SMS {
  constructor(data = {}) {
    this.id = data.id || null;
    this.sender = data.sender || '';
    this.body = data.body || '';
    this.date = data.date || new Date().toISOString();
    this.isProcessed = data.is_processed !== undefined ? data.is_processed : data.isProcessed !== undefined ? data.isProcessed : false;
    this.transactionId = data.transaction_id || data.transactionId || null;
    this.rawData = data.raw_data || data.rawData || '';
    this.createdAt = data.created_at || data.createdAt || null;
  }

  // Create a new SMS record
  static create(smsData) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const sms = new SMS(smsData);

      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO sms (sender, body, date, is_processed, transaction_id, raw_data) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [sms.sender, sms.body, sms.date, sms.isProcessed, sms.transactionId, sms.rawData],
          (_, result) => {
            sms.id = result.insertId;
            resolve(sms);
          },
          (_, error) => {
            console.error('Error creating SMS:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Find SMS by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM sms WHERE id = ?',
          [id],
          (_, result) => {
            if (result.rows.length > 0) {
              const smsData = result.rows.item(0);
              resolve(new SMS(smsData));
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Error finding SMS:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Get all SMS messages with filters
  static findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      let query = 'SELECT * FROM sms WHERE 1=1';
      const params = [];

      // Apply filters
      if (filters.sender) {
        query += ' AND sender = ?';
        params.push(filters.sender);
      }

      if (filters.isProcessed !== undefined) {
        query += ' AND is_processed = ?';
        params.push(filters.isProcessed);
      }

      if (filters.startDate) {
        query += ' AND date >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND date <= ?';
        params.push(filters.endDate);
      }

      // Add ordering and pagination
      query += ' ORDER BY date DESC';
      
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
            const smsMessages = [];
            for (let i = 0; i < result.rows.length; i++) {
              smsMessages.push(new SMS(result.rows.item(i)));
            }
            resolve(smsMessages);
          },
          (_, error) => {
            console.error('Error fetching SMS messages:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Get unprocessed SMS messages
  static getUnprocessed() {
    return SMS.findAll({ isProcessed: false });
  }

  // Get SMS messages by sender
  static getBySender(sender) {
    return SMS.findAll({ sender });
  }

  // Get recent SMS messages
  static getRecent(limit = 50) {
    return SMS.findAll({ limit });
  }

  // Update SMS
  update(updateData) {
    return new Promise((resolve, reject) => {
      if (!this.id) {
        reject(new Error('Cannot update SMS without ID'));
        return;
      }

      const db = getDatabase();
      
      // Update local properties
      Object.keys(updateData).forEach(key => {
        if (key === 'is_processed') this.isProcessed = updateData[key];
        else if (key === 'transaction_id') this.transactionId = updateData[key];
        else if (key === 'raw_data') this.rawData = updateData[key];
        else if (this.hasOwnProperty(key)) this[key] = updateData[key];
      });

      db.transaction(tx => {
        tx.executeSql(
          `UPDATE sms SET 
           sender = ?, body = ?, date = ?, is_processed = ?, 
           transaction_id = ?, raw_data = ?
           WHERE id = ?`,
          [this.sender, this.body, this.date, this.isProcessed, this.transactionId, this.rawData, this.id],
          (_, result) => {
            if (result.rowsAffected > 0) {
              resolve(this);
            } else {
              reject(new Error('SMS not found or no changes made'));
            }
          },
          (_, error) => {
            console.error('Error updating SMS:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Mark as processed
  markAsProcessed(transactionId = null) {
    return this.update({ 
      is_processed: true, 
      transaction_id: transactionId 
    });
  }

  // Delete SMS
  static delete(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM sms WHERE id = ?',
          [id],
          (_, result) => {
            resolve(result.rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error deleting SMS:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Parse SMS content to extract transaction information
  parseTransactionData() {
    const body = this.body.toLowerCase();
    const transactionData = {
      amount: null,
      type: null,
      recipient: null,
      transactionId: null,
      fees: null,
      balance: null,
      provider: this.getProvider()
    };

    // Extract amount (looking for patterns like "1000 FCFA", "1,000", etc.)
    const amountMatch = body.match(/(\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})?)\s*(?:fcfa|cfa|f)/i);
    if (amountMatch) {
      transactionData.amount = parseFloat(amountMatch[1].replace(/[,\s]/g, ''));
    }

    // Extract transaction ID
    const idMatch = body.match(/(?:id|ref|transaction|trans)[:\s]*([a-z0-9]+)/i);
    if (idMatch) {
      transactionData.transactionId = idMatch[1];
    }

    // Extract fees
    const feesMatch = body.match(/(?:frais|fees?)[:\s]*(\d+(?:\.\d{2})?)/i);
    if (feesMatch) {
      transactionData.fees = parseFloat(feesMatch[1]);
    }

    // Extract balance
    const balanceMatch = body.match(/(?:solde|balance|nouveau solde)[:\s]*(\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})?)/i);
    if (balanceMatch) {
      transactionData.balance = parseFloat(balanceMatch[1].replace(/[,\s]/g, ''));
    }

    // Determine transaction type
    if (body.includes('reçu') || body.includes('received') || body.includes('crédit')) {
      transactionData.type = 'income';
    } else if (body.includes('envoyé') || body.includes('sent') || body.includes('débit') || body.includes('retrait')) {
      transactionData.type = 'expense';
    } else if (body.includes('transfert') || body.includes('transfer')) {
      transactionData.type = 'transfer';
    }

    // Extract recipient information
    const recipientMatch = body.match(/(?:à|to|vers)\s+([a-z\s]+)(?:\s+(?:\d{8,}))?/i);
    if (recipientMatch) {
      transactionData.recipient = recipientMatch[1].trim();
    }

    // Extract phone number
    const phoneMatch = body.match(/(\d{8,})/);
    if (phoneMatch) {
      transactionData.recipientPhone = phoneMatch[1];
    }

    return transactionData;
  }

  // Get provider from sender
  getProvider() {
    const sender = this.sender.toLowerCase();
    
    if (sender.includes('orange') || sender.includes('om')) {
      return 'Orange';
    } else if (sender.includes('mtn') || sender.includes('momo')) {
      return 'MTN';
    } else if (sender.includes('moov')) {
      return 'Moov';
    } else if (sender.includes('airtel')) {
      return 'Airtel';
    }
    
    return 'Unknown';
  }

  // Check if SMS is from a mobile money provider
  isMobileMoneyMessage() {
    const sender = this.sender.toLowerCase();
    const body = this.body.toLowerCase();
    
    const providers = ['orange', 'mtn', 'moov', 'airtel', 'om', 'momo'];
    const keywords = ['fcfa', 'cfa', 'transfert', 'transfer', 'solde', 'balance', 'reçu', 'envoyé'];
    
    return providers.some(provider => sender.includes(provider)) ||
           keywords.some(keyword => body.includes(keyword));
  }

  // Auto-categorize SMS based on content
  suggestCategory() {
    const body = this.body.toLowerCase();
    
    const categoryMap = [
      { keywords: ['credit', 'recharge', 'airtime'], category: 'Achat de crédit' },
      { keywords: ['facture', 'bill', 'electricity', 'water'], category: 'Paiement facture' },
      { keywords: ['retrait', 'withdraw', 'atm'], category: 'Retrait d\'argent' },
      { keywords: ['dépôt', 'depot', 'deposit'], category: 'Dépôt d\'argent' },
      { keywords: ['frais', 'fees', 'commission'], category: 'Frais de service' },
      { keywords: ['transfert', 'transfer', 'envoyé'], category: 'Transfert d\'argent' },
      { keywords: ['reçu', 'received', 'crédit'], category: 'Réception d\'argent' }
    ];

    for (const mapping of categoryMap) {
      if (mapping.keywords.some(keyword => body.includes(keyword))) {
        return mapping.category;
      }
    }

    return 'Autre';
  }

  // Search SMS messages
  static search(searchTerm, filters = {}) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      let query = `
        SELECT * FROM sms 
        WHERE (body LIKE ? OR sender LIKE ?)
      `;
      
      const searchPattern = `%${searchTerm}%`;
      const params = [searchPattern, searchPattern];

      // Apply additional filters
      if (filters.isProcessed !== undefined) {
        query += ' AND is_processed = ?';
        params.push(filters.isProcessed);
      }

      if (filters.startDate) {
        query += ' AND date >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND date <= ?';
        params.push(filters.endDate);
      }

      query += ' ORDER BY date DESC';
      
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, result) => {
            const smsMessages = [];
            for (let i = 0; i < result.rows.length; i++) {
              smsMessages.push(new SMS(result.rows.item(i)));
            }
            resolve(smsMessages);
          },
          (_, error) => {
            console.error('Error searching SMS messages:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Get SMS statistics
  static getStatistics(filters = {}) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      let query = `
        SELECT 
          COUNT(*) as total_count,
          SUM(CASE WHEN is_processed = 1 THEN 1 ELSE 0 END) as processed_count,
          SUM(CASE WHEN is_processed = 0 THEN 1 ELSE 0 END) as unprocessed_count,
          COUNT(DISTINCT sender) as unique_senders
        FROM sms 
        WHERE 1=1
      `;
      
      const params = [];

      if (filters.startDate) {
        query += ' AND date >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND date <= ?';
        params.push(filters.endDate);
      }

      db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, result) => {
            const stats = result.rows.item(0);
            resolve({
              totalCount: stats.total_count || 0,
              processedCount: stats.processed_count || 0,
              unprocessedCount: stats.unprocessed_count || 0,
              uniqueSenders: stats.unique_senders || 0,
              processingRate: stats.total_count > 0 ? (stats.processed_count / stats.total_count * 100).toFixed(2) : 0
            });
          },
          (_, error) => {
            console.error('Error fetching SMS statistics:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Get formatted date
  getFormattedDate() {
    return new Date(this.date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get truncated body for display
  getTruncatedBody(maxLength = 100) {
    if (this.body.length <= maxLength) {
      return this.body;
    }
    return this.body.substring(0, maxLength) + '...';
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      sender: this.sender,
      body: this.body,
      date: this.date,
      isProcessed: this.isProcessed,
      transactionId: this.transactionId,
      rawData: this.rawData,
      createdAt: this.createdAt
    };
  }
}

export default SMS;
