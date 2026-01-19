document.addEventListener('DOMContentLoaded', () => {
    const uploadInput = document.getElementById('image-upload');
    const dropZone = document.getElementById('drop-zone');
    const previewImg = document.getElementById('preview-img');
    const uploadContent = document.getElementById('upload-content');
    const promptInput = document.getElementById('prompt');
    const stageBtn = document.getElementById('stage-btn');
    const btnSpinner = document.getElementById('btn-spinner');
    const statusMsg = document.getElementById('status-msg');
    const resultsSection = document.getElementById('results-section');
    const originalResult = document.getElementById('original-result');
    const stagedResult = document.getElementById('staged-result');

    let uploadedImage = null;

    // Handle Upload
    dropZone.addEventListener('click', () => uploadInput.click());

    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Drag and Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-white', 'bg-neutral-900/50');
        dropZone.classList.remove('border-neutral-800');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-white', 'bg-neutral-900/50');
        dropZone.classList.add('border-neutral-800');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-white', 'bg-neutral-900/50');
        dropZone.classList.add('border-neutral-800');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    });

    function handleFile(file) {
        uploadedImage = URL.createObjectURL(file);
        previewImg.src = uploadedImage;
        previewImg.classList.remove('hidden');
        uploadContent.classList.add('hidden');

        stageBtn.disabled = false;
        statusMsg.innerText = 'Ready to stage your room';
        statusMsg.classList.remove('text-red-500');
        statusMsg.classList.add('text-neutral-500');
    }

    // Staging API Call
    stageBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        const file = uploadInput.files[0];

        if (!file && !uploadedImage) {
            statusMsg.innerText = 'Please select an image first';
            statusMsg.classList.add('text-red-500');
            return;
        }

        // Update UI to loading state
        stageBtn.disabled = true;
        btnSpinner.classList.remove('hidden');
        document.querySelector('.btn-text').innerText = 'Processing...';

        const steps = [
            'Analyzing room dimensions...',
            'Identifying surfaces...',
            'Consulting Gemini AI...',
            'Finalizing staging...'
        ];

        let stepIdx = 0;
        const statusInterval = setInterval(() => {
            if (stepIdx < steps.length) {
                statusMsg.innerText = steps[stepIdx];
                stepIdx++;
            }
        }, 2000);

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('prompt', prompt);

            const response = await fetch('http://localhost:3001/api/stage', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('API Error: Make sure backend is running');
            }

            const data = await response.json();
            clearInterval(statusInterval);

            // Show Results
            originalResult.src = uploadedImage;
            stagedResult.src = data.stagedImageUrl;
            document.getElementById('analysis-text').innerText = data.analysis;

            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });

            statusMsg.innerText = 'Staging Complete';
            statusMsg.classList.replace('text-neutral-500', 'text-white');
        } catch (error) {
            clearInterval(statusInterval);
            console.error('Error:', error);
            statusMsg.innerText = 'Error: ' + error.message;
            statusMsg.classList.add('text-red-500');
        } finally {
            stageBtn.disabled = false;
            btnSpinner.classList.add('hidden');
            document.querySelector('.btn-text').innerText = 'Stage Room';
        }
    });
});
