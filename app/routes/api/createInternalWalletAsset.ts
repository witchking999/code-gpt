import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.post('/createInternalWalletAsset', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  // Parse JSON body from the request
  const { walletId, assetId, address, tag } = req.body;

  try {
    // Create a new asset within an existing internal wallet using the service
    const internalWalletAsset = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.createInternalWalletAsset(walletId, assetId, address, tag);
    });
    res.json(internalWalletAsset);
  } catch (error) {
    console.error('Failed to create internal wallet asset:', error)
    res.status(500).json({ error: 'Failed to create internal wallet asset' });
  }
});

export default router;