// File path: frontend/src/api/swr.config.js

import { SWRConfig } from "swr";
import PropTypes from "prop-types";

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

// Props validation using PropTypes
SwrProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
