import React, { useState } from 'react';
import { X, Upload, ArrowRight, Check, Image as ImageIcon, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PurchaseModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState([]);
    const [style, setStyle] = useState('');
    const [comments, setComments] = useState('');
    // Quantity is derived from files.length

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles([...files, ...newFiles]);
        }
    };

    const handleNext = () => setStep((p) => p + 1);
    const handleBack = () => setStep((p) => p - 1);

    const handleCheckout = () => {
        const variantId = '51674648543548';
        // Strict Sync: Quantity = Number of Uploaded Files
        const finalQuantity = Math.max(1, files.length);
        const checkoutUrl = `https://bellastaging.myshopify.com/cart/${variantId}:${finalQuantity}`;
        window.location.href = checkoutUrl;
    };

    const styles = [
        "Modern", "Scandinavian", "Industrial",
        "Bohemian", "Traditional", "Farmhouse"
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] rounded-none"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        {step > 1 && (
                            <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h2 className="text-xl font-bold text-gray-900 font-heading uppercase tracking-wide">
                            {step === 1 && "Upload Photos"}
                            {step === 2 && "Select Style"}
                            {step === 3 && "Additional Comments"}
                            {step === 4 && "Confirm & Checkout"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="h-1 bg-gray-100 w-full">
                    <div
                        className="h-full bg-[#4F46E5] transition-all duration-300 ease-out"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="border-2 border-dashed border-gray-300 p-10 hover:border-[#4F46E5] hover:bg-indigo-50/30 transition-colors text-center cursor-pointer relative">
                                    <input
                                        type="file"
                                        multiple
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                    <div className="w-16 h-16 bg-indigo-50 text-[#4F46E5] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 font-heading uppercase">Upload Images</h3>
                                    <p className="text-gray-500 mt-1">JPG, PNG supported</p>
                                </div>
                                {files.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Selected Files ({files.length})</h4>
                                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                            {files.map((file, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 text-sm">
                                                    <div className="w-8 h-8 bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                                                        <ImageIcon className="w-4 h-4" />
                                                    </div>
                                                    <span className="truncate flex-1 text-gray-700">{file.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-2 gap-3"
                            >
                                {styles.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStyle(s)}
                                        className={`p-4 border text-left transition-all relative overflow-hidden ${style === s
                                                ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] ring-1 ring-[#4F46E5]'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        <span className="font-medium font-heading uppercase text-sm">{s}</span>
                                        {style === s && (
                                            <div className="absolute top-2 right-2 text-[#4F46E5]">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <p className="text-sm text-gray-600 mb-2 font-medium uppercase">Instructions</p>
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    className="w-full h-40 p-4 bg-gray-50 border border-gray-200 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none resize-none transition-all rounded-none"
                                    placeholder="Tell us about your vision..."
                                />
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-gray-50 p-6 space-y-4 border border-gray-100">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Style</span>
                                        <span className="font-medium text-gray-900 uppercase">{style || "None"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Photos</span>
                                        <span className="font-medium text-gray-900">{files.length}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-center p-4 bg-indigo-50/50 border border-indigo-100">
                                    <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">Total to Pay</label>
                                    <div className="text-3xl font-bold text-[#4F46E5] font-heading">
                                        ${files.length * 10}
                                    </div>
                                    <p className="text-xs text-gray-500">Based on {files.length} photos at $10/each</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-6 border-t border-gray-100">
                    <button
                        onClick={step === 4 ? handleCheckout : handleNext}
                        disabled={step === 1 && files.length === 0}
                        className="w-full py-4 bg-[#4F46E5] hover:bg-[#4338ca] text-white font-medium shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 uppercase tracking-wider rounded-none text-sm"
                    >
                        {step === 4 ? (
                            <>
                                Checkout
                                <ArrowRight className="w-5 h-5" />
                            </>
                        ) : (
                            "Continue"
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PurchaseModal;
