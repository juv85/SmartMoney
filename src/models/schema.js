// Database schema definitions
export const createTables = (db) => {
  return new Promise((resolve, reject) => {
    const tables = [
      // Accounts table
      `CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone_number TEXT UNIQUE NOT NULL,
        provider TEXT NOT NULL,
        balance REAL DEFAULT 0,
        currency TEXT DEFAULT 'FCFA',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        color TEXT DEFAULT '#007AFF',
        icon TEXT,
        is_default BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Transactions table
      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        category_id INTEGER,
        amount REAL NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
        description TEXT,
        recipient_phone TEXT,
        recipient_name TEXT,
        transaction_id TEXT UNIQUE,
        fees REAL DEFAULT 0,
        status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
        sms_id INTEGER,
        date DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
        FOREIGN KEY (sms_id) REFERENCES sms (id) ON DELETE SET NULL
      )`,

      // SMS table
      `CREATE TABLE IF NOT EXISTS sms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT NOT NULL,
        body TEXT NOT NULL,
        date DATETIME NOT NULL,
        is_processed BOOLEAN DEFAULT 0,
        transaction_id INTEGER,
        raw_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE SET NULL
      )`,

      // Indexes for better performance
      `CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions (account_id)`,
      `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date)`,
      `CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type)`,
      `CREATE INDEX IF NOT EXISTS idx_sms_sender ON sms (sender)`,
      `CREATE INDEX IF NOT EXISTS idx_sms_date ON sms (date)`,
      `CREATE INDEX IF NOT EXISTS idx_sms_processed ON sms (is_processed)`
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
        await insertDefaultCategories(db);
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    executeQueries();
  });
};

// Insert default categories
const insertDefaultCategories = (db) => {
  return new Promise((resolve, reject) => {
    const defaultCategories = [
      { name: 'Transfert d\'argent', type: 'expense', color: '#FF6B6B', icon: 'send' },
      { name: 'Réception d\'argent', type: 'income', color: '#4ECDC4', icon: 'receive' },
      { name: 'Achat de crédit', type: 'expense', color: '#45B7D1', icon: 'phone' },
      { name: 'Paiement facture', type: 'expense', color: '#96CEB4', icon: 'bill' },
      { name: 'Retrait d\'argent', type: 'expense', color: '#FFEAA7', icon: 'withdraw' },
      { name: 'Dépôt d\'argent', type: 'income', color: '#DDA0DD', icon: 'deposit' },
      { name: 'Frais de service', type: 'expense', color: '#FF7675', icon: 'fee' },
      { name: 'Autre', type: 'expense', color: '#74B9FF', icon: 'other' }
    ];

    const insertCategory = (category) => {
      return new Promise((resolveInsert, rejectInsert) => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT OR IGNORE INTO categories (name, type, color, icon, is_default) VALUES (?, ?, ?, ?, 1)',
            [category.name, category.type, category.color, category.icon],
            () => resolveInsert(),
            (_, error) => rejectInsert(error)
          );
        });
      });
    };

    Promise.all(defaultCategories.map(insertCategory))
      .then(() => resolve())
      .catch(error => reject(error));
  });
};
