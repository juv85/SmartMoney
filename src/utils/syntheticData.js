// Synthetic data generator for testing models
import { Account, Category, Transaction, SMS } from '../models';

export const createSyntheticData = async () => {
  try {
    console.log('🚀 Creating synthetic data...');

    // Create test accounts
    const accounts = await createTestAccounts();
    console.log('✅ Created accounts:', accounts.length);

    // Categories are created automatically in schema.js, so let's fetch them
    const categories = await Category.findAll();
    console.log('✅ Found categories:', categories.length);

    // Create test transactions
    const transactions = await createTestTransactions(accounts, categories);
    console.log('✅ Created transactions:', transactions.length);

    // Create test SMS messages
    const smsMessages = await createTestSMS();
    console.log('✅ Created SMS messages:', smsMessages.length);

    console.log('🎉 Synthetic data creation completed!');
    return {
      accounts,
      categories,
      transactions,
      smsMessages
    };
  } catch (error) {
    console.error('❌ Error creating synthetic data:', error);
    throw error;
  }
};

const createTestAccounts = async () => {
  const accountsData = [
    {
      name: 'Orange Money Principal',
      phoneNumber: '+237694385414',
      provider: 'Orange',
      balance: 125000,
      currency: 'FCFA'
    },
    {
      name: 'MTN Mobile Money',
      phoneNumber: '+237652385414',
      provider: 'MTN',
      balance: 85000,
      currency: 'FCFA'
    },
  ];

  const accounts = [];
  for (const accountData of accountsData) {
    try {
      // Check if account already exists
      const existing = await Account.findByPhoneNumber(accountData.phoneNumber);
      if (!existing) {
        const account = await Account.create(accountData);
        accounts.push(account);
      } else {
        accounts.push(existing);
      }
    } catch (error) {
      console.error('Error creating account:', error);
    }
  }

  return accounts;
};

