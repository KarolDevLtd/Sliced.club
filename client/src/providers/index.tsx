import React, { ReactNode } from "react";
import { TRPCReactProvider } from "~/trpc/react";

interface Props {
  children?: ReactNode;
  // any props that come into the component
}

function Providers({ children, ...props }: Props) {
  return <TRPCReactProvider>{children}</TRPCReactProvider>;
}

export default Providers;
