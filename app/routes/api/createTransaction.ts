import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.post('/createTransaction', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  // Parse JSON body from the request
  const transactionArguments = req.body;

  try {
    // Create a new transaction using the service
    const transactionResponse = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.createTransaction(transactionArguments);
    });
    res.json(transactionResponse);
  } catch (error) {
    console.error('Failed to create transaction:', error)
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

export default router;