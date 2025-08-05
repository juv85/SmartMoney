import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './index';

/**
 * Transaction model for managing mobile money transactions
 * Schema:
 * - id: string (UUID)
 * - amount: number
 * - fees: number
 * - transactionId: string
 * - smsBody: string
 * - flux: 'in' | 'out'
 * - categoryId: string
 * - transactionDate: string (ISO)
 * - accountId: string
 * - smsId: string
 * - createdAt: string
 * - updatedAt: string
 */
export default class Transaction {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.amount = data.amount || 0;
    this.fees = data.fees || 0;
    this.transactionId = data.transaction_id || data.transactionId || '';
    this.smsBody = data.sms_body || data.smsBody || '';
    this.flux = data.flux || 'out';
    this.categoryId = data.category_id || data.categoryId || null;
    this.transactionDate = data.transaction_date || data.transactionDate || new Date().toISOString();
    this.accountId = data.account_id || data.accountId || null;
    this.smsId = data.sms_id || data.smsId || null;
    this.createdAt = data.created_at || data.createdAt || new Date().toISOString();
    this.updatedAt = data.updated_at || data.updatedAt || new Date().toISOString();
  }

  /** Create a transaction record */
  static create(data) {
    const db = getDatabase();
    const model = new Transaction(data);
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO transactions
            (id, amount, fees, transaction_id, sms_body, flux, category_id, transaction_date, account_id, sms_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            model.id,
            model.amount,
            model.fees,
            model.transactionId,
            model.smsBody,
            model.flux,
            model.categoryId,
            model.transactionDate,
            model.accountId,
            model.smsId
          ],
          () => resolve(model),
          (_, error) => reject(error)
        );
      });
    });
  }

  /** Find by primary key ID */
  static findById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM transactions WHERE id = ?',
          [id],
          (_, { rows }) => {
            if (rows.length > 0) resolve(new Transaction(rows.item(0)));
            else resolve(null);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  /** Query multiple transactions with optional filters */
  static findAll(filters = {}) {
    const db = getDatabase();
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    if (filters.accountId) { query += ' AND account_id = ?'; params.push(filters.accountId); }
    if (filters.categoryId) { query += ' AND category_id = ?'; params.push(filters.categoryId); }
    if (filters.flux) { query += ' AND flux = ?'; params.push(filters.flux); }
    if (filters.startDate) { query += ' AND transaction_date >= ?'; params.push(filters.startDate); }
    if (filters.endDate) { query += ' AND transaction_date <= ?'; params.push(filters.endDate); }
    query += ' ORDER BY transaction_date DESC';
    if (filters.limit) { query += ' LIMIT ?'; params.push(filters.limit); }

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const list = [];
            for (let i = 0; i < rows.length; i++) list.push(new Transaction(rows.item(i)));
            resolve(list);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  /** Delete by primary key ID */
  static delete(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM transactions WHERE id = ?',
          [id],
          (_, result) => resolve(result.rowsAffected > 0),
          (_, error) => reject(error)
        );
      });
    });
  }

  /** Convert model instance to JSON */
  toJSON() {
    return {
      id: this.id,
      amount: this.amount,
      fees: this.fees,
      transactionId: this.transactionId,
      smsBody: this.smsBody,
      flux: this.flux,
      categoryId: this.categoryId,
      transactionDate: this.transactionDate,
      accountId: this.accountId,
      smsId: this.smsId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
