// Virtual Staging - SaaS Version
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('projectId');

if (!projectId) {
    window.location.href = '/dashboard.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    // ========== UI Elements ==========
    const dropZone = document.getElementById('drop-zone');
    const uploadInput = document.getElementById('image-upload');
    const configSection = document.getElementById('config-section');
    const imageQueue = document.getElementById('image-queue');
    const imageCount = document.getElementById('image-count');
    const stageSection = document.getElementById('stage-section');
    const stageBtn = document.getElementById('stage-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const resultsSection = document.getElementById('results-section');
    const resultsGallery = document.getElementById('results-gallery');
    const downloadAllBtn = document.getElementById('download-all-btn');

    // Settings & CSV
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const settingsBackdrop = document.getElementById('settings-backdrop');
    const closeSettings = document.getElementById('close-settings');
    const saveSettings = document.getElementById('save-settings');
    const systemPromptInput = document.getElementById('system-prompt');
    const csvUploadBtn = document.getElementById('csv-upload-btn');
    const csvUpload = document.getElementById('csv-upload');
    const csvStatus = document.getElementById('csv-status');

    // ========== State ==========
    let imageFiles = [];
    let allFurnitureSets = [];
    let stagedResults = [];
    const roomTypes = ['Living Room', 'Bedroom', 'Dining Room', 'Kitchen', 'Bathroom', 'Office'];

    // Load saved system prompt
    if (systemPromptInput) {
        systemPromptInput.value = localStorage.getItem('systemPrompt') || '';
    }

    // ========== Fetch Furniture from API ==========
    try {
        const fRes = await fetch('/api/furniture');
        if (fRes.ok) {
            allFurnitureSets = await fRes.json();
            allFurnitureSets = allFurnitureSets.map(s => ({
                ...s,
                name: s.external_id || s.name,
                imageUrl: s.url
            }));
            if (csvStatus) csvStatus.textContent = `${allFurnitureSets.length} furniture sets loaded`;
        }
    } catch (e) {
        console.error("Failed to fetch furniture", e);
    }

    // ========== Modal Handlers ==========
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
        if (settingsBackdrop) settingsBackdrop.addEventListener('click', () => settingsModal.classList.add('hidden'));
        if (closeSettings) closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));
        if (saveSettings) saveSettings.addEventListener('click', () => {
            localStorage.setItem('systemPrompt', systemPromptInput.value);
            settingsModal.classList.add('hidden');
        });
    }

    // ========== CSV Upload ==========
    if (csvUploadBtn && csvUpload) {
        csvUploadBtn.addEventListener('click', () => csvUpload.click());
        csvUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const csv = event.target.result;
                    allFurnitureSets = parseCSV(csv);
                    if (csvStatus) csvStatus.textContent = `${allFurnitureSets.length} sets loaded from CSV`;
                    if (imageFiles.length > 0) renderImageQueue();
                };
                reader.readAsText(file);
            }
        });
    }

    function parseCSV(csv) {
        const lines = csv.trim().split(/\r?\n/);
        return lines.slice(1).map(line => {
            const parts = line.split(',');
            if (parts.length >= 2) {
                return { name: parts[0].trim(), imageUrl: parts.slice(1).join(',').trim() };
            }
            return null;
        }).filter(x => x);
    }

    // ========== Load Project Data ==========
    await loadProject();

    async function loadProject() {
        try {
            const res = await fetch(`/api/projects/${projectId}`);
            if (!res.ok) throw new Error('Failed to load');
            const data = await res.json();
            const { files } = data;

            stagedResults = [];
            files.filter(f => f.type === 'result').forEach(f => {
                let meta = {};
                try { meta = JSON.parse(f.metadata || '{}'); } catch (e) { }
                stagedResults.push({
                    success: true,
                    id: f.id,
                    staged: f.url,
                    original: meta.originalUrl,
                    originalName: 'Staged Image',
                    furnitureSet: meta.furnitureSet || '',
                    roomType: meta.roomType || ''
                });
            });

            if (stagedResults.length > 0) {
                resultsSection.classList.remove('hidden');
                renderResults();
            }
        } catch (e) {
            console.error(e);
        }
    }

    // ========== File Handling ==========
    dropZone.addEventListener('click', () => uploadInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('border-[#4F46E5]'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('border-[#4F46E5]'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('border-[#4F46E5]');
        handleFiles(e.dataTransfer.files);
    });
    uploadInput.addEventListener('change', e => handleFiles(e.target.files));

    function handleFiles(files) {
        const newImgs = Array.from(files).filter(f => f.type.startsWith('image/'));
        imageFiles = [...imageFiles, ...newImgs];
        renderImageQueue();
    }

    // ========== Render Image Queue ==========
    function renderImageQueue() {
        if (imageFiles.length === 0) {
            configSection.classList.add('hidden');
            stageSection.classList.add('hidden');
            return;
        }
        configSection.classList.remove('hidden');
        stageSection.classList.remove('hidden');
        imageCount.textContent = `${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}`;

        imageQueue.innerHTML = imageFiles.map((file, idx) => {
            const previewUrl = URL.createObjectURL(file);

            return `
                <div class="bg-white border border-gray-100 shadow-sm p-6 rounded-none image-card-row" data-idx="${idx}">
                    <div class="flex gap-6 flex-col lg:flex-row">
                        <div class="shrink-0">
                            <img src="${previewUrl}" alt="${file.name}" class="w-64 h-48 object-cover border border-gray-100 bg-gray-50">
                            <p class="text-xs text-gray-400 mt-2 truncate max-w-[256px] uppercase tracking-wide font-medium">${file.name}</p>
                        </div>
                        
                        <div class="flex-1 space-y-5">
                            <!-- Room Type Selection -->
                            <div>
                                <label class="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Room Type</label>
                                <div class="grid grid-cols-2 gap-2">
                                    ${roomTypes.map(room => `
                                        <label class="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-200 p-2 rounded-md hover:bg-gray-100">
                                            <input type="checkbox" value="${room}" class="room-checkbox accent-[#4F46E5] w-4 h-4">
                                            <span class="text-sm font-medium text-gray-700">${room}</span>
                                        </label>
                                    `).join('')}
                                    <!-- Other Option -->
                                    <label class="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-200 p-2 rounded-md hover:bg-gray-100">
                                        <input type="checkbox" value="Other" class="room-checkbox room-other-checkbox accent-[#4F46E5] w-4 h-4">
                                        <span class="text-sm font-medium text-gray-700">Other</span>
                                    </label>
                                </div>
                                <input type="text" class="room-other-input hidden mt-2 w-full bg-gray-50 border border-gray-200 p-2 text-sm focus:border-[#4F46E5] outline-none" placeholder="Enter custom room type...">
                            </div>

                            <!-- Furniture Set Picker (NO DEFAULT) -->
                            <div>
                                <label class="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Furniture Sets (Select from library)</label>
                                <div class="furniture-container space-y-2">
                                    <div class="selected-furniture-list space-y-2">
                                        <!-- No default - user must pick -->
                                        <p class="text-gray-400 text-xs italic no-furniture-msg">No furniture selected. Click below to add.</p>
                                    </div>
                                    <button type="button" class="furniture-select-btn w-full bg-white border border-dashed border-gray-300 p-2 text-center text-xs font-bold uppercase tracking-wide text-gray-500 hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">
                                        + Add Furniture Set
                                    </button>
                                    <input type="hidden" class="furniture-json" value='[]'>
                                    <input type="hidden" class="furniture-urls-json" value='[]'>
                                </div>
                            </div>

                            <!-- Custom Prompt -->
                            <div>
                                <label class="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Custom Instructions (Optional)</label>
                                <textarea class="custom-prompt w-full h-20 bg-gray-50 border border-gray-200 p-3 text-sm focus:border-[#4F46E5] outline-none transition-colors" placeholder="e.g., Add a large sectional sofa, use warm lighting..."></textarea>
                            </div>
                        </div>

                        <button type="button" class="remove-btn shrink-0 p-3 hover:bg-red-50 rounded-full transition-colors self-start">
                            <svg class="w-5 h-5 text-gray-300 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Bind event listeners
        bindQueueEvents();
    }

    function bindQueueEvents() {
        // Remove image from queue
        imageQueue.querySelectorAll('.remove-btn').forEach((btn, idx) => {
            btn.onclick = () => {
                imageFiles.splice(idx, 1);
                renderImageQueue();
            };
        });

        // Add furniture button
        imageQueue.querySelectorAll('.furniture-select-btn').forEach((btn, idx) => {
            btn.onclick = () => showFurniturePicker(idx);
        });

        // "Other" room type toggle
        imageQueue.querySelectorAll('.room-other-checkbox').forEach(cb => {
            cb.onchange = () => {
                const row = cb.closest('.image-card-row');
                const input = row.querySelector('.room-other-input');
                if (cb.checked) {
                    input.classList.remove('hidden');
                    input.focus();
                } else {
                    input.classList.add('hidden');
                    input.value = '';
                }
            };
        });
    }

    // ========== Furniture Picker Modal ==========
    function showFurniturePicker(imageIdx) {
        const row = imageQueue.querySelectorAll('.image-card-row')[imageIdx];
        const checkedRooms = Array.from(row.querySelectorAll('.room-checkbox:checked')).map(cb => cb.value);

        // Filter furniture by selected rooms
        let filteredSets = allFurnitureSets;
        if (checkedRooms.length > 0 && !checkedRooms.includes('Other')) {
            const prefixes = [];
            if (checkedRooms.includes('Bedroom')) prefixes.push('BDR');
            if (checkedRooms.includes('Living Room')) prefixes.push('LR');
            if (checkedRooms.includes('Dining Room')) prefixes.push('DR');
            if (prefixes.length > 0) {
                filteredSets = allFurnitureSets.filter(s => prefixes.some(p => s.name && s.name.startsWith(p)));
            }
        }
        if (filteredSets.length === 0) filteredSets = allFurnitureSets;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-6';
        modal.innerHTML = `
            <div class="absolute inset-0 bg-white/90 backdrop-blur-md furniture-backdrop"></div>
            <div class="relative bg-white border border-gray-100 shadow-2xl p-8 max-w-5xl w-full max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h3 class="text-2xl font-bold uppercase text-gray-900">Select Furniture</h3>
                        <p class="text-gray-500 text-sm mt-1">Click to add. Showing ${filteredSets.length} sets.</p>
                    </div>
                    <button class="close-furniture p-3 hover:bg-gray-100 rounded-full text-gray-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    ${filteredSets.map(set => `
                        <button class="furniture-option p-4 border border-gray-200 hover:border-[#4F46E5] hover:shadow-lg transition-all text-left group bg-gray-50" data-name="${set.name}" data-url="${set.imageUrl}">
                            <div class="aspect-video bg-white mb-3 overflow-hidden border border-gray-100">
                                <img src="${set.imageUrl}" alt="${set.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23eee%22 width=%22100%22 height=%22100%22/></svg>'">
                            </div>
                            <p class="font-bold text-xs text-gray-900 uppercase tracking-wider truncate">${set.name}</p>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.furniture-backdrop').addEventListener('click', () => modal.remove());
        modal.querySelector('.close-furniture').addEventListener('click', () => modal.remove());

        modal.querySelectorAll('.furniture-option').forEach(option => {
            option.addEventListener('click', () => {
                addFurnitureToRow(imageIdx, option.dataset.name, option.dataset.url);
                modal.remove();
            });
        });
    }

    function addFurnitureToRow(idx, name, url) {
        const row = imageQueue.querySelectorAll('.image-card-row')[idx];
        const list = row.querySelector('.selected-furniture-list');
        const hiddenNames = row.querySelector('.furniture-json');
        const hiddenUrls = row.querySelector('.furniture-urls-json');

        // Remove "no furniture" message
        const noMsg = list.querySelector('.no-furniture-msg');
        if (noMsg) noMsg.remove();

        let currentNames = [];
        let currentUrls = [];
        try { currentNames = JSON.parse(hiddenNames.value); } catch (e) { }
        try { currentUrls = JSON.parse(hiddenUrls.value); } catch (e) { }

        if (!currentNames.includes(name)) {
            currentNames.push(name);
            currentUrls.push(url);
            hiddenNames.value = JSON.stringify(currentNames);
            hiddenUrls.value = JSON.stringify(currentUrls);

            const item = document.createElement('div');
            item.className = 'flex items-center gap-3 bg-gray-50 border border-gray-200 p-2 rounded-md furniture-item';
            item.dataset.name = name;
            item.innerHTML = `
                <img src="${url}" class="w-10 h-10 object-cover border border-gray-200 bg-white" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22><rect fill=%22%23eee%22 width=%2264%22 height=%2264%22/></svg>'">
                <span class="text-sm font-bold text-gray-700 uppercase tracking-wide flex-1">${name}</span>
                <button type="button" class="remove-furniture-item hover:text-red-500 text-gray-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;
            item.querySelector('.remove-furniture-item').addEventListener('click', () => {
                let names = [];
                let urls = [];
                try { names = JSON.parse(hiddenNames.value); } catch (e) { }
                try { urls = JSON.parse(hiddenUrls.value); } catch (e) { }
                const i = names.indexOf(name);
                if (i > -1) {
                    names.splice(i, 1);
                    urls.splice(i, 1);
                }
                hiddenNames.value = JSON.stringify(names);
                hiddenUrls.value = JSON.stringify(urls);
                item.remove();
                // Show "no furniture" message if empty
                if (names.length === 0) {
                    list.innerHTML = '<p class="text-gray-400 text-xs italic no-furniture-msg">No furniture selected. Click below to add.</p>';
                }
            });
            list.appendChild(item);
        }
    }

    // ========== Stage Button Handler ==========
    stageBtn.addEventListener('click', async () => {
        if (imageFiles.length === 0) return;

        stageBtn.disabled = true;
        btnText.textContent = 'Processing...';
        btnSpinner.classList.remove('hidden');
        progressContainer.classList.remove('hidden');
        resultsSection.classList.remove('hidden');

        let processed = 0;

        for (let idx = 0; idx < imageFiles.length; idx++) {
            const file = imageFiles[idx];
            progressText.textContent = `${processed + 1}/${imageFiles.length}`;

            const row = imageQueue.querySelectorAll('.image-card-row')[idx];

            // Get selected room types (multi-select + custom)
            const roomCheckboxes = Array.from(row.querySelectorAll('.room-checkbox:checked')).map(cb => cb.value);
            const customRoomInput = row.querySelector('.room-other-input');
            let roomTypeArr = roomCheckboxes.filter(r => r !== 'Other');
            if (customRoomInput && customRoomInput.value.trim()) {
                roomTypeArr.push(customRoomInput.value.trim());
            }
            const roomType = roomTypeArr.join(', ') || 'Living Room';

            // Get selected furniture names and URLs
            const hiddenNames = row.querySelector('.furniture-json');
            const hiddenUrls = row.querySelector('.furniture-urls-json');
            let furnitureNames = [];
            let furnitureUrls = [];
            try { furnitureNames = JSON.parse(hiddenNames.value); } catch (e) { }
            try { furnitureUrls = JSON.parse(hiddenUrls.value); } catch (e) { }
            const furnitureSet = furnitureNames.join(', ');

            // Get custom prompt
            const customPrompt = row.querySelector('.custom-prompt')?.value || '';

            const formData = new FormData();
            formData.append('image', file);
            formData.append('projectId', projectId);
            formData.append('roomType', roomType);
            formData.append('customPrompt', customPrompt);
            formData.append('furnitureSet', furnitureSet);
            formData.append('furnitureImageUrls', JSON.stringify(furnitureUrls));  // Send URLs as JSON
            formData.append('systemPrompt', systemPromptInput?.value || '');

            try {
                console.log('Sending to /api/stage:', { roomType, furnitureSet, furnitureUrls });
                const res = await fetch('/api/stage', { method: 'POST', body: formData });
                const data = await res.json();
                console.log('Response:', data);

                if (data.success) {
                    stagedResults.unshift({
                        success: true,
                        id: data.id,
                        staged: data.staged,
                        original: data.original,
                        originalName: file.name,
                        roomType,
                        furnitureSet
                    });
                    renderResults();
                } else {
                    console.error('Staging failed:', data.error);
                    alert('Staging failed: ' + (data.error || 'Unknown error'));
                }
            } catch (e) {
                console.error('Fetch error:', e);
                alert('Network error: ' + e.message);
            }

            processed++;
            progressBar.style.width = `${(processed / imageFiles.length) * 100}%`;
        }

        stageBtn.disabled = false;
        btnText.textContent = 'Stage Images';
        btnSpinner.classList.add('hidden');
        imageFiles = [];
        renderImageQueue();
    });

    // ========== Render Results ==========
    function renderResults() {
        resultsGallery.innerHTML = stagedResults.map((res, idx) => `
            <div class="bg-white border border-gray-100 shadow-sm p-4 space-y-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold text-gray-900 uppercase tracking-wide text-sm">${res.originalName || 'Result'}</h3>
                        <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">${res.roomType} • ${res.furnitureSet}</p>
                    </div>
                </div>
                
                <div class="relative w-full overflow-hidden select-none cursor-ew-resize group comparison-slider bg-gray-100" id="slider-${idx}">
                    <img src="${res.staged}" class="block w-full h-auto object-cover pointer-events-none" draggable="false">
                    <div class="absolute inset-0 w-full h-full pointer-events-none before-layer" style="clip-path: inset(0 50% 0 0);">
                        <img src="${res.original}" class="absolute inset-0 w-full h-full object-cover">
                    </div>
                    <div class="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 shadow-[0_0_10px_rgba(0,0,0,0.3)] slider-handle" style="left: 50%;">
                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:scale-110 transition-transform">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                        </div>
                    </div>
                    <div class="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Before</div>
                    <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">After</div>
                </div>
                
                <div class="mt-2 text-right flex justify-end gap-2">
                    <button class="bg-red-600 text-white text-xs font-bold px-4 py-2 uppercase tracking-wide hover:bg-red-700 delete-result-btn" data-id="${res.id}">Delete</button>
                    <a href="${res.staged}" download class="bg-black text-white text-xs font-bold px-4 py-2 uppercase tracking-wide hover:bg-gray-800">Download Result</a>
                </div>
            </div>
        `).join('');

        initSliders();
        bindDeleteButtons();
    }

    function bindDeleteButtons() {
        document.querySelectorAll('.delete-result-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm("Are you sure you want to delete this result?")) return;
                const id = btn.dataset.id;
                try {
                    const res = await fetch(`/api/project-files/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        stagedResults = stagedResults.filter(r => r.id != id);
                        renderResults();
                    }
                } catch (e) {
                    console.error(e);
                    alert("Failed to delete");
                }
            });
        });
    }

    function initSliders() {
        document.querySelectorAll('.comparison-slider').forEach(slider => {
            const handle = slider.querySelector('.slider-handle');
            const beforeLayer = slider.querySelector('.before-layer');
            let isDragging = false;

            const updatePosition = (clientX) => {
                const rect = slider.getBoundingClientRect();
                let x = clientX - rect.left;
                if (x < 0) x = 0;
                if (x > rect.width) x = rect.width;
                const percent = (x / rect.width) * 100;
                handle.style.left = `${percent}%`;
                beforeLayer.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
            };

            const onMove = (e) => {
                if (!isDragging) return;
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                updatePosition(clientX);
            };

            const onUp = () => {
                isDragging = false;
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('touchmove', onMove);
                window.removeEventListener('mouseup', onUp);
                window.removeEventListener('touchend', onUp);
            };

            const onDown = (e) => {
                isDragging = true;
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                updatePosition(clientX);
                window.addEventListener('mousemove', onMove);
                window.addEventListener('touchmove', onMove);
                window.addEventListener('mouseup', onUp);
                window.addEventListener('touchend', onUp);
            };

            slider.addEventListener('mousedown', onDown);
            slider.addEventListener('touchstart', onDown);
        });
    }

    // ========== Download All ==========
    downloadAllBtn.addEventListener('click', async () => {
        if (stagedResults.length === 0) return;
        const zip = new JSZip();
        const folder = zip.folder("Completed_Project_" + projectId);
        downloadAllBtn.textContent = 'Zipping...';

        const promises = stagedResults.map(async (r, i) => {
            try {
                const resp = await fetch(r.staged);
                const blob = await resp.blob();
                folder.file(`staged_${i + 1}.png`, blob);
            } catch (e) { }
        });
        await Promise.all(promises);
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "project_results.zip");
        downloadAllBtn.textContent = 'Download All (ZIP)';
    });
});
