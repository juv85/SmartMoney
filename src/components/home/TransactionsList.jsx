import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors } from '../../utils/colors';
import { formatCurrency, getCategoryColor, getCategoryTextColor, getTransactionIcon } from '../../utils/formatters';
import { imgDepot, imgPaiement, imgPhone, imgRetrait, imgTransfertEntrant, imgTransfertSortant } from '../../utils/images';

const TransactionItem = ({ transaction, onPress }) => {
  const categoryColor = getCategoryColor(transaction.category);
  const categoryTextColor = getCategoryTextColor(transaction.category);
  const categoryText = transaction.category === 'revenue' ? 'Revenu' : 
                     transaction.category === 'transfer' ? 'Virement' : 'Dépense';

const getClassIcon = (transaction) => {
  if (transaction.type === 'incoming_transfer') {
    return imgTransfertEntrant
  }
  else if (transaction.type === 'outgoing_transfer') {
    return imgTransfertSortant
  }
  else if (transaction.type === 'withdrawal') {
    return imgRetrait
  }
  else if (transaction.type === 'deposit') {
    return imgDepot
  }
  else if (transaction.type === 'mobile_payment') {
    return imgPaiement
  }
  else if (transaction.type === 'phone_credit') {
    return imgPhone
  }
}

  return (
    <TouchableOpacity style={styles.transactionItem} onPress={onPress}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIcon]}>
        {/* <View style={[styles.transactionIcon, { backgroundColor: `${categoryColor}20` }]}> */}
          {/* <Text style={styles.transactionIconText}>{getTransactionIcon(transaction.type)}</Text> */}
          <Image source={getClassIcon(transaction)} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{transaction.title}</Text>
          <Text style={styles.transactionAmount}>{formatCurrency(transaction.amount, true)}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={[styles.categoryText, { color: categoryTextColor}]}>{categoryText}</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const TransactionsList = ({ transactions, navigation }) => {
  const handleTransactionPress = (transaction) => {
    if (transaction.type === 'phone_credit') {
      navigation.navigate('TransactionHistory');
    } else {
      // Navigate to other transaction details if needed
      console.log('Transaction pressed:', transaction.title);
    }
  };

  return (
    <View style={styles.container}>
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onPress={() => handleTransactionPress(transaction)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    marginBottom: 5,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F2F2F2",
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderColor: '#FFD3BC',
    borderWidth: 2,

  },
  transactionIconText: {
    fontSize: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
    color: "#202020",
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.gray,
  },
  transactionRight: {
    // flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 20,
    color: colors.gray,
  },
});

export default TransactionsList;