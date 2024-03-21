import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.post('/setAddressDescription', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  try {
    const { vaultAccountId, assetId, address, tag, description } = req.body;

    // Use the service to set the description of an existing address
    const operationResponse = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.setAddressDescription(vaultAccountId, assetId, address, tag, description);
    });

    res.json(operationResponse);
  } catch (error) {
    console.error('Failed to set address description:', error);
    res.status(500).json({ error: 'Failed to set address description' });
  }
});

export default router;