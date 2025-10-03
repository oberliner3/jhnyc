"use client";

import { useState, useEffect } from "react";
import { getCacheStats } from "@/lib/redis";

interface PerformanceMetrics {
  totalRequests: number;
  msgpackRequests: number;
  jsonRequests: number;
  totalBytesSaved: number;
  averageCompressionRatio: number;
  cacheHitRate: number;
  externalApiLatency: number;
  circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  errorRate: number;
}

interface CacheMetrics {
  totalKeys: number;
  productKeys: number;
  collectionKeys: number;
  searchKeys: number;
}

export function MessagePackMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalRequests: 0,
    msgpackRequests: 0,
    jsonRequests: 0,
    totalBytesSaved: 0,
    averageCompressionRatio: 0,
    cacheHitRate: 0,
    externalApiLatency: 0,
    circuitBreakerState: 'CLOSED',
    errorRate: 0,
  });

  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics>({
    totalKeys: 0,
    productKeys: 0,
    collectionKeys: 0,
    searchKeys: 0,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if monitoring is enabled
    const isEnabled = localStorage.getItem('msgpack_monitor') === 'true';
    setIsVisible(isEnabled);

    if (!isEnabled) return;

    const updateMetrics = async () => {
      try {
        // Get cache stats
        const cacheStats = await getCacheStats();
        setCacheMetrics(cacheStats);

        // Get performance metrics from localStorage (set by API calls)
        const storedMetrics = localStorage.getItem('msgpack_metrics');
        if (storedMetrics) {
          const parsed = JSON.parse(storedMetrics);
          setMetrics(prev => ({
            ...prev,
            ...parsed,
            cacheHitRate: parsed.cacheHits / (parsed.cacheHits + parsed.cacheMisses) * 100 || 0,
          }));
        }
      } catch (error) {
        console.error('Failed to update metrics:', error);
      }
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const clearMetrics = () => {
    localStorage.removeItem('msgpack_metrics');
    setMetrics({
      totalRequests: 0,
      msgpackRequests: 0,
      jsonRequests: 0,
      totalBytesSaved: 0,
      averageCompressionRatio: 0,
      cacheHitRate: 0,
      externalApiLatency: 0,
      circuitBreakerState: 'CLOSED',
      errorRate: 0,
    });
  };

  const refreshMetrics = () => {
    // Trigger a refresh by updating localStorage
    localStorage.setItem('msgpack_refresh', Date.now().toString());
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">Performance Monitor</h3>
        <div className="flex gap-1">
          <button
            onClick={refreshMetrics}
            className="p-1 hover:bg-gray-100 rounded text-xs"
            title="Refresh"
          >
            🔄
          </button>
          <button
            onClick={clearMetrics}
            className="p-1 hover:bg-gray-100 rounded text-xs"
            title="Clear"
          >
            🗑️
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-100 rounded text-xs"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* MessagePack Metrics */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>MessagePack Usage:</span>
          <span className="font-mono">
            {metrics.msgpackRequests}/{metrics.totalRequests}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Compression Ratio:</span>
          <span className="font-mono">{metrics.averageCompressionRatio.toFixed(2)}x</span>
        </div>
        <div className="flex justify-between">
          <span>Bytes Saved:</span>
          <span className="font-mono">{(metrics.totalBytesSaved / 1024).toFixed(1)} KB</span>
        </div>
        <div className="flex justify-between">
          <span>Error Rate:</span>
          <span className="font-mono">{metrics.errorRate.toFixed(1)}%</span>
        </div>
      </div>

      {/* Redis Cache Metrics */}
      <div className="mt-3 pt-2 border-t">
        <h4 className="font-medium text-xs text-gray-600 mb-2">Redis Cache</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Total Keys:</span>
            <span className="font-mono">{cacheMetrics.totalKeys}</span>
          </div>
          <div className="flex justify-between">
            <span>Products:</span>
            <span className="font-mono">{cacheMetrics.productKeys}</span>
          </div>
          <div className="flex justify-between">
            <span>Collections:</span>
            <span className="font-mono">{cacheMetrics.collectionKeys}</span>
          </div>
          <div className="flex justify-between">
            <span>Search:</span>
            <span className="font-mono">{cacheMetrics.searchKeys}</span>
          </div>
          <div className="flex justify-between">
            <span>Hit Rate:</span>
            <span className="font-mono">{metrics.cacheHitRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Circuit Breaker Status */}
      <div className="mt-3 pt-2 border-t">
        <div className="flex justify-between items-center text-xs">
          <span>Circuit Breaker:</span>
          <span className={`font-mono px-2 py-1 rounded text-xs ${
            metrics.circuitBreakerState === 'CLOSED' ? 'bg-green-100 text-green-800' :
            metrics.circuitBreakerState === 'OPEN' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {metrics.circuitBreakerState}
          </span>
        </div>
      </div>

      {/* API Latency */}
      <div className="mt-3 pt-2 border-t">
        <div className="flex justify-between text-xs">
          <span>Avg Latency:</span>
          <span className="font-mono">{metrics.externalApiLatency.toFixed(0)}ms</span>
        </div>
      </div>
    </div>
  );
}

export function useMessagePackMonitor() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const enabled = localStorage.getItem('msgpack_monitor') === 'true';
    setIsEnabled(enabled);
  }, []);

  const enable = () => {
    localStorage.setItem('msgpack_monitor', 'true');
    setIsEnabled(true);
  };

  const disable = () => {
    localStorage.setItem('msgpack_monitor', 'false');
    setIsEnabled(false);
  };

  return {
    isEnabled,
    enable,
    disable,
  };
}
