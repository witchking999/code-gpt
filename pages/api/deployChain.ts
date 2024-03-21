// pages/api/deploychain.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { VaultAccountResponse, WalletResponse } from '../../interfaces'; // Adjust the import path as necessary

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Step 1: Create a vault account
    const createVaultResponse = await axios.post<VaultAccountResponse>('http://localhost:8000/api/createVaultAccount', {/* Payload */});
    const { id: vaultAccountId, customerRefId } = createVaultResponse.data;

    // Assuming customerRefId is needed and obtained from the first step, otherwise adjust accordingly

    // Step 2: Set the customer ref ID for the vault account (if not already set)
    // This step is merged into step 1 in this example for brevity

    // Step 3: Create a vault asset
    await axios.post('http://localhost:8000/api/createVaultAsset', { vaultAccountId, /* Additional data */ });

    // Step 4: Create an external wallet
    const createExternalWalletResponse = await axios.post<WalletResponse>('http://localhost:8000/api/createExternalWallet', { vaultAccountId, customerRefId });
    const { id: externalWalletId } = createExternalWalletResponse.data;

    // Step 5: Create an external wallet asset
    await axios.post('http://localhost:8000/api/createExternalWalletAsset', { externalWalletId, /* Additional data */ });

    // Step 6: Create an internal wallet
    const createInternalWalletResponse = await axios.post<WalletResponse>('http://localhost:8000/api/createInternalWallet', { vaultAccountId, customerRefId });
    const { id: internalWalletId } = createInternalWalletResponse.data;

    // Step 7: Create an internal wallet asset
    await axios.post('http://localhost:8000/api/createInternalWalletAsset', { internalWalletId, /* Additional data */ });

    // Step 8: Set an address description
    await axios.post('http://localhost:8000/api/setAddressDescription', { internalWalletId, description: "Example description" });

    // Finalize the deploy chain and respond with success and relevant data
    res.status(200).json({
      message: 'Deploy chain completed successfully',
      vaultAccountId,
      customerRefId,
      externalWalletId,
      internalWalletId,
      // You might include more detailed information from each step's response as needed
    });
  } catch (error) {
    console.error('Deploy chain error:', error);
    res.status(500).json({ message: 'Error executing deploy chain', error: error.message });
  }
}
