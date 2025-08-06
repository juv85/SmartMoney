import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../utils/colors';
import { formatCurrency } from '../utils/formatters';
import { mockData } from '../utils/mockData';
import SummaryCards from '../components/home/SummaryCards';
import AccountsList from '../components/home/AccountsList';
import ClassList from '../components/home/ClassList';
import { imgFilter, imgRefresh } from '../utils/images';
import { Account, Transaction, Category } from '../models';
import { createSyntheticData, testModelFunctions } from '../utils/syntheticData';

const HomeScreen = ({ navigation }) => {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(mockData.summary);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load accounts
      const accountsData = await Account.findAll(); // active only
      setAccounts(accountsData.length > 0 ? accountsData : mockData.accounts);
      console.log('accountsData', accountsData)
      
      // Load recent transactions
      const recentTransactions = await Transaction.findAll();
      setTransactions(recentTransactions.length > 0 ? recentTransactions : mockData.transactions);
      console.log('recentTransactions', recentTransactions)

      const categories = await Category.findAll();
      setCategories(categories.length > 0 ? categories : mockData.categories);
      console.log("categories", categories)
      // Calculate summary from real data if available
      // if (recentTransactions.length > 0) {
      //   const stats = await Transaction.getStatistics();
      //   setSummary({
      //     totalBalance: accountsData.reduce((sum, acc) => sum + acc.balance, 0),
      //     monthlyIncome: stats.income?.total || 0,
      //     monthlyExpenses: stats.expense?.total || 0,
      //     transactionCount: stats.income?.count + stats.expense?.count || 0
      //   });
      // }
      // setLoading(false);

    } catch (error) {
      console.error('Error loading data: ', error);
      // Fallback to mock data
      setAccounts(mockData.accounts);
      setTransactions(mockData.transactions);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSyntheticData = async () => {
    Alert.alert(
      'Créer des données de test',
      'Voulez-vous créer des données synthétiques pour tester l\'application?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Créer',
          onPress: async () => {
            try {
              setLoading(true);
              await createSyntheticData();
              await loadData();
              Alert.alert('Succès', 'Données synthétiques créées avec succès!');
            } catch (error) {
              console.error('Error creating synthetic data:', error);
              Alert.alert('Erreur', 'Erreur lors de la création des données');
            }
          }
        }
      ]
    );
  };

  const handleTestModels = async () => {
    try {
      await testModelFunctions();
      Alert.alert('Test terminé', 'Vérifiez la console pour les résultats');
    } catch (error) {
      console.error('Error testing models:', error);
      Alert.alert('Erreur', 'Erreur lors du test des modèles');
    }
  };

  const handleAccountPress = (account) => {
    navigation.navigate('TransactionHistory', { 
      accountId: account.id,
      accountName: account.name || account.accountName,
      phoneNumber: account.phoneNumber || account.phone
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Accueil</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
            <Image style={styles.refreshIcon} source={imgRefresh} />
          </TouchableOpacity>
        </View>

        {/* Development Buttons */}
        <View style={styles.devButtonsContainer}>
          <TouchableOpacity 
            style={styles.devButton} 
            onPress={handleCreateSyntheticData}
          >
            <Text style={styles.devButtonText}> Créer données test</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.devButton} 
            onPress={handleTestModels}
          >
            <Text style={styles.devButtonText}> Tester modèles</Text>
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <Image source={imgFilter} style={styles.filterIcon} />
          <Text style={styles.periodText}>Cette semaine</Text>
        </View>

        {/* Summary Cards */}
        <SummaryCards data={summary} />

        {/* Mobile Accounts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos comptes mobiles</Text>
          <AccountsList 
            accounts={accounts} 
            onAccountPress={handleAccountPress}
          />
        </View>

        {/* Usage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Votre utilisation</Text>
          <ClassList 
            categories={categories} 
            navigation={navigation}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  devButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  devButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  devButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
  },
  refreshButton: {
    // padding: 8,
  },
  refreshIcon: {
    width: 25,
    height: 25,
  },
  filterIcon: {
    width: 20,
    height: 20,
ht: 25,
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  periodContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  periodText: {
    fontSize: 14,
    color: colors.gray,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: "#808080",
    marginBottom: 10,
  },
});

export default HomeScreen;