import express from 'express';
import { FireblocksService } from './../../../../../packages/ui/src/services/fireblocks.service';

const router = express.Router();

router.post('/setCustomerRefIdForAddress', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  try {
    const { vaultAccountId, assetId, address, tag, customerRefId } = req.body;

    // Use the service to set a customer reference ID for an address
    const operationResponse = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.setCustomerRefIdForAddress(vaultAccountId, assetId, address, tag, customerRefId);
    });

    res.json(operationResponse);
  } catch (error) {
    console.error('Failed to set customer reference ID:', error);
    res.status(500).json({ error: 'Failed to set customer reference ID' });
  }
});

export default router;