import { createSyntheticData } from "../utils/syntheticData";

// Database schema definitions
export const createTables = (db) => {
  return new Promise((resolve, reject) => {
    const tables = [
      // Accounts table
      `CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        operator_name TEXT NOT NULL,
        current_balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK (type IN ('revenu', 'depense', 'virement')),
        color TEXT,
        icon TEXT,
        is_default INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // SMS table
      `CREATE TABLE IF NOT EXISTS sms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id INTEGER,
        address TEXT,
        date DATETIME,
        date_sent DATETIME,
        protocol INTEGER,
        read INTEGER,
        status INTEGER,
        type INTEGER,
        reply_path_present INTEGER,
        body TEXT NOT NULL,
        service_center TEXT,
        locked INTEGER,
        sub_id INTEGER,
        error_code INTEGER,
        creator TEXT,
        seen INTEGER,
        ipmsg_id TEXT,
        omeId TEXT,
        raw_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Transactions table
      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        fees REAL DEFAULT 0,
        transaction_id TEXT UNIQUE NOT NULL,
        sms_body TEXT,
        flux TEXT NOT NULL CHECK (flux IN ('in', 'out')),
        category_id TEXT,
        transaction_date DATETIME NOT NULL,
        account_id TEXT NOT NULL,
        sms_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE,
        FOREIGN KEY (sms_id) REFERENCES sms (id) ON DELETE CASCADE
      )`,

      // Indexes for better performance
      `CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions (account_id)`,
      `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (transaction_date)`,
      `CREATE INDEX IF NOT EXISTS idx_sms_address ON sms (address)`,
      `CREATE INDEX IF NOT EXISTS idx_sms_date ON sms (date_sent)`,
    ];

    // Execute all table creation queries
    const executeQueries = async () => {
      try {
        for (const query of tables) {
          await new Promise((resolveQuery, rejectQuery) => {
            db.transaction(tx => {
              tx.executeSql(
                query,
                [],
                () => resolveQuery(),
                (_, error) => {
                  console.error('Error executing query:', query, error);
                  rejectQuery(error);
                }
              );
            });
          });
        }
        
        // Insert default categories
        // await insertDefaultCategories(db);
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    createSyntheticData()

    executeQueries();
  });
};



// Insert default categories
// const insertDefaultCategories = (db) => {
//   return new Promise((resolve, reject) => {
//     const defaultCategories = [
//       { name: 'phone_credit', type: 'depense' },
//       { name: 'incoming_transfer', type: 'revenu' },
//       { name: 'outgoing_transfer', type: 'depense' },
//       { name: 'withdrawal', type: 'virement' },
//       { name: 'deposit', type: 'virement' }
//     ];

//     const insertCategory = (category) => {
//       return new Promise((resolveInsert, rejectInsert) => {
//         db.transaction(tx => {
//           tx.executeSql(
//             'INSERT OR IGNORE INTO categories (name, type, color, icon, is_default) VALUES (?, ?, ?, ?, 1)',
//             [category.name, category.type, category.color, category.icon],
//             () => resolveInsert(),
//             (_, error) => rejectInsert(error)
//           );
//         });
//       });
//     };

//     Promise.all(defaultCategories.map(insertCategory))
//       .then(() => resolve())
//       .catch(error => reject(error));
//   });
// };
