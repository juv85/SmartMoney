import React, { useEffect } from 'react';
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
import Category from '../../models/Category';

const ClassItem = ({ category, onPress }) => {
  const categoryColor = getCategoryColor(category.type);
  const categoryTextColor = getCategoryTextColor(category.type);
  const categoryText = category.type === 'revenu' ? 'Revenu' : 
                     category.type === 'virement' ? 'Virement' : 'Dépense';
  
  useEffect(()=> {
    if (!category) {
      return
    }
    async function getTransactions() {
      let category = await Category.findById(category.id)
      console.log('category id', category.id)
      // let transactions = await category.getTransactions()
      // console.log('category transactions', transactions)
    }
    getTransactions()
  }, [category])

const getClassIcon = (category) => {
  if (category?.name.toLowerCase() === 'incoming_transfer') {
    return imgTransfertEntrant
  }
  else if (category?.name.toLowerCase() === 'outgoing_transfer') {
    return imgTransfertSortant
  }
  else if (category?.name.toLowerCase() === 'withdrawal') {
    return imgRetrait
  }
  else if (category?.name.toLowerCase() === 'deposit') {
    return imgDepot
  }
  else if (category?.name.toLowerCase() === 'mobile_payment') {
    return imgPaiement
  }
  else if (category?.name.toLowerCase() === 'phone_credit') {
    return imgPhone
  }
}

const getClassName = (category) => {
  if (category?.name.toLowerCase() === 'incoming_transfer') {
    return 'Transfer Entrant'
  }
  else if (category?.name.toLowerCase() === 'outgoing_transfer') {
    return 'Transfer Sortant'
  }
  else if (category?.name.toLowerCase() === 'withdrawal') {
    return 'Retrait'
  }
  else if (category?.name.toLowerCase() === 'deposit') {
    return 'Depot'
  }
  else if (category?.name.toLowerCase() === 'mobile_payment') {
    return 'Paiement'
  }
  else if (category?.name.toLowerCase() === 'phone_credit') {
    return 'Telephone'
  }
}

  return (
    <TouchableOpacity style={styles.transactionItem} onPress={onPress}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIcon]}>
        {/* <View style={[styles.transactionIcon, { backgroundColor: `${categoryColor}20` }]}> */}
          {/* <Text style={styles.transactionIconText}>{getTransactionIcon(transaction.type)}</Text> */}
          <Image source={getClassIcon(category)} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{getClassName(category)}</Text>
          <Text style={styles.transactionAmount}>{formatCurrency(category.amount, true)}</Text>
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

const ClassList = ({ categories, navigation }) => {
  const handleClassPress = (category) => {
    navigation.navigate('TransactionHistory', {categoryId: category.id});

    // if (transaction.type === 'phone_credit') {
    //   navigation.navigate('TransactionHistory');
    // } else {
    //   navigation.navigate('TransactionHistory');
    //   // Navigate to other transaction details if needed
    //   console.log('Transaction pressed:', transaction.title);
    // }
  };

  return (
    <View style={styles.container}>
      {categories?.map((category) => (
        <ClassItem
          key={category.id}
          category={category}
          onPress={() => handleClassPress(category)}
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

export default ClassList;
