// pages/api/createTrustVaultChain.js
import axios from 'axios';
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';
import { FireblocksSDK } from 'fireblocks-sdk';  // Adjust the path as needed
import fs from 'fs';
import path from 'path';
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
  const baseUrl = process.env.FIREBLOCKS_API_BASE_URL || 'https://api.fireblocks.io/v1/';
  const fireblocksSDK = new FireblocksSDK(privateKey, apiKey, baseUrl);


  try {
    const { name, customerRefId, assetId, description, tag } = req.body;
    // Append "Trust" to the name
    const trustName = `${name} Trust Vault`;

    // Step 1: Create a vault account
    const vaultAccountResponse = await fireblocksSDK.createVaultAccount(trustName, false, customerRefId, false);
    const vaultAccountId = vaultAccountResponse.id;

    // Step 2: Set a customer reference ID for the created vault account
    await fireblocksSDK.setCustomerRefIdForVaultAccount(vaultAccountId, customerRefId);

    // Step 3: Create external and internal wallets
    const externalWalletResponse = await fireblocksSDK.createExternalWallet(`External Trust Wallet ${customerRefId}`, customerRefId);
    const internalWalletResponse = await fireblocksSDK.createInternalWallet(`Internal Trust Wallet ${customerRefId}`, customerRefId);

    // Step 4: Generate a new address for an asset in the vault account
    const addressResponse = await fireblocksSDK.generateNewAddress(vaultAccountId, assetId, description, customerRefId);

    // Step 5: Set the description of the newly generated address
    const setAddressDescriptionResponse = await fireblocksSDK.setAddressDescription(vaultAccountId, assetId, addressResponse.address, tag, description);

    // Step 6: Create an external wallet asset
    const externalWalletAsset = await fireblocksSDK.createExternalWalletAsset(externalWalletResponse.id, assetId, addressResponse.address, tag);

    // Step 7: Create an internal wallet asset
    const internalWalletAsset = await fireblocksSDK.createInternalWalletAsset(internalWalletResponse.id, assetId, addressResponse.address, tag);

    // Step 8: Create a vault asset
    const vaultAssetResponse = await fireblocksSDK.createVaultAsset(vaultAccountId, assetId);

    res.status(200).json({
      success: true,
      vaultAccountId,
      vaultAccount: vaultAccountResponse,
      externalWalletId: externalWalletResponse.id,
      externalWallet: externalWalletResponse,
      internalWalletId: internalWalletResponse.id,
      internalWallet: internalWalletResponse,
      newAddress: addressResponse,
      setAddressDescription: setAddressDescriptionResponse,
      externalWalletAssetId: externalWalletAsset.id,
      externalWalletAsset: externalWalletAsset,
      internalWalletAssetId: internalWalletAsset.id,
      internalWalletAsset: internalWalletAsset,
      vaultAssetId: vaultAssetResponse.id,
      vaultAsset: vaultAssetResponse,
    });
  } catch (error) {
    console.error('Create Trust Action chain failed:', error);
    res.status(500).json({ error: 'Create Trust Action chain failed' });
  }
}