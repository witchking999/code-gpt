import express from 'express';
import { FireblocksService } from  './../../../services/fireblocks.service';

const router = express.Router();

router.post('/createContractWallet', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  // Parse JSON body from the request
  const { name } = req.body;

  try {
    // Create a new contract wallet using the service
    const contractWallet = await fireblocksService.sdk.createContractWallet(name);
    res.json(contractWallet);
  } catch (error) {
    console.error('Failed to create contract wallet:', error)
    res.status(500).json({ error: 'Failed to create contract wallet' });
  }
});

export default router;