import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

// Cache to store API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useDataFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    enabled = true,
    cacheKey = url,
    cacheTime = CACHE_DURATION,
    refetchOnMount = false,
    ...fetchOptions
  } = options;

  const fetchData = useCallback(async () => {
    // if (!enabled) return;

    // // Check cache first
    // const cachedData = cache.get(cacheKey);
    // if (cachedData && Date.now() - cachedData.timestamp < cacheTime) {
    //   setData(cachedData.data);
    //   return;
    // }

    // setLoading(true);
    // setError(null);

    // try {
    //   const response = await api.get(url, fetchOptions);
    //   const responseData = response.data;

    //   // Cache the response
    //   cache.set(cacheKey, {
    //     data: responseData,
    //     timestamp: Date.now()
    //   });

    //   setData(responseData);
    // } catch (err) {
    //   const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data';
    //   setError(errorMessage);
    // } finally {
    //   setLoading(false);
    // }
  }, [url, enabled, cacheKey, cacheTime, fetchOptions]);

  const refetch = useCallback(() => {
    // Clear cache for this key
    cache.delete(cacheKey);
    fetchData();
  }, [cacheKey, fetchData]);

  const clearCache = useCallback(() => {
    cache.delete(cacheKey);
  }, [cacheKey]);

  useEffect(() => {
    if (refetchOnMount || !cache.has(cacheKey)) {
      fetchData();
    } else {
      // Use cached data
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        setData(cachedData.data);
      }
    }
  }, [fetchData, refetchOnMount, cacheKey]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache
  };
};

// Utility function to clear all cache
export const clearAllCache = () => {
  cache.clear();
};

// Utility function to clear cache by pattern
export const clearCacheByPattern = (pattern) => {
  const regex = new RegExp(pattern);
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
};

export default useDataFetch;
