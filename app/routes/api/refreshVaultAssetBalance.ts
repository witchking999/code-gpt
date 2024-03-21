import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.get('/refreshVaultAssetBalance/:vaultAccountId/:assetId', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  try {
    const { vaultAccountId, assetId } = req.params;

    // Use the service to refresh and get the vault account asset balance by vaultAccountId and assetId
    const vaultAccountAssetBalance = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.refreshVaultAssetBalance(String(vaultAccountId), String(assetId));
    });

    res.json(vaultAccountAssetBalance);
  } catch (error) {
    console.error('Failed to refresh and get vault account asset balance:', error);
    res.status(500).json({ error: 'Failed to refresh and get vault account asset balance' });
  }
});

export default router;