// In-memory storage for progress data
let progressData = {
    totalPledged: 0,
    backers: [],
    lastUpdated: new Date().toISOString()
};

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Set content type
    res.setHeader('Content-Type', 'application/json');

    try {
        console.log('Received request:', {
            method: req.method,
            body: req.body
        });

        // Handle GET request for fetching progress
        if (req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: progressData
            });
        }

        // Handle POST request for updating progress
        if (req.method === 'POST') {
            // Parse and validate request body
            let body;
            try {
                body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            } catch (e) {
                console.error('Failed to parse request body:', e);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON in request body'
                });
            }

            const { amount, backer } = body;

            // Validate required fields
            if (typeof amount !== 'number' || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid amount provided'
                });
            }

            if (!backer || typeof backer !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid backer information'
                });
            }

            try {
                // Update progress in memory
                progressData.totalPledged += amount;
                progressData.backers.push({
                    name: backer,
                    amount: amount,
                    date: new Date().toISOString()
                });
                progressData.lastUpdated = new Date().toISOString();

                // Return success response
                return res.status(200).json({
                    success: true,
                    data: progressData
                });
            } catch (error) {
                console.error('Error updating progress:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update progress'
                });
            }
        }

        // Handle unsupported methods
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
} 