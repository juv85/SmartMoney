import Transaction from '../models/Transaction';
import Category from '../models/Category';
import SimplifiedGemmaBridge from '../../lib/GemmaBridge';
import { Account } from '../models';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Mock SMS data that mimics real mobile money SMS structure
 */
export const mockSMSData = [
  {
    id: '1',
    body: 'Transaction confirmée. Vous avez reçu 23000 FCFA de +237698765432. Frais: 0 FCFA. Nouveau solde: 50000 FCFA. ID: TXN1234567890',
    address: '+237677123456',
    date: new Date().toISOString()
  },
  {
    id: '2', 
    body: 'Paiement effectué. Montant: 7800 FCFA vers MERCHANT_ABC. Frais: 100 FCFA. Solde: 42100 FCFA. Réf: PAY0987654321',
    address: '+237677123456',
    date: new Date().toISOString()
  },
  {
    id: '3',
    body: 'Retrait effectué au GAB. Montant: 15000 FCFA. Frais: 200 FCFA. Nouveau solde: 26900 FCFA. Transaction ID: ATM5555666677',
    address: '+237677123456', 
    date: new Date().toISOString()
  },
  {
    id: '4',
    body: 'Dépôt confirmé. Vous avez déposé 30000 FCFA. Frais: 150 FCFA. Solde disponible: 56750 FCFA. Référence: DEP9988776655',
    address: '+237677123456',
    date: new Date().toISOString()
  },
  {
    id: '5',
    body: 'Transfert envoyé. 12500 FCFA vers +237699887766. Frais: 75 FCFA. Solde restant: 44175 FCFA. ID transaction: TRF1122334455',
    address: '+237677123456',
    date: new Date().toISOString()
  },
  {
    id: '6',
    body: 'Facture ENEO payée. Montant: 8500 FCFA. Frais: 50 FCFA. Solde: 35625 FCFA. Référence: ELEC7788990011',
    address: '+237677123456',
    date: new Date().toISOString()
  }
];

/**
 * Formats SMS messages for Gemma 3n processing
 * @param {Array} smsMessages - Array of SMS objects
 * @returns {string} - Formatted string with SMS delimiters
 */
export const formatSMSForGemma = (smsMessages) => {
  return smsMessages.map(sms => 
    `---SMS_START---\n${sms.body}\n---SMS_END---`
  ).join('\n\n');
};

/**
 * Store transaction in AsyncStorage as fallback
 * @param {Object} transactionData - Transaction data to store
 * @returns {Promise<Object>} - Stored transaction with generated ID
 */
