/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

"use client";
import React, { useEffect, useState } from "react";
const LOCAL_STORAGE_KEY = "MINA";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mina: any;
  }
}

function Nabar() {
  return <WalletButton />;
}

function getWalletAddress() {
  if (typeof window !== "undefined") {
    const value = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (value === null) return;
    return JSON.parse(value);
  }
}

export const WalletButton = () => {
  const [isClient, setIsClient] = useState(false);
  const [displayedAddress, updateDisplayAddress] = useState<string | null>(
    getWalletAddress(),
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  async function connectWallet() {
    const accounts = await window.mina.requestAccounts();
    const displayAddress = `${accounts[0].slice(0, 6)}...${accounts[0].slice(
      -4,
    )}`;
    updateWalletUI(displayAddress);
  }

  async function disconnectWallet() {
    updateWalletUI(null);
  }

  function updateWalletUI(displayAddress: any) {
    if (displayAddress !== null) {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(displayAddress),
      );
    } else {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    updateDisplayAddress(displayAddress);
  }

  return (
    <>
      {isClient && (
        <div className="flex items-center md:ml-12">
          {displayedAddress ? (
            <button
              onClick={() => disconnectWallet()}
              className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-3 text-base font-medium text-white hover:bg-indigo-700 md:px-5 md:py-2 "
            >
              {displayedAddress}
            </button>
          ) : (
            <button
              onClick={() => connectWallet()}
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

export default Nabar;
