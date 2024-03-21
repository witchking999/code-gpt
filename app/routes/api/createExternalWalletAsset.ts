import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.post('/createExternalWalletAsset', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  // Parse JSON body from the request
  const { walletId, assetId, address, tag } = req.body;

  try {
    // Create a new asset within an existing external wallet using the service
    const externalWalletAsset = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.createExternalWalletAsset(walletId, assetId, address, tag);
    });
    res.json(externalWalletAsset);
  } catch (error) {
    console.error('Failed to create external wallet asset:', error)
    res.status(500).json({ error: 'Failed to create external wallet asset' });
  }
});

export default router;