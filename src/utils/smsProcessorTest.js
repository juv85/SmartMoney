import { 
  mockSMSData, 
  formatSMSForGemma, 
  sendToGemma, 
  createTransactionsFromParsedData,
  processSMSMessages,
  GEMMA_PARSING_PROMPT 
} from './smsProcessor';

/**
 * Test utility for SMS processing functionality
 * This file helps debug and verify the SMS-to-transaction pipeline
 */

/**
 * Test the SMS formatting function
 */
export const testSMSFormatting = () => {
  console.log('=== Testing SMS Formatting ===');
  const formatted = formatSMSForGemma(mockSMSData.slice(0, 2));
  console.log('Formatted SMS data:');
  console.log(formatted);
  console.log('\n');
  return formatted;
};

/**
 * Test the Gemma 3n integration (currently mocked)
 */
export const testGemmaIntegration = async () => {
  console.log('=== Testing Gemma 3n Integration ===');
  const formatted = formatSMSForGemma(mockSMSData.slice(0, 2));
  
  try {
    const result = await sendToGemma(formatted);
    console.log('Gemma 3n response:');
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Gemma integration test failed:', error);
    return null;
  }
};

/**
 * Test transaction creation from parsed data
 */
export const testTransactionCreation = async () => {
  console.log('=== Testing Transaction Creation ===');
  
  const testParsedData = [
    {
      "categoryName": "Incoming Transfer",
      "amount": 23000,
      "fees": 0,
      "balance": 50000,
      "transactionId": "TEST123"
    }
  ];
  
  const testSMS = [mockSMSData[0]];
  
  try {
    const transactions = await createTransactionsFromParsedData(testParsedData, testSMS);
    console.log('Created transactions:');
    console.log(transactions);
    return transactions;
  } catch (error) {
    console.error('Transaction creation test failed:', error);
    return [];
  }
};

/**
 * Run full end-to-end test
 */
export const runFullTest = async () => {
  console.log('=== Running Full SMS Processing Test ===');
  
  try {
    const result = await processSMSMessages(mockSMSData.slice(0, 3));
    console.log('Full test result:');
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Full test failed:', error);
    return null;
  }
};

/**
 * Display the Gemma prompt for review
 */
export const showGemmaPrompt = () => {
  console.log('=== Gemma 3n Parsing Prompt ===');
  console.log(GEMMA_PARSING_PROMPT);
  console.log('\n');
};

/**
 * Display mock SMS data for review
 */
export const showMockData = () => {
  console.log('=== Mock SMS Data ===');
  mockSMSData.forEach((sms, index) => {
    console.log(`SMS ${index + 1}:`);
    console.log(`Address: ${sms.address}`);
    console.log(`Body: ${sms.body}`);
    console.log(`Date: ${sms.date}`);
    console.log('---');
  });
  console.log('\n');
};

/**
 * Run all tests in sequence
 */
export const runAllTests = async () => {
  console.log('🚀 Starting SMS Processor Tests...\n');
  
  showMockData();
  showGemmaPrompt();
  testSMSFormatting();
  
  await testGemmaIntegration();
  await testTransactionCreation();
  await runFullTest();
  
  console.log('✅ All tests completed!');
};
