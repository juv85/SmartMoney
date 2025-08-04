import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors } from '../utils/colors';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';
import { mockData } from '../utils/mockData';
import AccountsList from '../components/home/AccountsList';
import { imgDepot, imgFilter, imgMoMo, imgOM, imgRefresh } from '../utils/images';

const PhoneTransactionItem = ({ transaction, onPress }) => {

  return (
    <TouchableOpacity style={styles.transactionItem} onPress={onPress}>
      <View style={styles.transactionLeft}>
        <View style={styles.transactionClass}>
          <Image source={imgDepot} style={styles.classIcon} />
        </View>
        <View style={styles.transactionInfo}>
          <View style={styles.providerNumber}>
            <View style={[styles.providerIcon]}>
              <Image style={styles.providerIcon} source={transaction.provider == 'orange' ? imgOM : imgMoMo } />
              {/* <Text style={styles.providerIconText}>{getProviderIcon(transaction.provider)}</Text> */}
            </View>
            <Text style={styles.phoneNumber}>{formatPhoneNumber(transaction.number)}</Text>
          </View>
          <Text style={styles.transactionDate}>{transaction.date}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>{formatCurrency(transaction.amount, true)}</Text>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

export const HeaderItem = ({transaction, navigation}) => {

  return (
    <View style={styles.header}>
      <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
        <Text onPress={() => {navigation.goBack()}} style={{fontSize: 16, fontWeight: 500, color: '#fff'}} >{'< Retour'}</Text>
        <TouchableOpacity style={styles.refreshButton}>
          <Image style={{tintColor: '##fff'}} source={imgRefresh} />
        </TouchableOpacity>
      </View>
      <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between'}} >
      <View style={styles.headerItemLeft}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}></Text>
          </View>
        <View style={{}}>
          <Text style={styles.headerTitle}>Téléphone</Text>
          <Text style={styles.headerAmount}>5 800 FCFA</Text>
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
  )
}

const TransactionHistoryScreen = ({ navigation }) => {
  const handleTransactionPress = (transaction) => {
    navigation.navigate('TransactionDetail', { transaction: transaction });
  };

  return (
    <View style={styles.container}>
      {/* Header with amount */}
      <HeaderItem 
        transaction={{}}
        navigation={navigation}
      />

      {/* Mobile Accounts Summary */}
      <View style={styles.accountsSection}>
        <Text style={styles.sectionTitle}>Vos comptes mobiles</Text>
        <AccountsList accounts={mockData.accounts} />
      </View>

      {/* Transactions List */}
      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Vos transactions</Text>
        <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
          {mockData.phoneTransactions.map((transaction) => (
            <PhoneTransactionItem
              key={transaction.id}
              transaction={transaction}
              onPress={() => handleTransactionPress(transaction)}
            />
          ))}
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 15,
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
});

export default TransactionHistoryScreen;