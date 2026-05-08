'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { analyzeRugpull, ApiError } from '@/app/api/client';

export default function RugpullPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [tokenContract, setTokenContract] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please upload a CSV file');
      return;
    }

    if (!tokenContract.trim()) {
      setError('Please enter a token contract address');
      return;
    }

    setLoading(true);

    try {
      const result = await analyzeRugpull(
        file,
        tokenContract,
        startDate || undefined,
        endDate || undefined
      );

      // Store result in sessionStorage
      sessionStorage.setItem('rugpull_result', JSON.stringify(result));

      // Navigate to visualization page
      router.push('/visualization');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Error: ${err.message}`);
      } else if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-purple-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Glass container */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
          {/* Header */}
          <div className="mb-10">
            <motion.h1
              className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Rugpull Detection
            </motion.h1>
            <motion.p
              className="text-gray-300 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Upload transaction data and analyze for potential rugpull patterns
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* File Upload */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-semibold text-white mb-3">
                Transaction Data (CSV) *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="bg-white/5 border-2 border-dashed border-purple-400/30 rounded-xl p-8 text-center hover:border-purple-400/50 transition-colors duration-300 disabled:opacity-50">
                  <div className="text-gray-300">
                    {file ? (
                      <div>
                        <p className="font-semibold text-white mb-1">{file.name}</p>
                        <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-white mb-1">Click to upload CSV</p>
                        <p className="text-sm text-gray-400">or drag and drop</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Token Contract */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-semibold text-white mb-3">
                Token Contract Address *
              </label>
              <input
                type="text"
                value={tokenContract}
                onChange={(e) => {
                  setTokenContract(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                placeholder="0x..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300 disabled:opacity-50"
              />
            </motion.div>

            {/* Start Date */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-semibold text-white mb-3">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300 disabled:opacity-50"
              />
            </motion.div>

            {/* End Date */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-semibold text-white mb-3">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300 disabled:opacity-50"
              />
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 border border-purple-400/50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                  />
                  Analyzing...
                </span>
              ) : (
                'Execute Analysis'
              )}
            </motion.button>
          </form>

          {/* Info text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center text-gray-400 text-sm mt-8"
          >
            Your data is processed securely and analyzed in real-time
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
