/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// providers/WalletProvider.tsx
"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Define the type for the context value
interface WalletContextType {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

//TODO: extract into seperate file for global variables?
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mina: any;
  }
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Custom hook to use the wallet context
export const useWallet = (): WalletContextType => {
  try {
    const context = useContext(WalletContext);
    if (!context) {
      throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
  } catch (err) {
    throw err;
  }
};

// Define props interface for WalletProvider component
interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const LOCAL_STORAGE_KEY = "MINA";

  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Function to connect wallet
  const connectWallet = async () => {
    try {
      const accounts = await window.mina.requestAccounts();
      const displayAddress = `${accounts[0].slice(0, 6)}...${accounts[0].slice(
        -4,
      )}`;
      updateWalletUI(displayAddress);
    } catch (err) {
      throw err;
    }
  };

  // Function to disconnect wallet
  const disconnectWallet = () => {
    try {
      updateWalletUI(null);
    } catch (err) {
      throw err;
    }
  };

  // Function to update wallet UI
  const updateWalletUI = (address: string | null) => {
    if (address !== null) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(address));
      setIsConnected(true);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setIsConnected(false);
    }
    setWalletAddress(address);
  };

  // useEffect to initialize wallet address
  useEffect(() => {
    const address = getWalletAddress();
    setWalletAddress(address);
  }, [isConnected]);

  // Function to get wallet address from local storage
  const getWalletAddress = (): string | null => {
    try {
      if (typeof window !== "undefined") {
        const value = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (value !== null) {
          return JSON.parse(value);
        }
      }
      return null;
    } catch (err) {
      throw err;
    }
  };

  // Value to be provided by the context
  const value: WalletContextType = {
    walletAddress,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
