import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.post('/setAutoFuelAndUpdateVaultAccount', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  try {
    const { vaultAccountId, autoFuel, name } = req.body;

    // Use the service to set auto fuel for a vault account and update the vault account name
    const operationResponse = await fireblocksService.useSdk(async (sdk) => {
      const autoFuelResponse = await sdk.setAutoFuel(vaultAccountId, autoFuel);
      const updateResponse = await sdk.updateVaultAccount(vaultAccountId, name);
      return { autoFuelResponse, updateResponse };
    });

    res.json(operationResponse);
  } catch (error) {
    console.error('Failed to set auto fuel or update vault account:', error);
    res.status(500).json({ error: 'Failed to set auto fuel or update vault account' });
  }
});

export default router;