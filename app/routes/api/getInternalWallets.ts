import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.get('/getInternalWallets', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  try {
    // Use the service to get all internal wallets
    const internalWallets = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.getInternalWallets();
    });

    res.json(internalWallets);
  } catch (error) {
    console.error('Failed to get internal wallets:', error);
    res.status(500).json({ error: 'Failed to get internal wallets' });
  }
});

export default router;