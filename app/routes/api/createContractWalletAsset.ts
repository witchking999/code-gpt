import express from 'express';
import { FireblocksService } from  './../../../services/fireblocks.service';

const router = express.Router();

router.post('/createContractWalletAsset', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  // Parse JSON body from the request
  const { walletId, assetId, address, tag } = req.body;

  try {
    // Create a new asset within an existing contract wallet using the service
    const contractWalletAsset = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.createContractWalletAsset(walletId, assetId, address, tag);
    });
    res.json(contractWalletAsset);
  } catch (error) {
    console.error('Failed to create contract wallet asset:', error)
    res.status(500).json({ error: 'Failed to create contract wallet asset' });
  }
});

export default router;