import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import ComparisonSlider from './ComparisonSlider';

const PhotoSection = ({ item }) => {
    const [comment, setComment] = useState('');
    const [savedComments, setSavedComments] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setSavedComments([...savedComments, { text: comment, date: new Date() }]);
        setComment('');
    };

    return (
        <div className="bg-white shadow-sm border border-gray-100 overflow-hidden rounded-none">
            <div className="p-4 sm:p-6 pb-2">
                <h3 className="text-lg font-bold text-gray-900 mb-4 font-heading uppercase tracking-wide">{item.roomName}</h3>
                <ComparisonSlider
                    beforeImage={item.before}
                    afterImage={item.after}
                    alt={item.roomName}
                />
            </div>

            <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-indigo-50 text-[#4F46E5] rounded-none">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Feedback & Comments</h4>

                        {savedComments.length > 0 && (
                            <div className="space-y-3 mb-4">
                                {savedComments.map((c, i) => (
                                    <div key={i} className="bg-white p-3 border border-gray-200 text-sm text-gray-700 shadow-sm rounded-none">
                                        {c.text}
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="relative group">
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add specific comments for this room..."
                                className="w-full px-4 py-3 pr-12 text-sm bg-white border border-gray-200 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none transition-all rounded-none"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#4F46E5] transition-colors disabled:opacity-50"
                                disabled={!comment.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoSection;
