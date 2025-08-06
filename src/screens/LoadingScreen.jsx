import { Image, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { imgBubbles } from '../utils/images'
import { GEMMA_PARSING_PROMPT, mockSMSData, processSMSMessages } from '../utils/smsProcessor'
import { useGemmaMetrics, useGemmaModel } from '../../lib/hooks'
import PermissionManager from '../../lib/managers/PermissionManager'

const LoadingScreen = ({ navigation }) => {
  const [loadingText, setLoadingText] = useState('Initialisation...');
  const [processingComplete, setProcessingComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(false)
  const [currentSms, setCurrentSms] = useState('')
  const [currentSmsResult, setCurrentSmsResult] = useState('')
  const [totalSmsToProcess, setTotalSmsToProcess] = useState(false)
  // const [] = useState(false)
  const permissionManager = PermissionManager.getInstance();

  const {
    status,
    isLoaded,
    isLoading,
    error,
    loadModel,
    unloadModel,
    deviceCapabilities,
  } = useGemmaModel();

  const {
    realtimeMetrics,
    performanceStats,
    isPerformanceDegrading,
    clearMetrics,
  } = useGemmaMetrics();


  // Handle first request with model loading
  // const handleSendMessage = useCallback(async () => {
  //   if (!GEMMA_PARSING_PROMPT.trim() || isGenerating) return;

  //   const userMessage = GEMMA_PARSING_PROMPT.trim();
  //   setIsGenerating(true);

  //   try {
  //     // Load model if not loaded
  //     if (!isLoaded) {
  //       console.log("Model not loaded, loading now...");
  //       const loadSuccess = await loadModel();
  //       if (!loadSuccess) {
  //         throw new Error("Failed to load model");
  //       }
  //     }

  //     // Generate response
  //     const result = await SimplifiedGemmaBridge.generateResponseWithMetrics(
  //       userMessage
  //     );

  //     console.log("Response generated:", {
  //       tokensPerSecond: result.metrics.tokensPerSecond,
  //       inferenceTime: result.metrics.inferenceTimeMs,
  //     });

  //   } catch (error) { 
  //     console.error("Error generating response:", error);

  //     // Show user-friendly error
  //     Alert.alert("Error", `Failed to generate response: ${error.message}`, [
  //       { text: "OK" },
  //     ]);
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // }, [isLoaded, isGenerating, loadModel]);


  // Manual model loading
  const handleLoadModel = useCallback(async () => {
    if (isLoading) return;

    try {
      const success = await loadModel();
      if (success) {
        Alert.alert("Success", "Model loaded successfully!");
      } else {
        Alert.alert("Error", "Failed to load model");
      }
    } catch (error) {
      Alert.alert("Error", `Failed to load model: ${error.message}`);
    }
  }, [isLoading, loadModel]);


  // useEffect(() => {
  //   handleLoadModel();
  // }, []);

  useEffect(() => {
    if (isLoaded) {
      setLoadingText('Notre IA traite vos SMS de transaction financière');
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isLoading) {
      setLoadingText('Chargement du modèle...');
    }
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      setLoadingText('Erreur lors du chargement du modèle');
    }
  }, [error]);

  useEffect(() => {
    // const processSMS = async () => {
    //   try {
    //     for (let i = 0; i < mockSMSData.length; i++) {
    //       const sms = mockSMSData[i];
    //       setLoadingText('Analyse des SMS en cours...');

    //       // Process SMS messages using Gemma 3n
    //       // const result = await processSMSMessages(mockSMSData.splice(0, 2));
    //       const result = await processSMSMessages([sms]);

    //       if (result.success) {
    //         setLoadingText(`${result.createdTransactions} transactions créées`);
    //         setLoadingText(`${mockSMSData.length - (i + 1)} transactions créées`);
    //         console.log('SMS processing completed successfully:', result);
    //       } else {
    //         setLoadingText('Erreur lors du traitement des SMS');
    //         console.error('SMS processing failed:', result.errors);
    //       }

    //     }
    //   } catch (error) {
    //     setLoadingText('Erreur lors du traitement des SMS');
    //     console.error('SMS processing error:', error);
    //   } finally {
    //     setProcessingComplete(true);

    //     // Navigate to Home after a short delay to show completion message
    //     setTimeout(() => {
    //       navigation.replace('Home');
    //     }, 1500);
    //   }
    // };
    // const processSMS = async () => {
    //   try {
    //     setLoadingText('Analyse des SMS en cours...');

    //     // Process SMS messages using Gemma 3n
    //     const result = await processSMSMessages(mockSMSData.splice(0, 1));
    //     // const result = await processSMSMessages(mockSMSData.splice(0, 1));

    //     if (result.success) {
    //       setLoadingText(`${result.createdTransactions} transactions créées`);
    //       console.log('SMS processing completed successfully:', result);
    //     } else {
    //       setLoadingText('Erreur lors du traitement des SMS');
    //       console.error('SMS processing failed:', result.errors);
    //     }

    //   } catch (error) {
    //     setLoadingText('Erreur lors du traitement des SMS');
    //     console.error('SMS processing error:', error);
    //   } finally {
    //     setProcessingComplete(true);

    //     // Navigate to Home after a short delay to show completion message
    //     setTimeout(() => {
    //       navigation.replace('Home');
    //     }, 1500);
    //   }
    // };

    // ---
    // Start SMS processing after a short delay

    // handleLoadModel().finally(() => {
    //   processSMS();
    // })
    // const timer = setTimeout(() => {
    //   navigation.replace('Home');
    //   }, 3000);
    // setTimeout(() => {
    //   navigation.replace('Home');
    // }, 1500);

    // return () => clearTimeout(timer);
  }, [navigation]);


  // // Effect for model loading status
  // useEffect(() => {
  //   if (isLoading) {
  //     setLoadingText('Chargement du modèle...');
  //   } else if (isLoaded) {
  //     setLoadingText('Modèle IA chargé. Prêt à analyser les SMS.');
  //   } else if (error) {
  //     setLoadingText('Erreur lors du chargement du modèle.');
  //     console.error("Gemma Model Error:", error);
  //     // Potentially navigate to an error screen or show a retry option
  //   }
  // }, [isLoading, isLoaded, error]);

  // Main processing effect
  useEffect(() => {
    const startProcessing = async () => {
      try {
        setLoadingText('Vérification des permissions...');
        const hasStoragePermission = await permissionManager.hasStoragePermission();
        if (!hasStoragePermission) {
          setLoadingText('Demande de permission de stockage...');
          const granted = await permissionManager.requestStoragePermission();
          if (!granted) {
            setLoadingText('Permission de stockage non accordée. Veuillez l\'activer manuellement.');
            // Do not proceed, stay on this screen or navigate to an error screen
            return;
          }
        }

        // Ensure model is loaded
        if (!isLoaded && !isLoading) {
          setLoadingText('Chargement du modèle IA...');
          const loadSuccess = await loadModel();
          if (!loadSuccess) {
            throw new Error("Failed to load Gemma model.");
          }
        } else if (isLoading) {
          // Wait for model to finish loading if it's already in progress
          setLoadingText('Attente du chargement du modèle...');
          // You might need a more robust way to await loading completion if loadModel is not idempotent
          // For now, assuming loadModel handles being called multiple times.
        }

        setLoadingText('Préparation des SMS...');
        // In a real app, fetch actual SMS here. For now, use mockData.
        // Filter out already processed SMS if fetching from device's inbox
        // For mock data, we'll just process all of them for demonstration.

        setTotalSmsToProcess(mockSMSData.length);

        let processedCount = 0;
        for (let i = 0; i < mockSMSData.length; i++) {
          try {
            const sms = mockSMSData[i];
            setLoadingText(`Analyse SMS ${i + 1} sur ${mockSMSData.length}...`);
            setProcessingProgress(Math.floor(((i + 1) / mockSMSData.length) * 100));
            
            // Update current SMS being processed
            setCurrentSms(sms.body);
            setCurrentSmsResult(''); // Clear previous result
            
            // Add a small delay to show the SMS before processing
            await new Promise(resolve => setTimeout(resolve, 2200));
            
            const result = await processSMSMessages([sms]);
            
            // Update the result display
            if (result.success) {
              // const transaction = result.transactions[0];
              // const resultText = `✅ Transaction créée:\n• Montant: ${transaction.amount} FCFA\n• Type: ${transaction.flux === 'in' ? 'Entrée' : 'Sortie'}\n• Date: ${new Date(transaction.transactionDate).toLocaleDateString('fr-FR')}`;
              const resultText = result.parsedData;
              setCurrentSmsResult(resultText);
              processedCount++;
            } else {
              setCurrentSmsResult('❌ Échec du traitement de ce SMS');
            }
            
            // Show result for a moment before moving to next
            await new Promise(resolve => setTimeout(resolve, 1200));

          } catch (gemmaError) {
            console.error("Error calling Gemma API for SMS:", sms.id, gemmaError);
            setCurrentSmsResult('❌ Erreur lors du traitement');
            await new Promise(resolve => setTimeout(resolve, 800));
            continue; // Skip to next SMS
          }
        }

        // Clear SMS display and show completion
        setCurrentSms('');
        setCurrentSmsResult('');
        setLoadingText(`${processedCount} transactions créées sur ${mockSMSData.length} SMS traités.`);
        setProcessingComplete(true);
        console.log('All SMS processed successfully.');

      } catch (error) {
        setLoadingText('Erreur lors du traitement des SMS.');
        console.error('SMS processing error:', error);
      } finally {
        // Navigate to Home after a short delay to show completion message
        setTimeout(() => {
          navigation.replace('Home');
        }, 2000); // Give user a moment to see the completion message
      }
    };

    // Start the process after model loading is confirmed or initiated
    // Using a separate effect for model loading and processing ensures better control
    if (!isLoading && !error) { // Only start if not currently loading and no error
      startProcessing();
    }

  }, [isLoaded, isLoading, error, navigation, permissionManager, loadModel]); // Re-run if model loaded state changes


  return (
    <View style={styles.container}>
      <View style={styles.loadingContainer}>
        {/* <ActivityIndicator size="large" color="#007AFF" style={styles.spinner} /> */}
        <Text style={styles.loadingText}>{'Veuillez patienter...'}</Text>
        <Text style={styles.loadingTitle}>{loadingText}</Text>
        {totalSmsToProcess > 0 && processingProgress > 0 && processingProgress < 100 && (
          <Text style={styles.progressText}>{`${processingProgress}%`}</Text>
        )}
        {processingComplete && (
          <Text style={styles.completionText}>✓ Traitement terminé</Text>
        )}
            <View>
      <Image source={imgBubbles} style={styles.loader} />
      
    </View>
      </View>
      
      {/* SMS Processing Display */}
      <View style={styles.smsProcessingContainer}>
        {currentSms && (
          <View style={styles.smsCard}>
            <Text style={styles.smsLabel}>SMS en cours de traitement:</Text>
            <View style={styles.smsContent}>
              <Text style={styles.smsText}>{currentSms}</Text>
            </View>
          </View>
        )}
        
        {currentSmsResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Résultat de l'analyse:</Text>
            <View style={styles.resultContent}>
              <Text style={styles.resultText}>{currentSmsResult}</Text>
            </View>
          </View>
        )}
        
        {!currentSms && !currentSmsResult && (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>En attente du traitement des SMS...</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default LoadingScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  loader: {
    width: 270,
    height: 270,
    marginBottom: 100
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  spinner: {
    marginBottom: 20
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center'
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10
  },
  progressText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 5
  },
  completionText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: 'bold',
    marginTop: 10
  },
  smsProcessingContainer: {
    width: '100%',
    maxWidth: 400,
    flex: 1,
    justifyContent: 'center'
  },
  smsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  smsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8
  },
  smsContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12
  },
  smsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745'
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 8
  },
  resultContent: {
    backgroundColor: '#f8fff9',
    borderRadius: 8,
    padding: 12
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontFamily: 'monospace'
  },
  placeholderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#ddd'
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic'
  }
});