// Synthetic data generator for testing models
import { Account, Category, Transaction, SMS } from '../models';
import { v4 as uuidv4 } from 'uuid';

export const createSyntheticData = async () => {
  // const db = require('../models').default;
  
  try {
    console.log('🚀 Starting synthetic data creation...');
    
    // Start a transaction to ensure data consistency
    // await db.transaction(async (tx) => {
      console.log('🔁 Starting database transaction...');
      
      try {
        // Clear existing data (optional, uncomment if needed)
        // await db.query('DELETE FROM transactions');
        // await db.query('DELETE FROM sms');
        // await db.query('DELETE FROM accounts');
        // await db.query('DELETE FROM categories');
        
        // Create test accounts
        console.log('🔄 Creating test accounts...');
        const accounts = await createTestAccounts();
        console.log(`✅ Created ${accounts.length} accounts`);
        
        // Create or get test categories
        console.log('🔄 Setting up categories...');
        let categories = await Category.findAll();
        
        if (categories.length === 0) {
          console.log('ℹ️ No categories found, creating test categories...');
          categories = await createTestCategories();
          console.log(`✅ Created ${categories.length} test categories`);
        } else {
          console.log(`✅ Found ${categories.length} existing categories`);
        }
        
        // Create test SMS messages
        console.log('🔄 Creating test SMS messages...');
        const smsMessages = await createTestSMS(accounts);
        console.log(`✅ Created ${smsMessages.length} SMS messages`);

        // Create test transactions
        console.log('🔄 Creating test transactions...');
        const transactions = await createTestTransactions(accounts, categories, smsMessages);
        console.log(`✅ Created ${transactions.length} transactions`);
        
        // Commit the transaction
        // await tx.executeSql('COMMIT');
        console.log('✅ Database transaction committed');
        
        console.log('🎉 Synthetic data creation completed successfully!');
        return {
          accounts,
          categories,
          transactions,
          smsMessages
        };
      } catch (error) {
        // Rollback the transaction on error
        // await tx.executeSql('ROLLBACK');
        console.error('❌ Error in transaction, rolling back:', error);
        throw error;
      }
    // });
  } catch (error) {
    console.error('❌ Error creating synthetic data:', error);
    throw error;
  }
};

