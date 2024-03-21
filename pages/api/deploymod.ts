// pages/api/deployChain.js
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';
import { FireblocksRequestHandler } from 'path-to-your-handler';  // Adjust the path as needed

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

  const fireblocks = new FireblocksRequestHandler();

  try {
    const { name, customerRefId, assetId, description, tag } = req.body;
    const deploymentName = `${name} Deployment Vault`;

    const vaultAccountResponse = await fireblocks.makeFireblocksRequest('/v1/createVaultAccount', { name: deploymentName }, '', customerRefId);
    const vaultAccountId = vaultAccountResponse.id;

    await fireblocks.makeFireblocksRequest(`/v1/setCustomerRefIdForVaultAccount/`, { vaultAccountId }, vaultAccountId, customerRefId);

    const externalWalletResponse = await fireblocks.makeFireblocksRequest('/v1/external_wallets', { name: `External Deployment Wallet ${customerRefId}`, customerId: customerRefId }, '', customerRefId);
    const internalWalletResponse = await fireblocks.makeFireblocksRequest('/v1/internal_wallets', { name: `Internal Deployment Wallet ${customerRefId}`, customerId: customerRefId }, '', customerRefId);

    const addressResponse = await fireblocks.makeFireblocksRequest(`/v1/vaults/${vaultAccountId}/addresses`, { assetId, description, customerId: customerRefId }, vaultAccountId, customerRefId);

    await fireblocks.makeFireblocksRequest(`/v1/generateNewAddress/${vaultAccountId}/${addressResponse.address}`, { tag, description }, vaultAccountId, customerRefId);

    const externalWalletAsset = await fireblocks.makeFireblocksRequest(`/v1/createExternalWalletAsset/${externalWalletResponse.id}/`, { assetId, address: addressResponse.address, tag }, '', customerRefId);

    const internalWalletAsset = await fireblocks.makeFireblocksRequest(`/v1/createInternalWalletAsset/${internalWalletResponse.id}/`, { assetId, address: addressResponse.address, tag }, '', customerRefId);

    const vaultAssetResponse = await fireblocks.makeFireblocksRequest(`/v1/createVaultAsset/${vaultAccountId}/`, { assetId }, vaultAccountId, customerRefId);

    res.status(200).json({
      success: true,
      vaultAccountId,
      vaultAccount: vaultAccountResponse,
      externalWalletId: externalWalletResponse.id,
      externalWallet: externalWalletResponse,
      internalWalletId: internalWalletResponse.id,
      internalWallet: internalWalletResponse,
      newAddress: addressResponse,
      externalWalletAssetId: externalWalletAsset.id,
      externalWalletAsset: externalWalletAsset,
      internalWalletAssetId: internalWalletAsset.id,
      internalWalletAsset: internalWalletAsset,
      vaultAssetId: vaultAssetResponse.id,
      vaultAsset: vaultAssetResponse,
    });
  } catch (error) {
    console.error('Create Deployment Action chain failed:', error);
    res.status(500).json({ error: 'Create Deployment Action chain failed' });
  }
}