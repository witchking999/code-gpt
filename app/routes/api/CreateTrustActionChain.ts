/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/namespace */
// routes/api/createTrustVaultChain.ts
import { ActionFunction, json } from '@remix-run/node';
import { FireblocksRequestHandler } from './../../../../../packages/ui/src/config/Fireblocksrequesthandler';
import { FireblocksSDK } from './../../../../../packages/ui/src/fireblocks-sdk-js/fireblocks-sdk';

export const action: ActionFunction = async ({ request }) => {
  const privateKey = process.env.FIREBLOCKS_PRIVATE_KEY;
  const apiKey = process.env.FIREBLOCKS_API_KEY;
  const baseUrl = process.env.FIREBLOCKS_API_BASE_URL;
  const fireblocksSDK = new FireblocksSDK(privateKey ?? '', apiKey ?? '', baseUrl ?? '');

  try {
    const { name, customerRefId, assetId, description, tag } = await request.json();

    // Append "Trust" to the name
    const trustName = `${name}  Trust Vault`;

    // Step 1: Create a vault account
    const vaultAccountResponse = await fireblocksSDK.createVaultAccount(trustName, false, customerRefId, false);
    const vaultAccountId = vaultAccountResponse.id;

    // Step 2: Set a customer reference ID for the created vault account (if not already done in step 1)
    // Optional if customerRefId was set during account creation
    await fireblocksSDK.setCustomerRefIdForVaultAccount(vaultAccountId, customerRefId);

    // Step 3: Create external and internal wallets (if necessary)
    const externalWalletResponse = await fireblocksSDK.createExternalWallet(`External Trust Wallet ${customerRefId}`, customerRefId);
    const internalWalletResponse = await fireblocksSDK.createInternalWallet(`Internal Trust Wallet ${customerRefId}`, customerRefId);

    // Step 4: Generate a new address for an asset in the created vault account
    const addressResponse = await fireblocksSDK.generateNewAddress(vaultAccountId, assetId, description, customerRefId);

    // Step 5: Set the description of the newly generated address
    const setAddressDescriptionResponse = await fireblocksSDK.setAddressDescription(vaultAccountId, assetId, addressResponse.address, tag, description);

    // Step 6: Create an external wallet asset
    const externalWalletAsset = await fireblocksSDK.createExternalWalletAsset(externalWalletResponse.id, assetId, addressResponse.address, tag);

    // Step 7: Create an internal wallet asset
    const internalWalletAsset = await fireblocksSDK.createInternalWalletAsset(internalWalletResponse.id, assetId, addressResponse.address, tag);

    // Step 8: Create a vault asset
    const vaultAssetResponse = await fireblocksSDK.createVaultAsset(vaultAccountId, assetId);

    // Return a comprehensive response with all pertinent details
    return json({
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
    return json({ error: 'Create Trust Action chain failed' }, { status: 500 });
  }
};