import React, { ReactNode } from "react";
import { TRPCReactProvider } from "~/trpc/react";
import { WalletProvider } from "./WalletProvider";

interface Props {
  children?: ReactNode;
  // any props that come into the component
}

function Providers({ children, ...props }: Props) {
  return (
    <WalletProvider>
      <TRPCReactProvider>{children}</TRPCReactProvider>;
    </WalletProvider>
  );
}

export default Providers;
