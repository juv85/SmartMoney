import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../utils/colors';
import { formatCurrency, formatPhoneNumber } from '../../utils/formatters';
import { imgMoMo, imgOM } from '../../utils/images';

export const AccountCard = ({ account, cardStyle, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress(account);
    }
  };

  const CardContent = (
    <View style={[styles.accountCard, cardStyle]}>
      <View style={styles.accountHeader}>
        {/* <View style={[styles.providerIcon, { backgroundColor: getProviderColor(account.provider) }]}> */}
        <View style={[styles.providerIcon]}>
          <Image style={styles.providerIcon} source={account?.provider?.toLowerCase() == 'orange' ? imgOM : imgMoMo } />
          {/* <Text style={styles.providerIconText}>{getProviderIcon(account.provider)}</Text> */}
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountNumber}>{formatPhoneNumber(account?.number || account?.phoneNumber)}</Text>
          <Text style={styles.accountName}>{account?.name || account?.accountName}</Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const AccountsList = ({ accounts, onAccountPress }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {accounts.map((account) => (
        <AccountCard 
          key={account.id} 
          account={account} 
          onPress={onAccountPress}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  accountCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 6,
    marginRight: 15,
    minWidth: 200,
    // shadowColor: colors.black,
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 3.84,
    // elevation: 5,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerIcon: {
    width: 42,
    height: 42,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  providerIconText: {
    fontSize: 20,
  },
  accountInfo: {
    flex: 1,
  },
  accountNumber: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '400',
    color: colors.black,
    marginBottom: 2,
  },
  accountName: {
    fontSize: 13,
    color: colors.gray,
  },
});

export default AccountsList;