export const sendWhatsAppMessage = (phone: string, message: string) => {
  // Remove any non-numeric characters from phone
  const cleanPhone = phone.replace(/\D/g, '');
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  // Open WhatsApp with prefilled message
  window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
};

export const getRecallMessage = (customerName: string) => {
  return `Hello ${customerName}, this is a reminder from Vision Point. Your optical product is due for a check-up. Please visit our store at your convenience.`;
};

export const getBirthdayMessage = (customerName: string) => {
  return `Happy Birthday ${customerName}! 🎉 Team Vision Point wishes you a wonderful day filled with joy and great vision!`;
};

export const getStatusMessage = (customerName: string, status: string) => {
  switch (status) {
    case 'Pending':
      return `Hello ${customerName}, your order at Vision Point is being processed. We'll notify you once it's ready for pickup.`;
    case 'Ready':
      return `Hello ${customerName}, great news! Your order at Vision Point is ready for pickup. Please visit our store at your convenience.`;
    case 'Completed':
      return `Thank you ${customerName} for choosing Vision Point! We hope you're enjoying your new eyewear. Feel free to reach out if you need any assistance.`;
    default:
      return `Hello ${customerName}, this is a message from Vision Point regarding your order.`;
  }
};
