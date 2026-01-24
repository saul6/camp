
const http = require('http');

function makeRequest(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data: data }));
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function test() {
    try {
        console.log('Fetching proposals...');
        const res = await makeRequest('/api/proposals?userId=8', 'GET');

        if (res.statusCode !== 200) {
            console.log('Error fetching proposals:', res.statusCode);
            return;
        }

        const proposals = JSON.parse(res.data);
        if (proposals.length === 0) {
            console.log('No proposals found.');
            return;
        }

        const targetId = proposals[0].id;
        console.log(`Testing counter on proposal ${targetId}`);

        const updateRes = await makeRequest(`/api/proposals/${targetId}/counter`, 'PUT', {
            price: '4.50',
            quantity: '100',
            message: 'Http test counter'
        });

        console.log(`Status: ${updateRes.statusCode}`);
        console.log(`Response: ${updateRes.data}`);

    } catch (e) {
        console.error('Test failed:', e.message);
    }
}

test();