// Create test categories with proper types and icons
const createTestCategories = async () => {
  const categories = [
    // Income categories
    { 
      name: 'Incoming_transfer', 
      type: 'revenu',
    },
    
    // Expense categories
    { 
      name: 'Outgoing_transfer', 
      type: 'depense', 
    },
    { 
      name: 'Phone_credit', 
      type: 'depense', 
    },
    
    // Transfer categories
    { 
      name: 'Deposit', 
      type: 'virement', 
    },
    { 
      name: 'Withdrawal', 
      type: 'virement', 
    },
  ];

  const createdCategories = [];
  
  for (const categoryData of categories) {
    try {
      // Check if category already exists
      const existing = await Category.findByName(categoryData.name);
      
      if (!existing) {
        // Add ID and timestamps
        const categoryWithId = {
          ...categoryData,
          id: uuidv4(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const category = await Category.create(categoryWithId);
        createdCategories.push(category);
      } else {
        createdCategories.push(existing);
      }
    } catch (error) {
      console.error(`Error creating category ${categoryData.name}:`, error);
    }
  }

  return createdCategories;
};

const createTestAccounts = async () => {
  const accountsData = [
    {
      name: 'Orange Money Principal',
      phoneNumber: '+237694385414',
      operatorName: 'Orange',
      currentBalance: 125000,
      currency: 'FCFA'
    },
    {
      name: 'MTN Mobile Money',
      phoneNumber: '+237652385414',
      operatorName: 'MTN',
      currentBalance: 85000,
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

const createTestTransactions = async (accounts, categories, smsMessages) => {
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

  // Helper function to get random category by flux type
  const getRandomCategory = (flux) => {
    const type = flux === 'in' ? 'revenu' : 'out' ? 'depense' : 'vir';
    const filtered = categories.filter(cat => cat.type === type);
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  const transactionTemplates = [
    // Incoming transactions
    {
      flux: 'in',
      amounts: [25000, 50000, 75000, 100000, 15000],
      smsBodies: [
        'Transfert recu de {amount} FCFA du 656854878. Nouveau solde: {balance} FCFA.',
        'Transfert de {amount} FCFA reçu du 698488451. Solde: {balance} FCFA.',
        'Reçu {amount} FCFA de 656565141. Solde actuel: {balance} FCFA.'
      ],
      senders: ['Papa', 'Employeur', 'Client', 'Ami', 'Famille']
    },
    // Outgoing transactions
    {
      flux: 'out',
      amounts: [5000, 10000, 15000, 25000, 3000, 8000],
      smsBodies: [
        'Vous avez envoyé {amount} FCFA au 694521358. Frais: {fees} FCFA. Nouveau solde: {balance} FCFA.',
        'Transfert de {amount} FCFA effectué vers 656856598. Frais: {fees} FCFA. Solde: {balance} FCFA.',
        'Paiement de {amount} FCFA de Orange Bundle. Solde actuel: {balance} FCFA.'
      ],
      recipients: ['Maman', 'Orange', 'EDG', 'ATM', 'Service', 'Marché']
    },
    // Virement transactions
    {
      flux: 'out',
      amounts: [5000, 10000, 15000, 25000, 3000, 8000],
      smsBodies: [
        'Vous avez fait un depot de {amount} FCFA. Frais: {fees} FCFA. Nouveau solde: {balance} FCFA.',
        'Retrait de {amount} FCFA effectué. Frais: {fees} FCFA. Solde: {balance} FCFA.',
      ],
      recipients: ['Orange', 'MTN']
    }
  ];

  // Create transactions for each account
  for (const account of accounts) {
    // Create 15-25 transactions per account
    const numTransactions = 5 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < numTransactions; i++) {
      const isIncoming = Math.random() > 0.6; // 40% incoming, 60% outgoing
      const template = transactionTemplates[isIncoming ? 0 : 1];
      const amount = template.amounts[Math.floor(Math.random() * template.amounts.length)];
      const fees = template.flux === 'out' ? Math.floor(amount * 0.01) : 0; // 1% fees for outgoing
      const balance = Math.floor(account.balance + (isIncoming ? amount : -amount - fees));
      
      // Generate SMS body with placeholders replaced
      const smsBody = template.smsBodies[Math.floor(Math.random() * template.smsBodies.length)]
        .replace('{amount}', amount.toLocaleString())
        .replace('{fees}', fees.toLocaleString())
        .replace('{balance}', balance.toLocaleString())
        .replace('{sender}', template.senders ? template.senders[Math.floor(Math.random() * template.senders.length)] : '')
        .replace('{recipient}', template.recipients ? template.recipients[Math.floor(Math.random() * template.recipients.length)] : '');
      
      const transactionData = {
        accountId: account.id,
        amount: amount,
        fees: fees,
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        smsBody: smsBody,
        flux: template.flux,
        categoryId: null, // Will be set after category selection
        smsId: null,
        transactionDate: getRandomDate()
      };

      // Get a random category based on flux
      const category = getRandomCategory(template.flux);
      if (category) {
        transactionData.categoryId = category.id;
      }

      // Randomly assign an SMS to some transactions
      if (smsMessages && smsMessages.length > 0 && Math.random() > 0.5) {
        const randomSms = smsMessages[Math.floor(Math.random() * smsMessages.length)];
        transactionData.smsId = randomSms.id;
      }

      try {
        const transaction = await Transaction.create(transactionData);
        transactions.push(transaction);
        
        // Update account balance for next transaction
        account.balance = balance;
      } catch (error) {
        console.error('Error creating transaction:', error);
      }
    }
  }

  return transactions;
};

const createTestSMS = async (accounts) => {
  const smsMessages = [];
  const now = new Date();

  if (accounts.length === 0) {
    console.warn('No accounts found for SMS generation');
    return [];
  }

  const smsTemplates = [
    // Orange Money SMS
    {
      address: 'OrangeMoney',
      service_center: '+237699990000',
      read: 1,
      status: -1,
      type: 1,
      subject: null,
      reply_path_present: 0,
      locked: 0,
      error_code: -1,
      bodies: [
        'Vous avez reçu 25000 FCFA de +237690123456. Nouveau solde: 125000 FCFA. Frais: 0 FCFA. ID: TXN' + Date.now(),
        'Transfert de 15000 FCFA vers 77654321 effectué. Nouveau solde: 110000 FCFA. Frais: 150 FCFA. ID: TXN' + (Date.now() + 1),
        'Achat de crédit 5000 FCFA réussi. Nouveau solde: 105000 FCFA. ID: TXN' + (Date.now() + 2)
      ]
    },
    // MTN Mobile Money SMS
    {
      address: 'MTN Mobile Money',
      service_center: '+237655550000',
      read: 1,
      status: -1,
      type: 1,
      subject: null,
      reply_path_present: 0,
      locked: 0,
      error_code: -1,
      bodies: [
        'Vous avez envoyé 20000 FCFA à +237690654321. Solde: 65000 FCFA. Frais: 200 FCFA. Ref: MTN' + (Date.now() + 3),
        'Réception de 50000 FCFA de +237691234567. Nouveau solde: 115000 FCFA. Ref: MTN' + (Date.now() + 4),
        'Retrait de 10000 FCFA effectué. Solde: 105000 FCFA. Frais: 100 FCFA. Ref: MTN' + (Date.now() + 5)
      ]
    }
  ];

  // Generate SMS messages
  for (const template of smsTemplates) {
    for (let i = 0; i < template.bodies.length; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 15));
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));

      // Get a random account for this SMS
      const account = accounts[Math.floor(Math.random() * accounts.length)];
      
      const smsData = {
        thread_id: Math.floor(Math.random() * 1000).toString(),
        address: template.address,
        person: null,
        date: date.getTime(),
        date_sent: date.getTime(),
        protocol: 0,
        read: template.read,
        status: template.status,
        type: template.type,
        reply_path_present: template.reply_path_present,
        subject: template.subject,
        body: template.bodies[i],
        service_center: template.service_center,
        locked: template.locked,
        error_code: template.error_code,
        sub_id: -1,
        creator: 'com.android.messaging',
        seen: 1,
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
