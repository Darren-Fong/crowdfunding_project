// Initialize total pledged amount
let totalPledged = 0;
let backers = [];

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // Return current progress
        return res.status(200).json({
            currentAmount: totalPledged,
            backers: backers
        });
    }

    if (req.method === 'POST') {
        try {
            const { amount, backer } = req.body;

            // Validate input
            if (typeof amount !== 'number' || amount <= 0) {
                return res.status(400).json({
                    error: 'Invalid amount'
                });
            }

            // Update total pledged
            totalPledged += amount;

            // Add backer if provided
            if (backer) {
                backers.push(backer);
            }

            // Return updated progress
            return res.status(200).json({
                currentAmount: totalPledged,
                backers: backers
            });
        } catch (error) {
            console.error('Error processing pledge:', error);
            return res.status(500).json({
                error: 'Failed to process pledge'
            });
        }
    }

    // Method not allowed
    return res.status(405).json({
        error: 'Method not allowed'
    });
} 