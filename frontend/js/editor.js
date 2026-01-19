// Photo Editor - SaaS Version
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('projectId');

if (!projectId) {
    // Redirect to dashboard if no project selected
    window.location.href = '/dashboard.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    const chatContainer = document.getElementById('chat-container');
    const chatEmpty = document.getElementById('chat-empty');
    const inputArea = document.getElementById('input-area');
    const initialUpload = document.getElementById('initial-upload');
    const addImage = document.getElementById('add-image');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const sendText = document.getElementById('send-text');
    const sendSpinner = document.getElementById('send-spinner');
    const statusMsg = document.getElementById('status-msg');
    const newSessionBtn = document.getElementById('new-session'); // Now "Back to Dashboard"

    // Settings
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const settingsBackdrop = document.getElementById('settings-backdrop');
    const closeSettings = document.getElementById('close-settings');
    const saveSettings = document.getElementById('save-settings');
    const systemPromptInput = document.getElementById('system-prompt');

    systemPromptInput.value = localStorage.getItem('systemPrompt') || '';

    settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    [settingsBackdrop, closeSettings].forEach(el => {
        el.addEventListener('click', () => settingsModal.classList.add('hidden'));
    });
    saveSettings.addEventListener('click', () => {
        localStorage.setItem('systemPrompt', systemPromptInput.value);
        settingsModal.classList.add('hidden');
    });

    // Change New Session button to Dashboard link
    newSessionBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        <span>Back to Dashboard</span>
    `;
    newSessionBtn.addEventListener('click', () => window.location.href = '/dashboard.html');

    // State
    let currentSessionId = 'saas_v1';
    let originalImageData = null;

    // Load Project Data
    await loadProject();

    async function loadProject() {
        try {
            const res = await fetch(`http://localhost:3001/api/projects/${projectId}`);
            if (!res.ok) throw new Error('Project load failed');

            const data = await res.json();
            const { project, files } = data;

            // Render History
            if (files.length > 0) {
                chatEmpty.classList.add('hidden');
                inputArea.classList.remove('hidden');
                messageInput.disabled = false;
                sendBtn.disabled = false;

                // Find original to set for comparisons
                const firstOriginal = files.find(f => f.type === 'original');
                if (firstOriginal) {
                    originalImageData = firstOriginal.url;
                }

                // Render stream
                chatContainer.innerHTML = '';

                // We need to interleave user prompts and results.
                // Our data model associates prompt with the result.
                // But standalone uploads are just uploads.

                files.forEach(file => {
                    let meta = {};
                    try { meta = JSON.parse(file.metadata || '{}'); } catch (e) { }

                    if (file.type === 'original') {
                        renderMessage('user', null, file.url, meta.name || 'Original Image');
                    } else if (file.type === 'result') {
                        // The user prompt that caused this
                        if (file.prompt) {
                            renderMessage('user', file.prompt);
                        }
                        renderMessage('ai', meta.text, file.url);
                    }
                });

                scrollToBottom();
            } else {
                statusMsg.textContent = `Project: ${project.name}`;
            }

        } catch (err) {
            console.error(err);
            statusMsg.textContent = 'Failed to load project.';
        }
    }

    // Handlers
    initialUpload.addEventListener('change', (e) => handleUpload(e.target.files[0]));
    addImage.addEventListener('change', (e) => handleUpload(e.target.files[0]));

    async function handleUpload(file) {
        if (!file || !file.type.startsWith('image/')) return;

        chatEmpty.classList.add('hidden');
        inputArea.classList.remove('hidden');

        // Optimistic render
        const previewUrl = URL.createObjectURL(file);
        renderMessage('user', null, previewUrl, file.name);
        originalImageData = previewUrl; // Temp until reload

        // Send 'edit' request with just image to save it to project
        const formData = new FormData();
        formData.append('image', file);
        formData.append('projectId', projectId);
        formData.append('sessionId', currentSessionId);
        // Empty message = just upload
        formData.append('message', '');

        try {
            const res = await fetch('http://localhost:3001/api/edit', { method: 'POST', body: formData });
            const data = await res.json();
            // We don't get a 'result' here usually if just upload, 
            // but our API structure might return empty text/image.
            // Reload to get correct URL is safest, or trust preview.
            // Let's reload to verify persistence.
            await loadProject();
        } catch (e) {
            console.error(e);
        }
    }

    // Send Message
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    messageInput.addEventListener('input', () => {
        sendBtn.disabled = messageInput.value.trim() === '';
    });

    sendBtn.addEventListener('click', sendMessage);

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        // Render User Message immediately
        renderMessage('user', message);
        messageInput.value = '';
        sendBtn.disabled = true;

        sendText.textContent = 'Generating...';
        sendSpinner.classList.remove('hidden');

        try {
            const formData = new FormData();
            formData.append('message', message);
            formData.append('projectId', projectId);
            formData.append('sessionId', currentSessionId);
            formData.append('systemPrompt', localStorage.getItem('systemPrompt') || '');

            const res = await fetch('http://localhost:3001/api/edit', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();

            renderMessage('ai', data.text, data.image);

            // Reload to sync URLs if needed? Or just keep going.
            // data.image is from server URL, so it's good.

        } catch (err) {
            renderMessage('ai', `Error: ${err.message}`);
        } finally {
            sendText.textContent = 'Send';
            sendSpinner.classList.add('hidden');
            sendBtn.disabled = false;
            messageInput.focus();
        }
    }

    function renderMessage(role, text, imageUrl, imageName) {
        const msg = document.createElement('div');
        msg.className = `chat-message ${role === 'user' ? 'chat-user' : 'chat-ai'}`;

        let content = '';

        if (imageUrl) {
            if (role === 'ai' && originalImageData) {
                // Before/After Slider
                const sliderId = 'slider-' + Date.now() + Math.random().toString(36).substr(2, 5);
                content += `
                    <div class="before-after-wrapper w-full max-w-lg mb-4">
                        <div class="flex gap-2 mb-2">
                             <span class="text-xs font-bold uppercase text-neutral-500">Compare with Original</span>
                        </div>
                        <div class="before-after-container relative overflow-hidden rounded-xl cursor-ew-resize select-none" id="${sliderId}" style="height: 300px;">
                            <img src="${imageUrl}" class="absolute inset-0 w-full h-full object-cover" alt="After">
                            <img src="${originalImageData}" class="before-img absolute inset-0 w-full h-full object-cover" style="clip-path: inset(0 50% 0 0);" alt="Before">
                            <div class="slider-handle absolute top-0 left-1/2 w-1 h-full bg-white transform -translate-x-1/2 pointer-events: none z-10">
                                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                                </div>
                            </div>
                        </div>
                         <!-- Download Btn -->
                         <div class="flex justify-end mt-2">
                            <a href="${imageUrl}" download target="_blank" class="text-xs text-neutral-400 hover:text-white">↓ Download</a>
                        </div>
                    </div>
                `;
            } else {
                content += `
                    <div class="chat-image-container">
                        <img src="${imageUrl}" class="chat-image">
                    </div>
                `;
            }
        }

        if (text) content += `<p class="chat-text">${text}</p>`;

        msg.innerHTML = content;
        chatContainer.appendChild(msg);
        scrollToBottom();

        // Slider logic
        if (role === 'ai' && imageUrl && originalImageData) {
            initSlider(msg);
        }
    }

    function initSlider(container) {
        const wrap = container.querySelector('.before-after-container');
        if (!wrap) return;
        const beforeImg = wrap.querySelector('.before-img');
        const handle = wrap.querySelector('.slider-handle');

        // ... (existing logic) ...
        let isDragging = false;
        const update = (e) => {
            const rect = wrap.getBoundingClientRect();
            let x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
            x = Math.max(0, Math.min(x, rect.width));
            const p = (x / rect.width) * 100;
            beforeImg.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
            handle.style.left = `${p}%`;
        };
        wrap.addEventListener('mousedown', e => { isDragging = true; update(e); });
        window.addEventListener('mouseup', () => isDragging = false);
        wrap.addEventListener('mousemove', e => isDragging && update(e));
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
