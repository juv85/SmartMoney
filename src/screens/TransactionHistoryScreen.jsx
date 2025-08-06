import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../utils/colors';
import { formatCurrency, formatPhoneNumber, getClassIcon } from '../utils/formatters';
import { mockData } from '../utils/mockData';
import { imgDepot, imgFilter, imgMoMo, imgOM, imgRefresh } from '../utils/images';
import { Category, Transaction } from '../models';

// New TransactionItem component for database transactions
const TransactionItem = ({ transaction, onPress }) => {
  const [category, setCategory] = useState(null)

  console.log("transaction: ", transaction)

  const getCategory = async () => {
    const fetchedCategory = await Category.findById(transaction.category_id);
    console.log('found category: ', fetchedCategory);
    
    setCategory(fetchedCategory)
  }

  useEffect(() => {
    if (!transaction) {
      return
    }
    getCategory()
  }, [transaction.id])

  return (
    <TouchableOpacity style={styles.transactionItem} onPress={onPress}>
      <View style={styles.transactionLeft}>
        <View style={styles.transactionClass}>
          <Image source={getClassIcon(category)} style={styles.classIcon} />
        </View>
        <View style={styles.transactionInfo}>
          <View style={styles.providerNumber}>
            <View style={[styles.providerIcon]}>
              <Image style={styles.providerIcon} source={transaction?.account_operator_name?.toLowerCase() == 'orange' ? imgOM : imgMoMo } />
              {/* <Text style={styles.providerIconText}>{getProviderIcon(transaction.provider)}</Text> */}
            </View>
            <Text style={styles.phoneNumber}>{formatPhoneNumber(transaction.account_phone_number)}</Text>
          </View>
          <Text style={styles.transactionDate}>{transaction.transaction_date}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>{formatCurrency(transaction.amount, true)}</Text>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

export const HeaderItem = ({ category, totalAmount, navigation, onRefresh }) => {
  return (
    <View style={styles.header}>
      <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
        <Text onPress={() => {navigation.goBack()}} style={{fontSize: 16, fontWeight: '500', color: '#fff'}} >{'< Retour'}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Image style={{tintColor: '#fff'}} source={imgRefresh} />
        </TouchableOpacity>
      </View>
      <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between'}} >
        <View style={styles.headerItemLeft}>
          <View style={styles.headerIcon}>
            <Image source={getClassIcon(category)} style={styles.headerClassIcon} />
            {/* <Text style={styles.headerIconText}>{getClassIcon(category) || ''}</Text> */}
          </View>
          <View>
            <Text style={styles.headerTitle}>{category?.name || 'Catégorie'}</Text>
            <Text style={styles.headerAmount}>
              {formatCurrency(totalAmount, true)}
            </Text>
          </View>
        </View>
        <View style={styles.headerItemRight}>
          <View style={styles.periodContainer}>
            <Image source={imgFilter} style={[styles.filterIcon, {tintColor: '#fff'}]} />
            <Text style={styles.periodText}>Cette semaine</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const TransactionHistoryScreen = ({ route, navigation }) => {
  const [category, setCategory] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { categoryId, categoryName, accountId, phoneNumber } = route.params || {};

  useEffect(() => {
    console.log("catId: ", categoryId)
    loadCategoryData();
  }, []);

  const loadAccountData = useCallback(async () => {
    try {
      
    } catch (error) {
      
    }
  }, [accountId])

  const loadCategoryData = useCallback(async () => {
     try {
       setLoading(true);
 
       if (categoryId) {
         const categoryData = await Category.findById(categoryId);
         console.log('categoryData :>> ', categoryData);
         setCategory(categoryData);
        //  console.log("categ id: ", categoryId)
        //  let cat = new Category({id: "129f16f3-a493-4289-8291-5d16c13b09bb"})
         let cat = new Category({id: categoryId})
         const categoryTransactions = await cat.getTransactions();
        //  const categoryTransactions = await Transaction.findAll({
        //    categoryId: categoryId,
        //  });
       console.log("cat transactions: ", categoryTransactions)
       setTransactions(categoryTransactions);
       } else {
         const allTransactions = await Transaction.findAll({ limit: 100 });
         setTransactions(allTransactions);
       }
     } catch (error) {
       console.error('Error loading category data:', error);
       setTransactions(mockData.transactions || []);
     } finally {
       setLoading(false);
     }
   }, [categoryId])


  const handleTransactionPress = (transaction) => {
    navigation.navigate('TransactionDetail', { 
      transactionId: transaction.id,
    });
  };

  const handleRefresh = () => {
    loadCategoryData();
  };

  const categoryTotal = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  if (loading) {
    return (
      <View style={styles.container}>
        <HeaderItem 
          category={{ name: category?.name || accountId && phoneNumber || 'Chargement...' }}
          totalAmount={0}
          navigation={navigation}
          onRefresh={handleRefresh}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des transactions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with category info */}
      <HeaderItem 
        category={category || { name: categoryName || accountId && formatPhoneNumber(phoneNumber) || 'Toutes les transactions' }}
        totalAmount={categoryTotal}
        navigation={navigation}
        onRefresh={handleRefresh}
      />

      {/* Transactions List */}
      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>
          {transactions.length > 0 
            ? `Vos transactions (${transactions.length})` 
            : 'Aucune transaction'
          }
        </Text>
        <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onPress={() => handleTransactionPress(transaction)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune transaction trouvée</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <Text style={styles.refreshButtonText}>Actualiser</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
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
    // backgroundColor: '#FFD3BC',
    paddingHorizontal: 15,
    // flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  headerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 7,
  },
  headerIcon: {
    width: 45,
    height: 45,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFD3BC',
    borderWidth: 2,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22
    // marginBottom: 15,
  },
  headerClassIcon: {
    width: 30,
    height: 30,
    margin: 10,
    tintColor: '#fff'
  },
  headerIconText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    // marginBottom: 8,
  },
  headerAmount: {
    fontSize: 27,
    fontWeight: 'bold',
    color: colors.white,
    // marginBottom: 8,
  },
  providerNumber: {
    flexDirection: 'row'
  },
  headerPeriod: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  accountsSection: {
    backgroundColor: colors.background,
    padding: 20,
    // marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: "#808080",
    marginBottom: 10,
  },
  accountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountSummary: {
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountIconText: {
    fontSize: 20,
  },
  accountAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 12,
    color: colors.gray,
  },
  transactionsSection: {
    flex: 1,
    backgroundColor: colors.background,
    // marginTop: 20,
    paddingHorizontal: 20,
    // paddingTop: 20,
  },
  transactionsList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F2F2F2",
    padding: 10,
    // paddingVertical: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.lightGray,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionClass: {
    borderRadius: 12,
    padding: 5,
    borderColor: '#FFD3BC',
    borderWidth: 2,
    marginRight: 7,
  },
  classIcon: {
    width: 30,
    height: 30
  },
  providerIcon: {
    width: 24,
    height: 24,
    borderRadius: 20,
    // justifyContent: 'center',
    // alignItems: 'center',
    marginRight: 4,
  },
  providerIconText: {
    fontSize: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  filterIcon: {
    width: 20,
    height: 20,
    marginRight: 2,
  },
  periodContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    padding: 5,
    borderRadius: 12,
    // paddingHorizontal: 20,
    // paddingVertical: 10,
    backgroundColor: '#FFA99A',
  },
  periodText: {
    fontSize: 12,
    color: colors.white,
  },
  phoneNumber: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '400',
    color: colors.black,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.gray,
  },
  transactionRight: {
    // flexDirection: 'row',
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: colors.black,
    // marginRight: 8,
  },
  arrow: {
    fontSize: 20,
    color: colors.gray,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 4,
  },
  typeIcon: {
    fontSize: 20,
  },
  headerPhone: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
});

export default TransactionHistoryScreen;