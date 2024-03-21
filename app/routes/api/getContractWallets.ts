import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.get('/getContractWallets', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  try {
    // Use the service to get all contract wallets
    const contractWallets = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.getContractWallets();
    });

    res.json(contractWallets);
  } catch (error) {
    console.error('Failed to get contract wallets:', error);
    res.status(500).json({ error: 'Failed to get contract wallets' });
  }
});

export default router;