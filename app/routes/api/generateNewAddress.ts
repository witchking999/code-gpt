/* eslint-disable import/namespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
// routes/api/deployChain.ts
import { ActionFunction, json } from '@remix-run/node';
import { FireblocksRequestHandler } from './../../../../../packages/ui/src/config/Fireblocksrequesthandler';
import { FireblocksSDK } from './../../../../../packages/ui/src/fireblocks-sdk-js/fireblocks-sdk';

export const action: ActionFunction = async ({ request }) => {
  const privateKey = process.env.FIREBLOCKS_PRIVATE_KEY || '';
  const apiKey = process.env.FIREBLOCKS_API_KEY || '';
  const baseUrl = process.env.FIREBLOCKS_API_BASE_URL || 'https://api.fireblocks.io';
  const fireblocksSDK = new FireblocksSDK(privateKey, apiKey, baseUrl);
  try {
    const { name, customerRefId, assetId, description } = await request.json();

    // Step 1: Create a vault account
    const vaultAccountResponse = await fireblocksSDK.createVaultAccount(name, false, customerRefId, false);
    const vaultAccountId = vaultAccountResponse.id;

    // Step 2: Set a customer reference ID for the created vault account (if not already done in step 1)
    // Optional if customerRefId was set during account creation
    await fireblocksSDK.setCustomerRefIdForVaultAccount(vaultAccountId, customerRefId);

    // Step 3: Create external and internal wallets (if necessary)
    const externalWalletResponse = await fireblocksSDK.createExternalWallet("External Wallet " + customerRefId, customerRefId);
    const internalWalletResponse = await fireblocksSDK.createInternalWallet("Internal Wallet " + customerRefId, customerRefId);

    // Step 4: Generate a new address for an asset in the created vault account
    const addressResponse = await fireblocksSDK.generateNewAddress(vaultAccountId, assetId, description, customerRefId);

    // Steps for creating new assets within these wallets (if necessary)
    // Including this step assumes you have specific requirements for asset management within the wallets
    // Example: const externalWalletAsset = await fireblocksSDK.createExternalWalletAsset(externalWalletResponse.id, assetId, address, tag);

    // Return a comprehensive response with all pertinent details
    return json({
      success: true,
      vaultAccount: vaultAccountResponse,
      externalWallet: externalWalletResponse,
      internalWallet: internalWalletResponse,
      newAddress: addressResponse,
      // Include details for externalWalletAsset here if necessary
    });
  } catch (error) {
    console.error('Deployment chain failed:', error);
    return json({ error: 'Deployment chain failed' }, { status: 500 });
  }
};
