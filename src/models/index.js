// Database initialization and exports
import { openDatabase } from 'react-native-sqlite-storage';
import { createTables } from './schema';

// Database configuration
const DATABASE_NAME = 'SmartMoney.db';
const DATABASE_VERSION = '1.0';
const DATABASE_DISPLAYNAME = 'SmartMoney Database';
const DATABASE_SIZE = 200000;

// Initialize database
let db = null;

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = openDatabase(
      DATABASE_NAME,
      DATABASE_VERSION,
      DATABASE_DISPLAYNAME,
      DATABASE_SIZE,
      () => {
        console.log('Database opened successfully');
        createTables(db)
          .then(() => {
            console.log('Tables created successfully');
            resolve(db);
          })
          .catch(error => {
            console.error('Error creating tables:', error);
            reject(error);
          });
      },
      error => {
        console.error('Error opening database:', error);
        reject(error);
      }
    );
  });
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// Export models
export { default as Account } from './Account';
export { default as Category } from './Category';
export { default as Transaction } from './Transaction';
export { default as SMS } from './SMS';
