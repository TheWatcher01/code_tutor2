// File path: frontend/src/api/swr.config.js

import { SWRConfig } from "swr";
import PropTypes from "prop-types";

// Custom fetcher function to handle API requests and parse JSON responses
const fetcher = (...args) => fetch(...args).then((res) => res.json());

// Provider component to wrap the application with SWR configuration
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

// Defining prop types for the SwrProvider component
SwrProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