const createTestTransactions = async (accounts, categories) => {
  const transactions = [];
  const now = new Date();

  // Helper function to get random date within last 30 days
  const getRandomDate = (daysBack = 30) => {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    return date.toISOString();
  };

  // Helper function to get random category by type
  const getRandomCategory = (type) => {
    const filtered = categories.filter(cat => cat.type === type);
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  const transactionTemplates = [
    // Income transactions
    {
      type: 'income',
      amounts: [25000, 50000, 75000, 100000, 15000],
      descriptions: [
        'Réception d\'argent de Papa',
        'Salaire mensuel',
        'Vente de produits',
        'Remboursement dette',
        'Cadeau anniversaire'
      ],
      senders: ['Papa', 'Employeur', 'Client', 'Ami', 'Famille']
    },
    // Expense transactions
    {
      type: 'expense',
      amounts: [5000, 10000, 15000, 25000, 3000, 8000],
      descriptions: [
        'Achat crédit téléphone',
        'Transfert à Maman',
        'Paiement facture électricité',
        'Retrait d\'argent',
        'Frais de service',
        'Achat nourriture'
      ],
      recipients: ['Maman', 'Orange', 'EDG', 'ATM', 'Service', 'Marché']
    }
  ];

  // Create transactions for each account
  for (const account of accounts) {
    // Create 15-25 transactions per account
    const numTransactions = 15 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < numTransactions; i++) {
      const isIncome = Math.random() > 0.6; // 40% income, 60% expense
      const template = transactionTemplates[isIncome ? 0 : 1];
      const category = getRandomCategory(template.type);
      
      const amount = template.amounts[Math.floor(Math.random() * template.amounts.length)];
      const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
      
      const transactionData = {
        accountId: account.id,
        categoryId: category ? category.id : null,
        amount: amount,
        type: template.type,
        description: description,
        fees: template.type === 'expense' ? Math.floor(amount * 0.01) : 0, // 1% fees for expenses
        status: Math.random() > 0.05 ? 'completed' : 'pending', // 95% completed
        date: getRandomDate(),
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
      };

      if (template.type === 'expense' && template.recipients) {
        transactionData.recipientName = template.recipients[Math.floor(Math.random() * template.recipients.length)];
        transactionData.recipientPhone = `7${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      } else if (template.type === 'income' && template.senders) {
        transactionData.recipientName = template.senders[Math.floor(Math.random() * template.senders.length)];
      }

      try {
        const transaction = await Transaction.create(transactionData);
        transactions.push(transaction);
      } catch (error) {
        console.error('Error creating transaction:', error);
      }
    }
  }

  return transactions;
};

const createTestSMS = async () => {
  const smsMessages = [];
  const now = new Date();

  const smsTemplates = [
    {
      sender: 'Orange',
      bodies: [
        'Vous avez reçu 25000 FCFA. Nouveau solde: 125000 FCFA. Frais: 0 FCFA. ID: TXN123456',
        'Transfert de 15000 FCFA vers 77654321 effectué. Nouveau solde: 110000 FCFA. Frais: 150 FCFA. ID: TXN789012',
        'Achat de crédit 5000 FCFA réussi. Nouveau solde: 105000 FCFA. ID: TXN345678'
      ]
    },
    {
      sender: 'MTN',
      bodies: [
        'Vous avez envoyé 20000. Solde: 65000 FCFA. Frais: 200 FCFA. Ref: MTN987654',
        'Réception de 50000 FCFA. Nouveau solde: 115000 FCFA. De: 70123456. Ref: MTN456789',
        'Retrait de 10000 FCFA effectué. Solde: 105000 FCFA. Frais: 100 FCFA. Ref: MTN111222'
      ]
    },
  ];

  for (const template of smsTemplates) {
    for (let i = 0; i < template.bodies.length; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 15));
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));

      const smsData = {
        sender: template.sender,
        body: template.bodies[i],
        date: date.toISOString(),
        isProcessed: Math.random() > 0.3, // 70% processed
        rawData: JSON.stringify({ template: template.sender, index: i })
      };

      try {
        const sms = await SMS.create(smsData);
        smsMessages.push(sms);
      } catch (error) {
        console.error('Error creating SMS:', error);
      }
    }
  }

  return smsMessages;
};

// Test individual model functions
export const testModelFunctions = async () => {
  console.log('🧪 Testing model functions...');

  try {
    // Test Account functions
    console.log('\n📱 Testing Account model:');
    const accounts = await Account.findAll();
    console.log(`- Found ${accounts.length} accounts`);
    
    if (accounts.length > 0) {
      const account = accounts[0];
      console.log(`- Account: ${account.name} (${account.getFormattedPhoneNumber()})`);
      console.log(`- Provider info:`, account.getProviderInfo());
      
      const accountTransactions = await account.getTransactions(5);
      console.log(`- Account has ${accountTransactions.length} recent transactions`);
    }

    // Test Category functions
    console.log('\n📂 Testing Category model:');
    const categories = await Category.findAll();
    console.log(`- Found ${categories.length} categories`);
    
    const incomeCategories = await Category.getIncomeCategories();
    const expenseCategories = await Category.getExpenseCategories();
    console.log(`- Income categories: ${incomeCategories.length}`);
    console.log(`- Expense categories: ${expenseCategories.length}`);

    // Test Transaction functions
    console.log('\n💰 Testing Transaction model:');
    const recentTransactions = await Transaction.getRecent(10);
    console.log(`- Found ${recentTransactions.length} recent transactions`);
    
    const stats = await Transaction.getStatistics();
    console.log('- Transaction statistics:', stats);

    // Test SMS functions
    console.log('\n📨 Testing SMS model:');
    const smsMessages = await SMS.findAll({ limit: 5 });
    console.log(`- Found ${smsMessages.length} SMS messages`);
    
    const unprocessedSMS = await SMS.getUnprocessed();
    console.log(`- Unprocessed SMS: ${unprocessedSMS.length}`);

    if (smsMessages.length > 0) {
      const sms = smsMessages[0];
      console.log(`- SMS from ${sms.sender}: ${sms.getTruncatedBody(50)}`);
      console.log(`- Is mobile money message: ${sms.isMobileMoneyMessage()}`);
      console.log(`- Parsed data:`, sms.parseTransactionData());
    }

    console.log('\n✅ Model testing completed!');
  } catch (error) {
    console.error('❌ Error testing models:', error);
  }
};

// Clear all data (for testing purposes)
export const clearAllData = async () => {
  try {
    console.log('🗑️ Clearing all data...');
    
    // Note: This would require additional methods in models
    // For now, we'll just log the intent
    console.log('⚠️ Clear data functionality would need additional model methods');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};
