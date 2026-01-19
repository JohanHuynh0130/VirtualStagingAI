import React from 'react';
import { ShoppingCart, Sparkles } from 'lucide-react';

const PricingCTA = ({ onOpenModal }) => {
    return (
        <div className="sticky bottom-6 z-40 mx-auto max-w-lg px-4 font-sans">
            <div className="bg-[#121212] text-white shadow-xl p-1 pr-2 flex items-center justify-between gap-4 overflow-hidden backdrop-blur-lg bg-opacity-95 rounded-none border border-gray-800">
                <div className="flex items-center gap-3 pl-4 py-3">
                    <div className="bg-[#4F46E5]/20 p-2 text-[#4F46E5]">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm uppercase tracking-wide">Need more angles?</p>
                        <p className="text-xs text-gray-400">Get additional photos for <span className="text-white font-bold">$10/photo</span></p>
                    </div>
                </div>
                <button
                    onClick={onOpenModal}
                    className="flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338ca] text-white px-6 py-3 font-medium text-sm transition-all shadow-lg shadow-indigo-900/20 cursor-pointer uppercase tracking-wider rounded-none"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default PricingCTA;
