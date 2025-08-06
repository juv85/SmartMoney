import { imgDepot, imgPaiement, imgPhone, imgRetrait, imgTransfertEntrant, imgTransfertSortant } from "./images";

export const formatCurrency = (amount, showCurrency=false) => {
    if (showCurrency) {
      return `${amount?.toLocaleString()} FCFA`;
    }
    return `${amount?.toLocaleString()}`;
  };
  
  export const formatPhoneNumber = (number) => {
    // Format phone number to display format
    return number?.replace(/(\+237)(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  };
  
  export const getProviderIcon = (provider) => {
    const providers = {
      orange: '🍊',
      mtn: '📱',
      default: '💳',
    };
    return providers[provider] || providers.default;
  };

  
  export const getClassName = (category) => {
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

  export const getClassIcon = (category) => {
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
  
  export const getCategoryColor = (category) => {
    const colors = {
      // revenue: '#4CAF50',
      revenu: '#F4FFF5',
      // transfer: '#FF9800',
      virement: '#FFF8F0',
      // expense: '#F44336',
      depense: '#FFF3F4',
    };
    return colors[category] || '#9E9E9E';
  };
  
  export const getCategoryTextColor = (category) => {
    const colors = {
      revenu: '#28A85C',
      virement: '#FF8300',
      depense: '#F60419',
    };
    return colors[category] || '#9E9E9E';
  };
  
  export const getCategoryBackgroundColor = (category) => {
    const colors = {
      revenue: '#E8F5E8',
      transfer: '#FFF3E0',
      expense: '#FFEBEE',
    };
    return colors[category] || '#F5F5F5';
  };
  
  export const getTransactionIcon = (type) => {
    const icons = {
      incoming_transfer: '↙️',
      outgoing_transfer: '↗️',
      withdrawal: '🔄',
      deposit: '🔄',
      mobile_payment: '📱',
      phone_credit: '📞',
    };
    return icons[type] || '💳';
  };