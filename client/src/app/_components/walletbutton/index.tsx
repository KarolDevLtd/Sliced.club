"use client";
import React, { useEffect, useState } from "react";
import { useWallet } from "../../../providers/walletprovider";
import "react-toastify/dist/ReactToastify.css";

export const WalletButton = () => {
  const { walletAddress, connectWallet, disconnectWallet } = useWallet();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  async function hanldeWalletConnect() {
    try {
      await connectWallet();
    } catch (err) {
      console.log(err as string);
    }
  }

  async function hanldeWalletDisconnect() {
    try {
      disconnectWallet();
    } catch (err) {
      console.log(err as string);
    }
  }

  return (
    <>
      {isClient && (
        <div className="flex items-center md:ml-12">
          {walletAddress ? (
            <button
              onClick={() => hanldeWalletDisconnect()}
              className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-3 text-base font-medium text-white hover:bg-indigo-700 md:px-5 md:py-2 "
            >
              {walletAddress}
            </button>
          ) : (
            <button
              onClick={() => hanldeWalletConnect()}
              className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white hover:bg-indigo-700 md:px-5 md:py-2 "
            >
              Connect Wallet
            </button>
          )}
        </div>
      )}
    </>
  );
};
