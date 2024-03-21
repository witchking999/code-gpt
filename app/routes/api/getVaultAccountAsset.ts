import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.get('/getVaultAccountAsset/:vaultAccountId/:assetId', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  try {
    const { vaultAccountId, assetId } = req.params;

    // Use the service to get the vault account asset by vaultAccountId and assetId
    const vaultAccountAsset = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.getVaultAccountAsset(vaultAccountId ?? '', assetId ?? '');
    });

    res.json(vaultAccountAsset);
  } catch (error) {
    console.error('Failed to get vault account asset:', error);
    res.status(500).json({ error: 'Failed to get vault account asset' });
  }
});

export default router;