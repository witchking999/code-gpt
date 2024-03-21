import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.post('/getTransactions', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  try {
    const filter = req.body;

    // Use the service to get the transactions matching the filter
    const transactions = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.getTransactions(filter);
    });

    res.json(transactions);
  } catch (error) {
    console.error('Failed to get transactions:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

export default router;