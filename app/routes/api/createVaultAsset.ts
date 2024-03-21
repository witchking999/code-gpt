import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.post('/createVaultAsset', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  try {
    const { vaultAccountId, assetId } = req.body;

    // Create a new asset within an existing vault account using the service
    const vaultAssetResponse = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.createVaultAsset(vaultAccountId, assetId);
    });

    res.json(vaultAssetResponse);
  } catch (error) {
    console.error('Failed to create vault asset:', error);
    res.status(500).json({ error: 'Failed to create vault asset' });
  }
});

export default router;