const storeTransactionInAsyncStorage = async (transactionData) => {
  try {
    // Generate a unique ID for the transaction
    const transactionId = `async_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionWithId = {
      ...transactionData,
      id: transactionId,
      storedIn: 'asyncStorage', // Flag to identify storage method
      createdAt: new Date().toISOString()
    };

    // Get existing transactions from AsyncStorage
    const existingTransactions = await getTransactionsFromAsyncStorage();
    
    // Add new transaction
    const updatedTransactions = [...existingTransactions, transactionWithId];
    
    // Store back to AsyncStorage
    await AsyncStorage.setItem('fallback_transactions', JSON.stringify(updatedTransactions));
    
    console.log('✅ Transaction stored in AsyncStorage:', transactionId);
    return transactionWithId;
  } catch (error) {
    console.error('❌ Failed to store transaction in AsyncStorage:', error);
    throw new Error(`AsyncStorage fallback failed: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Get transactions from AsyncStorage
 * @returns {Promise<Array>} - Array of transactions from AsyncStorage
 */
const getTransactionsFromAsyncStorage = async () => {
  try {
    const stored = await AsyncStorage.getItem('fallback_transactions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('❌ Failed to get transactions from AsyncStorage:', error);
    return [];
  }
};

/**
 * Create a transaction with database fallback to AsyncStorage
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} - Created transaction
 */
const createTransactionWithFallback = async (transactionData) => {
  try {
    // First, try to create in database
    console.log('🔄 Attempting database storage...');
    const transaction = await Transaction.create(transactionData);
    console.log('✅ Transaction created in database:', transaction?.id);
    return transaction;
  } catch (dbError) {
    console.warn('⚠️ Database storage failed, using AsyncStorage fallback:', dbError);
    
    // Fallback to AsyncStorage
    try {
      const fallbackTransaction = await storeTransactionInAsyncStorage(transactionData);
      console.log('✅ Transaction stored in AsyncStorage fallback');
      return fallbackTransaction;
    } catch (fallbackError) {
      console.error('❌ Both database and AsyncStorage failed:', fallbackError);
      throw new Error(`All storage methods failed. DB: ${dbError?.message || 'Unknown'}, AsyncStorage: ${fallbackError?.message || 'Unknown'}`);
    }
  }
};

// /**
//  * The prompt to send to Gemma 3n for SMS parsing
//  */
// export const GEMMA_PARSING_PROMPT = `
// Take the role of a financial transaction parser for a mobile application. You will receive a list of raw SMS messages, each clearly delimited. For each SMS, your task is to identify if it represents a financial transaction and, if so, extract specific details.

// **Input Format:** A single string containing multiple SMS messages, each prefixed with \`---SMS_START---\` and suffixed with \`---SMS_END---\`.

// **Output Format:** Your final reply MUST be a JSON array. Each object in the array represents one parsed transaction. If an SMS does not contain identifiable financial transaction details, or if a specific field cannot be extracted, return \`null\` for that field.

// **For each SMS, return a JSON object with the following fields:**
// * \`categoryName\`: String. The most appropriate category name from this predefined list: \`Incoming Transfer\`, \`Outgoing Transfer\`, \`Deposit\`, \`Withdrawal\`, \`Mobile Payment\`, \`Electricity\`. If none fit, return \`null\`.
// * \`amount\`: Number. The primary transaction amount.
// * \`fees\`: Number. Any associated fees.
// * \`balance\`: Number. The account balance *after* this transaction, if mentioned in the SMS.
// * \`transactionId\`: String. A unique transaction identifier found in the SMS (e.g., "Financial Transaction Id").

// **Example Output Structure (for 2 SMS):**
// \`\`\`json
// [
//   {
//     "categoryName": "Incoming Transfer",
//     "amount": 23000,
//     "fees": 0,
//     "balance": 50000,
//     "transactionId": "1234567890"
//   },
//   {
//     "categoryName": "Mobile Payment",
//     "amount": 7800,
//     "fees": 100,
//     "balance": 42100,
//     "transactionId": "0987654321"
//   }
// ]
// \`\`\`
// `;
/**
 * The prompt to send to Gemma 3n for SMS parsing
 */
export const GEMMA_PARSING_PROMPT = `
Take the role of a financial transaction parser for a mobile application. You will receive a list of raw SMS messages, each clearly delimited. For each SMS, your task is to identify if it represents a financial transaction and, if so, extract specific details.

Input Format: A single string containing multiple SMS messages, each prefixed with ---SMS_START--- and suffixed with ---SMS_END---.

Output Format: Your final reply MUST be a JSON array. Each object in the array represents one parsed transaction. If an SMS does not contain identifiable financial transaction details, or if a specific field cannot be extracted, return null for that field.

For each SMS, return a JSON object with the following fields:
 categoryName: String. The most appropriate category name from this predefined list: Incoming Transfer, Outgoing Transfer, Deposit, Withdrawal, Mobile Payment, Electricity. If none fit, return null.
 amount: Number. The primary transaction amount.
 fees: Number. Any associated fees.
 balance: Number. The account balance after this transaction, if mentioned in the SMS.
 transactionId: String. A unique transaction identifier found in the SMS (e.g., "Financial Transaction Id").
`;

/**
 * Sends SMS data to Gemma 3n for parsing
 * @param {string} formattedSMSData - SMS data formatted with delimiters
 * @returns {Promise<Array>} - Promise resolving to parsed transaction data
 */
export const sendToGemma = async (formattedSMSData) => {
  try {
    // This would be the actual call to Gemma 3n via React Native bridge
    // For now, we'll simulate the response based on our mock data
    
    // Simulated Gemma 3n response for the mock data
    const mockGemmaResponse = [
      {
        "categoryName": "Incoming Transfer",
        "amount": 23000,
        "fees": 0,
        "balance": 50000,
        "transactionId": "TXN1234567890"
      },
      {
        "categoryName": "Mobile Payment", 
        "amount": 7800,
        "fees": 100,
        "balance": 42100,
        "transactionId": "PAY0987654321"
      },
      {
        "categoryName": "Withdrawal",
        "amount": 15000,
        "fees": 200,
        "balance": 26900,
        "transactionId": "ATM5555666677"
      },
      {
        "categoryName": "Deposit",
        "amount": 30000,
        "fees": 150,
        "balance": 56750,
        "transactionId": "DEP9988776655"
      },
      {
        "categoryName": "Outgoing Transfer",
        "amount": 12500,
        "fees": 75,
        "balance": 44175,
        "transactionId": "TRF1122334455"
      },
      {
        "categoryName": "Electricity",
        "amount": 8500,
        "fees": 50,
        "balance": 35625,
        "transactionId": "ELEC7788990011"
      }
    ];

    // Simulate API delay
    // await new Promise(resolve => setTimeout(resolve, 2000));
    
    // return mockGemmaResponse;
    
    // // TODO: Replace with actual Gemma 3n integration
    // const response = await SimplifiedGemmaBridge.generateResponseWithMetrics(
    //   GEMMA_PARSING_PROMPT + '\n\n' + formattedSMSData
    // );
    
    // TODO: Replace with actual Gemma 3n integration
    const response = await SimplifiedGemmaBridge.generateResponse(
      GEMMA_PARSING_PROMPT + '\n\n' + formattedSMSData
    );
    console.log('response', response)
    // let cleanedResponse = response.replaceAll('`', '')
    return parseGemmaResponse(response)
    
  } catch (error) {
    console.error('Error calling Gemma 3n:', error);
    throw new Error('Failed to process SMS with Gemma 3n');
  }
};

/**
 * Cleans the AI's response string and parses it into a JSON object.
 * This function is resilient to common formatting issues like
 * backticks, preambles, and postambles.
 * @param {string} responseString The raw string from the AI.
 * @returns {Array|null} The parsed JSON array, or null if parsing fails.
 */
const parseGemmaResponse = (responseString) => {
  // Use a regex to find the content between the first [ and the last ]
  const match = responseString.match(/\[[\s\S]*\]/);
  
  if (!match || match.length === 0) {
    console.error("Gemma response did not contain a valid JSON array.");
    return null;
  }
  
  const jsonString = match[0];
  
  try {
    // Attempt to parse the extracted JSON string
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse JSON from Gemma response:", e);
    console.error("Raw string that caused the error:", jsonString);
    return null;
  }
};


/**
 * Maps category names to category IDs
 * @param {string} categoryName - Category name from Gemma response
 * @returns {Promise<string|null>} - Category ID or null if not found
 */
export const getCategoryId = async (categoryName) => {
  try {
    const categories = await Category.findAll();
    const categoryMap = {
      'Incoming Transfer': 'incoming_transfer',
      'Outgoing Transfer': 'outgoing_transfer', 
      'Deposit': 'deposit',
      'Withdrawal': 'withdrawal',
      'Mobile Payment': 'phone_credit', // update this later and create just 2 separate classes
      'Electricity': 'electricity'
    };
    
    const className = categoryMap[categoryName];
    console.log('className', className)
    if (!className) return null;
    
    const category = categories.find(cat => cat?.name?.toLowerCase() == className.toLowerCase());
    console.log('categories', categories)
    console.log('category', category)
    return category ? category.id : null;
  } catch (error) {
    console.error('Error getting category ID:', error);
    return null;
  }
};

/**
 * Determines transaction flux based on category
 * @param {string} categoryName - Category name from Gemma response
 * @returns {string} - 'in' or 'out'
 */
export const determineFlux = (categoryName) => {
  const incomingCategories = ['incoming_transfer', 'deposit'];
  return incomingCategories.includes(categoryName) ? 'in' : 'out';
};

/**
 * Creates transaction objects from Gemma 3n parsed data
 * @param {Array} parsedData - Array of parsed transaction data from Gemma
 * @param {Array} originalSMS - Original SMS messages for reference
 * @returns {Promise<Array>} - Array of created Transaction objects
 */
export const createTransactionsFromParsedData = async (parsedData, originalSMS) => {
  console.log('🔄 Starting createTransactionsFromParsedData');
  console.log('📊 Parsed data length:', parsedData?.length);
  console.log('📱 Original SMS length:', originalSMS?.length);
  
  // Validate input parameters
  if (!parsedData || !Array.isArray(parsedData)) {
    console.error('❌ Invalid parsedData: must be an array');
    return [];
  }
  
  if (!originalSMS || !Array.isArray(originalSMS)) {
    console.error('❌ Invalid originalSMS: must be an array');
    return [];
  }
  
  if (parsedData.length !== originalSMS.length) {
    console.warn('⚠️ Length mismatch between parsedData and originalSMS');
    console.warn(`Parsed: ${parsedData.length}, SMS: ${originalSMS.length}`);
  }
  
  // Initialize transactions array
  let transactions = [];
  let failedTransactions = [];
  console.log('✅ Transactions array initialized:', Array.isArray(transactions));
  
  let maxLength = Math.min(parsedData.length, originalSMS.length);
  
  for (let i = 0; i < maxLength; i++) {
    let parsed = parsedData[i];
    let sms = originalSMS[i];
    
    console.log(`🔄 Processing item ${i + 1}/${maxLength}`);
    
    // Skip if no valid transaction data
    if (!parsed || !parsed.amount || !parsed.categoryName) {
      console.warn(`⏭️ Skipping SMS ${i + 1}: Invalid transaction data`, { parsed, sms: sms?.body?.substring(0, 50) });
      continue;
    }
    
    // Skip if no valid SMS data
    if (!sms || !sms.body || !sms.date) {
      console.warn(`⏭️ Skipping SMS ${i + 1}: Invalid SMS data`, { sms });
      continue;
    }
    
    try {
      let categoryId = await getCategoryId(parsed.categoryName);
      let flux = determineFlux(parsed.categoryName.toLowerCase());
      let accounts = await Account.findAll();

      console.log('--- Processing step ---', { flux, categoryId, accountsCount: accounts?.length });
      
      let transactionData = {
        id: getRandomInteger(148, 1505105131),
        amount: parsed.amount,
        fees: parsed.fees || 0,
        transactionId: parsed.transactionId || `TXN_${Date.now()}_${i}`,
        smsBody: sms.body,
        flux: 'in',
        categoryId: "1",
        transactionDate: sms.date,
        accountId: "1",
        smsId: sms.id,
      };
      
      console.log('📝 Transaction data prepared:', transactionData);
      
      // Verify transactions array is still accessible
      if (!Array.isArray(transactions)) {
        console.error('❌ CRITICAL: transactions is not an array!', typeof transactions);
        throw new Error('Transactions array became unavailable');
      }
      
      // Use the new fallback creation method
      // let transaction = await createTransactionWithFallback(transactionData);
      // let transaction = await Transaction.create(transactionData);
      // console.log('✅ Transaction created:', transaction?.id);
      
      // Double-check before pushing
      if (transaction && Array.isArray(transactions)) {
        transactions.push(transaction);
        console.log(`✅ Transaction added to array. Total: ${transactions.length}`);
      } else {
        console.error('❌ Failed to add transaction to array', { 
          transactionExists: !!transaction, 
          isArray: Array.isArray(transactions),
          transactionsType: typeof transactions
        });
      }
      
      console.log(`✅ Created transaction: ${parsed.transactionId} - ${parsed.amount} FCFA`);
      
    } catch (error) {
      console.error(`❌ Error creating transaction for SMS ${i + 1}:`, error);
      
      // Store failed transaction info for debugging
      failedTransactions.push({
        index: i,
        parsed,
        sms: sms?.body?.substring(0, 100),
        error: error?.message || String(error) || 'Unknown error'
      });
      
      console.error('Error details:', {
        stack: error?.stack || 'No stack available',
        parsed,
        sms: sms?.body?.substring(0, 100)
      });
    }
  }
  
  console.log(`🎉 Completed processing. Created ${transactions.length} transactions`);
  if (failedTransactions.length > 0) {
    console.warn(`⚠️ ${failedTransactions.length} transactions failed:`, failedTransactions);
  }
  
  return transactions;
};

export function getRandomInteger(min, max) {
  min = Math.ceil(min); // Ensure min is an integer, rounding up if necessary
  max = Math.floor(max); // Ensure max is an integer, rounding down if necessary
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Main function to process SMS messages end-to-end
 * @param {Array} smsMessages - Array of SMS objects (optional, uses mock data if not provided)
 * @returns {Promise<Object>} - Processing results with success/error info
 */
export const processSMSMessages = async (smsMessages = mockSMSData) => {
  try {
    console.log(`Starting SMS processing for ${smsMessages.length} messages...`);
    
    // Step 1: Format SMS data for Gemma
    const formattedSMS = formatSMSForGemma(smsMessages);
    console.log('SMS data formatted for Gemma 3n');
    
    // Step 2: Send to Gemma 3n for parsing
    let parsedData = await sendToGemma(formattedSMS);
    console.log(`Gemma 3n parsed ${parsedData.length} transactions`);
    console.log('parsed transactions: ', parsedData)
    
    // Step 3: Create transaction objects
    // let transactions = await createTransactionsFromParsedData(parsedData, smsMessages);
    
    const result = {
      success: true,
      processedCount: smsMessages.length,
      parsedData: parsedData,
      // createdTransactions: transactions.length,
      // transactions: transactions,
      errors: []
    };
    
    console.log(`SMS processing completed: ${transactions.length}/${smsMessages.length} transactions created`);
    return result;
    
  } catch (error) {
    console.error('SMS processing failed:', error);
    return {
      success: false,
      processedCount: 0,
      createdTransactions: 0,
      transactions: [],
      // errors: [error.message]
    };
  }
};

/**
 * Get all transactions from both database and AsyncStorage
 * @returns {Promise<Array>} - Combined array of transactions
 */
export const getAllTransactions = async () => {
  try {
    const dbTransactions = await Transaction.findAll();
    const asyncTransactions = await getTransactionsFromAsyncStorage();
    
    // Combine and sort by creation date
    const allTransactions = [...dbTransactions, ...asyncTransactions];
    allTransactions.sort((a, b) => new Date(b.transactionDate || b.createdAt) - new Date(a.transactionDate || a.createdAt));
    
    console.log(`📊 Retrieved ${dbTransactions.length} DB + ${asyncTransactions.length} AsyncStorage transactions`);
    return allTransactions;
  } catch (error) {
    console.error('❌ Error getting all transactions:', error);
    // Fallback to just AsyncStorage if DB fails
    try {
      const asyncTransactions = await getTransactionsFromAsyncStorage();
      console.log(`📊 Retrieved ${asyncTransactions.length} AsyncStorage transactions (DB failed)`);
      return asyncTransactions;
    } catch (asyncError) {
      console.error('❌ Both DB and AsyncStorage failed:', asyncError);
      return [];
    }
  }
};

/**
 * Clear AsyncStorage transactions (for testing/debugging)
 * @returns {Promise<boolean>} - Success status
 */
export const clearAsyncStorageTransactions = async () => {
  try {
    await AsyncStorage.removeItem('fallback_transactions');
    console.log('✅ AsyncStorage transactions cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear AsyncStorage transactions:', error);
    return false;
  }
};

/**
 * Get AsyncStorage transactions count
 * @returns {Promise<number>} - Number of transactions in AsyncStorage
 */
export const getAsyncStorageTransactionCount = async () => {
  try {
    const transactions = await getTransactionsFromAsyncStorage();
    return transactions.length;
  } catch (error) {
    console.error('❌ Failed to get AsyncStorage transaction count:', error);
    return 0;
  }
};

/**
 * Migrate AsyncStorage transactions to database (when DB is working)
 * @returns {Promise<Object>} - Migration results
 */
export const migrateAsyncStorageToDatabase = async () => {
  try {
    const asyncTransactions = await getTransactionsFromAsyncStorage();
    
    if (asyncTransactions.length === 0) {
      return { success: true, migrated: 0, message: 'No transactions to migrate' };
    }
    
    let migratedCount = 0;
    const errors = [];
    
    for (const transaction of asyncTransactions) {
      try {
        // Remove AsyncStorage-specific fields
        const { storedIn, createdAt, ...dbTransactionData } = transaction;
        
        // Try to create in database
        await Transaction.create(dbTransactionData);
        migratedCount++;
      } catch (error) {
        errors.push({ transaction: transaction.id, error: error.message });
      }
    }
    
    // If all migrations successful, clear AsyncStorage
    if (migratedCount === asyncTransactions.length) {
      await clearAsyncStorageTransactions();
    }
    
    console.log(`✅ Migrated ${migratedCount}/${asyncTransactions.length} transactions to database`);
    
    return {
      success: true,
      migrated: migratedCount,
      total: asyncTransactions.length,
      errors: errors,
      message: `Successfully migrated ${migratedCount} transactions`
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      migrated: 0,
      error: error.message,
      message: 'Migration failed'
    };
  }
};
