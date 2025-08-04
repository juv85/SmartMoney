export const formatCurrency = (amount, showCurrency=false) => {
    if (showCurrency) {
      return `${amount.toLocaleString()} FCFA`;
    }
    return `${amount.toLocaleString()}`;
  };
  
  export const formatPhoneNumber = (number) => {
    // Format phone number to display format
    return number.replace(/(\+237)(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  };
  
  export const getProviderIcon = (provider) => {
    const providers = {
      orange: '🍊',
      mtn: '📱',
      default: '💳',
    };
    return providers[provider] || providers.default;
  };
  
  export const getCategoryColor = (category) => {
    const colors = {
      // revenue: '#4CAF50',
      revenue: '#F4FFF5',
      // transfer: '#FF9800',
      transfer: '#FFF8F0',
      // expense: '#F44336',
      expense: '#FFF3F4',
    };
    return colors[category] || '#9E9E9E';
  };
  
  export const getCategoryTextColor = (category) => {
    const colors = {
      revenue: '#28A85C',
      transfer: '#FF8300',
      expense: '#F60419',
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