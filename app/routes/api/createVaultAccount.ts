import express from 'express';
import { FireblocksService } from './../../../services/fireblocks.service';

const router = express.Router();

router.post('/createVaultAccount', async (req, res) => {
  // Initialize the FireblocksService
  const fireblocksService = new FireblocksService();

  try {
    const { name, hiddenOnUI, customerRefId, autoFuel } = req.body;

    // Create a vault account using the service
    const vaultAccount = await fireblocksService.useSdk(async (sdk) => {
      return await sdk.createVaultAccount(name, hiddenOnUI, customerRefId, autoFuel);
    });

    res.json(vaultAccount);
  } catch (error) {
    console.error('Failed to create vault account:', error);
    res.status(500).json({ error: 'Failed to create vault account' });
  }
});

export default router;