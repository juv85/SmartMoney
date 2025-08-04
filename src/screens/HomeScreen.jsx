import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors } from '../utils/colors';
import { formatCurrency } from '../utils/formatters';
import { mockData } from '../utils/mockData';
import SummaryCards from '../components/home/SummaryCards';
import AccountsList from '../components/home/AccountsList';
import TransactionsList from '../components/home/TransactionsList';
import { imgFilter, imgRefresh } from '../utils/images';

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Accueil</Text>
          <TouchableOpacity style={styles.refreshButton}>
            <Image style={styles.refreshIcon} source={imgRefresh} />
            {/* <Text style={styles.refreshText}>🔄</Text> */}
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <Image source={imgFilter} style={styles.filterIcon} />
          <Text style={styles.periodText}>Cette semaine</Text>
        </View>

        {/* Summary Cards */}
        <SummaryCards data={mockData.summary} />

        {/* Mobile Accounts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos comptes mobiles</Text>
          <AccountsList accounts={mockData.accounts} />
        </View>

        {/* Usage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Votre utilisation</Text>
          <TransactionsList 
            transactions={mockData.transactions} 
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