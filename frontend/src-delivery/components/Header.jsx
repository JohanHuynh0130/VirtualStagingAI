import React from 'react';
import { Download, MapPin, User } from 'lucide-react';

const Header = ({ project, onDownloadAll }) => {
    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-heading uppercase tracking-wide">
                            {project.name || "Untitled Project"}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-sans">
                            {project.address && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    <span>{project.address}</span>
                                </div>
                            )}
                            {project.client && (
                                <div className="flex items-center gap-1.5">
                                    <User className="w-4 h-4" />
                                    <span>{project.client}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={onDownloadAll}
                        aria-label="download-btn"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4F46E5] hover:bg-[#4338ca] text-white text-sm font-medium rounded-none transition-colors shadow-sm cursor-pointer uppercase tracking-wider font-sans"
                    >
                        <Download className="w-4 h-4" />
                        Download All
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
