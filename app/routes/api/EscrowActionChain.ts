/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/namespace */
import { ActionFunction, json } from '@remix-run/node';
import { FireblocksRequestHandler } from './../../../../../packages/ui/src/config/Fireblocksrequesthandler';
import { FireblocksSDK } from './../../../../../packages/ui/src/fireblocks-sdk-js/fireblocks-sdk';
import fs from 'fs';
import path from 'path';

export const action: ActionFunction = async ({ request }) => {
  const fireblocksRequestHandler = new FireblocksRequestHandler();

  // Parse JSON body from the request
  const body = await request.json();
  const { name, customerRefId, assetId, description, tag } = body;

  // Get the JWT token
  const jwtToken = await fireblocksRequestHandler.signJwt('/v1/transactions', body);

  // Initialize the Fireblocks SDK with the JWT token
  const apiSecret = fs.readFileSync(path.resolve(process.env.REACT_APP_FIREBLOCKS_PRIVATE_KEY_PATH || ''), "utf8");
  const apiKey = process.env.REACT_APP_FIREBLOCKS_API_KEY || '';
  const baseUrl = 'https://api.fireblocks.io';
  const fireblocksSDK = new FireblocksSDK(apiSecret, apiKey, baseUrl);

  try {
    // Append "Escrow" to the name
    const escrowName = `${name} Escrow Vault`;

    // Step 1: Create a vault account
    const vaultAccountResponse = await fireblocksSDK.createVaultAccount(escrowName, false, customerRefId, false);
    const vaultAccountId = vaultAccountResponse.id;

    // Step 2: Set a customer reference ID for the created vault account (if not already done in step 1)
    await fireblocksSDK.setCustomerRefIdForVaultAccount(vaultAccountId, customerRefId);

    const addressResponse = await fireblocksSDK.generateNewAddress(vaultAccountId, assetId, description, customerRefId);

    // Step 3: Set the description of the newly generated address
    const setAddressDescriptionResponse = await fireblocksSDK.setAddressDescription(vaultAccountId, assetId, addressResponse.address, tag, description);

    // Step 4: Create a contract wallet
    const contractWallet = await fireblocksSDK.createContractWallet(escrowName);

    // Step 5: Create a contract wallet asset
    const contractWalletAsset = await fireblocksSDK.createContractWalletAsset(contractWallet.id, assetId, addressResponse.address, tag);

    // Return a comprehensive response with all pertinent details
    return json({
      success: true,
      vaultAccount: vaultAccountResponse,
      newAddress: addressResponse,
      setAddressDescription: setAddressDescriptionResponse,
      contractWallet: contractWallet,
      contractWalletAsset: contractWalletAsset,
    });
  } catch (error) {
    console.error('Create Escrow Action chain failed:', error);
    return json({ error: 'Create Escrow Action chain failed' }, { status: 500 });
  }
};