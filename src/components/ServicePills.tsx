import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

const OPTIONS = ['Brand', 'Digital', 'Campaign', 'Other'];

/**
 * Multi-select service pills with spring checkmarks and contingent feedback status banner.
 */
export function ServicePills(): React.JSX.Element {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (srv: string): void => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((item) => item !== srv) : [...prev, srv]
    );
  };

  return (
    <div className="w-full max-w-2xl mt-2">
      <h2 className="text-2xl font-medium tracking-tight mb-2 text-black">
        What sort of service?
      </h2>
      <p className="opacity-85 text-[#738273] mb-8 font-normal">
        Select all that apply
      </p>

      <div className="flex flex-wrap gap-3 mb-8">
        {OPTIONS.map((srv) => {
          const isActive = selectedServices.includes(srv);
          return (
            <motion.button
              key={srv}
              onClick={() => toggleService(srv)}
              whileTap={{ scale: 0.96 }}
              className={`px-6 py-3 rounded-full flex items-center justify-center font-medium text-base transition-colors focus:outline-none ${
                isActive
                  ? 'bg-[#1C2E1E] text-white shadow-md shadow-emerald-950/5 transform'
                  : 'bg-white text-[#1C2E1E] border border-[#F1F3F1] hover:bg-[#F1F3F1]/55'
              }`}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    initial={{ scale: 0, width: 0, opacity: 0 }}
                    animate={{ scale: 1, width: 'auto', opacity: 1 }}
                    exit={{ scale: 0, width: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="inline-flex items-center overflow-hidden mr-2 shrink-0"
                  >
                    <Check className="w-4 h-4" />
                  </motion.span>
                )}
              </AnimatePresence>
              <span>{srv}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Contingent Feedback Status Banner */}
      <div className="min-h-[60px] flex items-center">
        <AnimatePresence mode="wait">
          {selectedServices.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="italic text-xs text-[#1C2E1E]"
            >
              Please click to select services above.
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full bg-[#FAFBF9] border border-[#EBECE9] rounded-2xl p-4 sm:p-5 flex flex-row justify-between items-center overflow-hidden shadow-sm"
            >
              <span className="text-sm font-medium text-[#1C2E1E]">
                Ready to inquire about: {selectedServices.join(', ')}
              </span>
              <button className="flex items-center gap-1.5 text-[#4D6D47] uppercase text-xs font-semibold hover:opacity-75 transition-opacity">
                <span>Let&apos;s Go</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
