import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../utils/colors';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';
import { mockData } from '../utils/mockData';
import { HeaderItem } from './TransactionHistoryScreen';
import { AccountCard } from '../components/home/AccountsList';
import { Transaction, Account, Category } from '../models';

const DetailRow = ({ label, value, valueStyle }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
  </View>
);

const TransactionDetailScreen = ({ route, navigation }) => {
  const [transaction, setTransaction] = useState(null);
  const [account, setAccount] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get params from navigation
  const { transactionId, transaction: passedTransaction } = route.params || {};

  useEffect(() => {
    loadTransactionDetails();
  }, [transactionId]);

  const loadTransactionDetails = async () => {
    try {
      setLoading(true);

      let transactionData = passedTransaction;

      // If we have a transactionId, fetch the full transaction details
      if (transactionId) {
        transactionData = await Transaction.findById(transactionId);
      }

      if (!transactionData) {
        Alert.alert('Erreur', 'Transaction non trouvée');
        navigation.goBack();
        return;
      }

      setTransaction(transactionData);

      // Load related account
      if (transactionData.accountId) {
        const accountData = await Account.findById(transactionData.accountId);
        setAccount(accountData);
      }

      // Load related category
      if (transactionData.categoryId) {
        const categoryData = await Category.findById(transactionData.categoryId);
        setCategory(categoryData);
      }
    } catch (error) {
      console.error('Error loading transaction details:', error);
      Alert.alert('Erreur', 'Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeDisplay = (type) => {
    switch (type) {
      case 'income': return { text: 'Entrant', color: '#4ECDC4', icon: '📥' };
      case 'expense': return { text: 'Sortant', color: '#FF6B6B', icon: '📤' };
      case 'transfer': return { text: 'Transfert', color: '#45B7D1', icon: '🔄' };
      default: return { text: 'Inconnu', color: '#74B9FF', icon: '💰' };
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed': return { text: 'Terminée', color: '#4ECDC4' };
      case 'pending': return { text: 'En attente', color: '#FFEAA7' };
      case 'failed': return { text: 'Échouée', color: '#FF6B6B' };
      default: return { text: 'Inconnu', color: '#74B9FF' };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <HeaderItem
          transaction={{ accountName: 'Chargement...' }}
          navigation={navigation}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
        </View>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <HeaderItem
          transaction={{ accountName: 'Erreur' }}
          navigation={navigation}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Transaction non trouvée</Text>
        </View>
      </View>
    );
  }

  const typeDisplay = getTransactionTypeDisplay(transaction.type);
  const statusDisplay = getStatusDisplay(transaction.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderItem
        transaction={{
          accountName: account?.name || 'Détails de la transaction',
          phoneNumber: account?.phoneNumber,
          balance: account?.balance
        }}
        navigation={navigation}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Transaction Type & Amount Section */}
        <View style={styles.section}>
          <View style={styles.transactionHeader}>
            <View style={[styles.typeIcon, { backgroundColor: typeDisplay.color }]}>
              <Text style={styles.typeIconText}>{typeDisplay.icon}</Text>
            </View>
            <View style={styles.transactionHeaderInfo}>
              <Text style={styles.transactionType}>{typeDisplay.text}</Text>
              <Text style={[styles.transactionAmount, { color: typeDisplay.color }]}>
                {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
              </Text>
              {transaction.fees > 0 && (
                <Text style={styles.feesText}>Frais: {formatCurrency(transaction.fees)}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Mobile Account Section */}
        {account && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compte mobile de la transaction</Text>
            <AccountCard account={account} cardStyle={{width: '100%'}} />
          </View>
        )}

        {/* Transaction Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de la transaction</Text>
          <View style={styles.detailsCard}>
            <DetailRow 
              label="Date" 
              value={new Date(transaction.date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })} 
            />
            <DetailRow label="Montant" value={formatCurrency(transaction.amount)} />
            {transaction.fees > 0 && (
              <DetailRow label="Frais" value={formatCurrency(transaction.fees)} />
            )}
            <DetailRow 
              label="Type" 
              value={typeDisplay.text}
              valueStyle={{ color: typeDisplay.color }}
            />
            <DetailRow 
              label="Statut" 
              value={statusDisplay.text}
              valueStyle={{ color: statusDisplay.color }}
            />
            {transaction.transactionId && (
              <DetailRow label="ID transaction" value={transaction.transactionId} />
            )}
            {transaction.description && (
              <DetailRow label="Description" value={transaction.description} />
            )}
            {category && (
              <DetailRow label="Catégorie" value={category.name} />
            )}
          </View>
        </View>

        {/* Recipient Information Section */}
        {(transaction.recipientName || transaction.recipientPhone) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations du destinataire</Text>
            <View style={styles.detailsCard}>
              {transaction.recipientName && (
                <DetailRow label="Nom" value={transaction.recipientName} />
              )}
              {transaction.recipientPhone && (
                <DetailRow label="Téléphone" value={formatPhoneNumber(transaction.recipientPhone)} />
              )}
            </View>
          </View>
        )}

        {/* Additional Information */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Informations</Text>
            <Text style={styles.infoText}>
              Cette transaction a été {transaction.status === 'completed' ? 'traitée avec succès' : 'enregistrée'} le{' '}
              {new Date(transaction.date).toLocaleDateString('fr-FR')}.
              {transaction.fees > 0 && ` Des frais de ${formatCurrency(transaction.fees)} ont été appliqués.`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  headerIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerIconText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  headerAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 12,
  },
  expenseBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expenseBadgeText: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: "#808080",
    marginBottom: 10,
  },
  accountCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  providerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  providerIconText: {
    fontSize: 20,
  },
  accountInfo: {
    flex: 1,
  },
  accountNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  accountProvider: {
    fontSize: 14,
    color: colors.gray,
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.lightGray,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.gray,
  },
  detailValue: {
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '600',
    color: colors.black,
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  smsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  smsText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.black,
    fontWeight: '600',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: colors.gray,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  typeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  typeIconText: {
    fontSize: 24,
  },
  transactionHeaderInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  feesText: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.gray,
    lineHeight: 18,
  },
});

export default TransactionDetailScreen;