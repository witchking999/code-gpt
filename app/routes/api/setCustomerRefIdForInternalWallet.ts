import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.post('/setCustomerRefIdForInternalWallet', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  try {
    const { walletId, customerRefId } = req.body;

    // Use the service to set a customer reference ID for an internal wallet
    const operationResponse = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.setCustomerRefIdForInternalWallet(walletId, customerRefId);
    });

    res.json(operationResponse);
  } catch (error) {
    console.error('Failed to set customer reference ID:', error);
    res.status(500).json({ error: 'Failed to set customer reference ID' });
  }
});

export default router;