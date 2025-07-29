import { useEffect, useState } from 'react';
import { PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';

interface PayPalProviderWrapperProps {
  children: React.ReactNode;
  clientId: string;
}

const PayPalScriptLoader = ({ children }: { children: React.ReactNode }) => {
  const [{ isResolved, isRejected, isPending }] = usePayPalScriptReducer();
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (isRejected) {
      console.error('PayPal script failed to load');
    }
  }, [isRejected]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-sm text-gray-600">PayPal wird geladen...</span>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">
          PayPal konnte nicht geladen werden. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.
        </p>
        <button
          onClick={() => setRetryKey(prev => prev + 1)}
          className="mt-2 text-sm text-red-700 underline hover:text-red-800"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (isResolved) {
    return <>{children}</>;
  }

  return null;
};

const PayPalProviderWrapper = ({ children, clientId }: PayPalProviderWrapperProps) => {
  const [scriptOptions] = useState({
    clientId,
    currency: "EUR",
    intent: "capture",
    components: "buttons",
    locale: "de_DE",
    dataNamespace: "paypal_sdk",
    enableFunding: "paypal",
    disableFunding: "paylater,venmo",
  });

  return (
    <PayPalScriptProvider options={scriptOptions}>
      <PayPalScriptLoader>
        {children}
      </PayPalScriptLoader>
    </PayPalScriptProvider>
  );
};

export default PayPalProviderWrapper;
