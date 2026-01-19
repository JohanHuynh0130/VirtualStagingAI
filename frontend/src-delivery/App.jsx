import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PhotoSection from './components/PhotoSection';
import PricingCTA from './components/PricingCTA';
import PurchaseModal from './components/PurchaseModal';
import { Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function App() {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const pathSegments = window.location.pathname.split('/');
                const id = pathSegments[pathSegments.length - 1];

                if (!id) throw new Error("No project ID found in URL");

                const res = await fetch(`/api/projects/${id}`);
                if (!res.ok) throw new Error("Project not found");

                const data = await res.json();
                const rooms = [];
                const originalFiles = data.files.filter(f => f.type === 'original');
                const resultFiles = data.files.filter(f => f.type === 'result');

                resultFiles.forEach((resFile, index) => {
                    let originalUrl = null;
                    try {
                        const meta = JSON.parse(resFile.metadata || '{}');
                        originalUrl = meta.originalUrl;
                    } catch (e) { }

                    if (!originalUrl && originalFiles.length > 0) {
                        originalUrl = originalFiles[index % originalFiles.length].url;
                    }

                    if (originalUrl) {
                        rooms.push({
                            id: resFile.id,
                            roomName: `Room ${index + 1}`,
                            before: originalUrl,
                            after: resFile.url
                        });
                    }
                });

                if (rooms.length === 0 && resultFiles.length > 0) {
                    resultFiles.forEach((resFile, i) => {
                        rooms.push({
                            id: resFile.id,
                            roomName: `Staged Room ${i + 1}`,
                            before: resFile.url,
                            after: resFile.url
                        });
                    });
                }

                setProject({
                    ...data.project,
                    rooms: rooms
                });

            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, []);

    const handleDownloadAll = async () => {
        console.log("Download All clicked");
        if (!project) {
            alert("Project data missing or not loaded.");
            return;
        }
        if (!project.rooms || project.rooms.length === 0) {
            alert("No photos to download. Project rooms list is empty.");
            console.log("Project state:", project);
            return;
        }

        try {
            const btn = document.querySelector('button[aria-label="download-btn"]');
            const originalText = btn ? btn.textContent : "Download All";
            if (btn) btn.textContent = "Zipping...";

            const zip = new JSZip();
            const completedFolder = zip.folder("Completed");

            let count = 0;
            const promises = project.rooms.map(async (room, index) => {
                try {
                    console.log("Fetching:", room.after);
                    const response = await fetch(room.after);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                    const blob = await response.blob();

                    const ext = room.after.split('.').pop().split('?')[0] || 'png';
                    const safeRoomName = (room.roomName || `Room_${index}`).replace(/[^a-z0-9]/gi, '_');
                    const filename = `${safeRoomName}_staged.${ext}`;

                    completedFolder.file(filename, blob);
                    count++;
                } catch (error) {
                    console.error("Error downloading file:", room.after, error);
                    alert(`Failed to download image for ${room.roomName}: ${error.message}`);
                }
            });

            await Promise.all(promises);

            if (count === 0) {
                alert("Failed to download any images. Check console for details.");
                if (btn) btn.textContent = originalText;
                return;
            }

            console.log("Generating ZIP...");
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${(project.name || 'Project').replace(/[^a-z0-9]/gi, '_')}_Staged.zip`);
            console.log("ZIP saved.");

            if (btn) btn.textContent = "Downloaded!";
            setTimeout(() => { if (btn) btn.textContent = originalText; }, 2000);

        } catch (e) {
            console.error(e);
            alert("Error creating zip: " + e.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2 font-heading uppercase">Project Not Found</h2>
                    <p>{error || "The project you are looking for does not exist."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20 font-sans text-[#121212]">
            <Header project={project} onDownloadAll={handleDownloadAll} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
                {project.rooms.length > 0 ? (
                    project.rooms.map((room) => (
                        <PhotoSection key={room.id} item={room} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-200">
                        <p className="text-gray-500">No staged images found for this project yet.</p>
                    </div>
                )}
            </main>

            <PricingCTA onOpenModal={() => setIsModalOpen(true)} />

            <PurchaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default App;
