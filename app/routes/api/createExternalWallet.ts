import express from 'express';
import { FireblocksService } from  './../../../services/fireblocks.service';

const router = express.Router();

router.post('/createExternalWallet', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  // Parse JSON body from the request
  const { name, customerRefId } = req.body;

  try {
    // Create a new external wallet using the service
    const externalWallet = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.createExternalWallet(name, customerRefId);
    });
    res.json(externalWallet);
  } catch (error) {
    console.error('Failed to create external wallet:', error)
    res.status(500).json({ error: 'Failed to create external wallet' });
  }
});

export default router;