// File path:

import { SWRConfig } from "swr";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export const SwrProvider = ({ children }) => {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        errorRetryCount: 3,
        shouldRetryOnError: true,
      }}
    >
      {children}
    </SWRConfig>
  );
};
