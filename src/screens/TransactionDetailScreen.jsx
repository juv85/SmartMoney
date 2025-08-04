import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../utils/colors';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';
import { mockData } from '../utils/mockData';
import { HeaderItem } from './TransactionHistoryScreen';
import { AccountCard } from '../components/home/AccountsList';

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const TransactionDetailScreen = ({ route, navigation }) => {
  const { transaction } = route.params || {};
  console.log('route :>> ', route);
  const account = mockData.accounts[1];
  const detail = mockData.transactionDetail; // Using mock data for detailed view

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderItem
        transaction={transaction}
        navigation={navigation}
       />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mobile Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comptes mobile de la transaction</Text>
          <AccountCard account={account} cardStyle={{width: '100%'}} />
        </View>

        {/* Transaction Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de la transaction</Text>
          <View style={styles.detailsCard}>
            <DetailRow label="Date" value={detail.date} />
            <DetailRow label="Frais" value={`${detail.fees} FCFA`} />
            <DetailRow label="Flux" value={detail.direction} />
            <DetailRow label="ID transaction" value={detail.transactionId} />
          </View>
        </View>

        {/* SMS Origin Section */}
        <View style={styles.section}>
          <View style={styles.smsCard}>
            <Text style={[styles.sectionTitle, {color: '#525252', fontStyle: 'italic', fontWeight: 400, fontSize: 13}]}>SMS d'origine</Text>
            <Text style={styles.smsText}>{detail.smsOrigin}</Text>
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
});

export default TransactionDetailScreen;