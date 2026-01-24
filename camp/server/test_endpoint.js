
const fetch = require('node-fetch');

async function test() {
    try {
        // 1. Get a proposal to target
        const res = await fetch('http://localhost:3000/api/proposals?userId=8');
        const proposals = await res.json();

        if (proposals.length === 0) {
            console.log('No proposals found to test with.');
            return;
        }

        const targetId = proposals[0].id;
        console.log(`Testing with proposal ID: ${targetId}`);

        // 2. Try the counter endpoint
        const updateRes = await fetch(`http://localhost:3000/api/proposals/${targetId}/counter`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                price: '4.20',
                quantity: '100',
                message: 'Test counter offer'
            })
        });

        if (updateRes.ok) {
            console.log('Success! Endpoint works.');
        } else {
            console.log('Error:', updateRes.status, updateRes.statusText);
            const text = await updateRes.text();
            console.log(text);
        }

    } catch (e) {
        console.error(e);
    }
}

test();
