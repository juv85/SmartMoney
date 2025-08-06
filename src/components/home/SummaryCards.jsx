import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors } from '../../utils/colors';
import { formatCurrency } from '../../utils/formatters';

const SummaryCard = ({ title, amount, color, backgroundColor, icon }) => (
  <View style={[styles.card, { backgroundColor }]}>
    <View style={styles.cardHeader}>
      {/* <Text style={styles.cardIcon}>{icon}</Text> */}
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <Text style={[styles.cardAmount, { color }]}>
      {formatCurrency(amount)}
    </Text>
    <Text style={styles.currency}>{"FCFA"}</Text>
  </View>
);

const SummaryCards = ({ data }) => {
  return (
    <View style={styles.container}>
      <SummaryCard
        title="Revenus"
        amount={data.revenue}
        color={colors.revenue}
        backgroundColor={colors.revenueLight}
        // icon="💰"
      />
      <SummaryCard
        title="Virement"
        amount={data.transfer}
        color={colors.transfer}
        backgroundColor={colors.transferLight}
        // icon="🔄"
      />
      <SummaryCard
        title="Dépenses"
        amount={data.expense}
        color={colors.danger}
        backgroundColor={colors.expenseLight}
        // icon="💸"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  card: {
    flex: 1,
    padding: 10,
    // minHeight: 90,
    gap: 1,
    overflow: 'hidden',
    borderRadius: 12,
    marginHorizontal: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    // marginBottom: 8,
  },
  cardIcon: {
    fontSize: 16,
    marginRight: 3,
  },
  cardTitle: {
    fontSize: 12,
    color: "#404040",
    fontWeight: '400',
    textAlign:'center',
  },
  cardAmount: {
    marginTop: 1,
    fontSize: 16,
    fontWeight: '800',
    textAlign:'center',
  },
  currency: {
    textAlign:'center',
    fontWeight: '300',
  }
});

export default SummaryCards;