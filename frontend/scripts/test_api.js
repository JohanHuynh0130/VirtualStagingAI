// Native fetch


async function testApi() {
    try {
        const res = await fetch('http://localhost:3001/api/furniture');
        const data = await res.json();
        console.log(`API returned ${data.length} items.`);
        if (data.length > 0) {
            console.log('Sample item:', data[0]);
            const bdrInfo = data.find(d => d.external_id && d.external_id.startsWith('BDR'));
            console.log('Sample BDR:', bdrInfo);
        }
    } catch (e) {
        console.error(e);
    }
}

testApi();
