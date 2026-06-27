import razorpay from 'razorpay';

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys are not configured');
  }

  return new razorpay({
    key_id,
    key_secret,
  });
};
 
export const createOrder = async (amount, currency, receipt) => {
  try {
    const instance = getRazorpayInstance();
    const options = {
      amount: amount,
      currency: currency,
      receipt: receipt,
    };
    const order = await instance.orders.create(options);
    return order;
  } catch (error) {
    throw new Error("Failed to create Razorpay order: " + error.message);
  }
};