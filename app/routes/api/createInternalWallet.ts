import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.post('/createInternalWallet', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  // Parse JSON body from the request
  const { name, customerRefId } = req.body;

  try {
    // Create a new internal wallet using the service
    const internalWallet = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.createInternalWallet(name, customerRefId);
    });
    res.json(internalWallet);
  } catch (error) {
    console.error('Failed to create internal wallet:', error)
    res.status(500).json({ error: 'Failed to create internal wallet' });
  }
});

export default router;