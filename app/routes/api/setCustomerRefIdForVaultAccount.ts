import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.post('/setCustomerRefIdForVaultAccount', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  try {
    const { vaultAccountId, customerRefId } = req.body;

    // Use the service to set a customer reference ID for a vault account
    const operationResponse = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.setCustomerRefIdForVaultAccount(vaultAccountId, customerRefId);
    });

    res.json(operationResponse);
  } catch (error) {
    console.error('Failed to set customer reference ID:', error);
    res.status(500).json({ error: 'Failed to set customer reference ID' });
  }
});

export default router;