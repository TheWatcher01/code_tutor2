// File path: frontend/src/api/swr.config.js

import { SWRConfig } from "swr";
import PropTypes from "prop-types";

// Custom fetcher function that uses the Fetch API to retrieve data and parse it as JSON
const fetcher = (...args) => fetch(...args).then((res) => res.json());

// SwrProvider component that wraps its children with SWRConfig for global SWR settings
export const SwrProvider = ({ children }) => {
  return (
    <SWRConfig
      value={{
        fetcher, // Assigning the custom fetcher function for data fetching
        revalidateOnFocus: true, // Revalidate data when the window regains focus
        revalidateOnReconnect: true, // Revalidate data when the browser reconnects to the internet
        dedupingInterval: 2000, // Time interval in milliseconds to deduplicate requests
        errorRetryCount: 3, // Number of times to retry fetching data on error
        shouldRetryOnError: true, // Whether to retry fetching on error
      }}
    >
      {children} {/* Passing the children prop to the wrapped component */}
    </SWRConfig>
  );
};

// Props validation using PropTypes to ensure children is a required node
SwrProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
