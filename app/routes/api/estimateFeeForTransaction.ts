import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';


const router = express.Router();

router.post('/estimateFeeForTransaction', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  try {
    const transactionArguments = req.body;

    // Estimate the fee for a transaction using the service
    const feeEstimateResponse = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.estimateFeeForTransaction(transactionArguments);
    });

    res.json(feeEstimateResponse);
  } catch (error) {
    console.error('Failed to estimate transaction fee:', error);
    res.status(500).json({ error: 'Failed to estimate transaction fee' });
  }
});

export default router;