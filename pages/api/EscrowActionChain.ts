// pages/api/createEscrowVaultChain.js
import axios from 'axios';
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';
import { FireblocksSDK } from 'fireblocks-sdk';  // Adjust the path as needed

// Initialize CORS middleware
const cors = Cors({
  methods: ['POST'],
  origin: '*',  // Adjust based on your CORS policy
});

// Helper function to run CORS middleware
function runCorsMiddleware(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve, reject) => {
    cors(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run CORS middleware
  await runCorsMiddleware(req, res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const privateKey = process.env.FIREBLOCKS_PRIVATE_KEY || '';
  const apiKey = process.env.FIREBLOCKS_API_KEY || '';
  const baseUrl = process.env.FIREBLOCKS_API_BASE_URL || 'https://api.fireblocks.io';
  const fireblocksSDK = new FireblocksSDK(privateKey, apiKey, baseUrl);

  try {
    const { name, customerRefId, assetId, description, tag } = await req.json();

    // Append "Escrow" to the name
    const escrowName = `${name} Escrow Vault`;

    // Step 1: Create a vault account
    const vaultAccountResponse = await fireblocksSDK.createVaultAccount(escrowName, false, customerRefId, false);
    const vaultAccountId = vaultAccountResponse.id;

    // Step 2: Set a customer reference ID for the created vault account
    await fireblocksSDK.setCustomerRefIdForVaultAccount(vaultAccountId, customerRefId);

    // Step 3: Generate a new address for an asset in the vault account
    const addressResponse = await fireblocksSDK.generateNewAddress(vaultAccountId, assetId, description, customerRefId);

    // Step 4: Set the description of the newly generated address
    const setAddressDescriptionResponse = await fireblocksSDK.setAddressDescription(vaultAccountId, assetId, addressResponse.address, tag, description);

    // Step 5: Create a contract wallet
    // Note: Need to define createContractWallet in FireblocksSDK if not already present
    const contractWallet = await fireblocksSDK.createContractWallet(escrowName);

    // Step 6: Create a contract wallet asset
    // Note: Need to define createContractWalletAsset in FireblocksSDK if not already present
    const contractWalletAsset = await fireblocksSDK.createContractWalletAsset(contractWallet.id, assetId, addressResponse.address, tag);

    res.status(200).json({
      success: true,
      vaultAccount: vaultAccountResponse,
      newAddress: addressResponse,
      setAddressDescription: setAddressDescriptionResponse,
      contractWallet: contractWallet,
      contractWalletAsset: contractWalletAsset,
    });
  } catch (error) {
    console.error('Create Escrow Action chain failed:', error);
    res.status(500).json({ error: 'Create Escrow Action chain failed' });
  }
}
