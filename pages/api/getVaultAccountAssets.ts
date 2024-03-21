// /path/to/api/getVaultAccountAssets.ts
import axios from 'axios';
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';
import { FireblocksRequestHandler } from  './../../../config/Fireblocksrequesthandler';
import { FireblocksSDK } from 'fireblocks-sdk';
import fs from 'fs';
import path from 'path';

// CORS middleware configuration
const cors = Cors({
  methods: ['GET', 'HEAD'], // Adjust based on your requirements
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

    // Extract vaultAccountId and assetId from the request query
    const { vaultAccountId, assetId } = req.query;

    const apiSecret = fs.readFileSync(path.resolve(process.env.NEXT_PUBLIC_FIREBLOCKS_PRIVATE_KEY || ''), 'utf8');
    const apiKey = process.env.NEXT_PUBLIC_FIREBLOCKS_API_KEY || '';
    const baseUrl = 'https://api.fireblocks.io';

    // Initialize FireblocksRequestHandler
    const fireblocksRequestHandler = new FireblocksRequestHandler();

    // Prepare the API URL
    const url = `${baseUrl}/vault/accounts/${vaultAccountId}/${assetId}`;

    // Generate JWT Token for Authorization using FireblocksRequestHandler
    const jwtToken = fireblocksRequestHandler.signJwt(url);

    // Axios headers
    const headers = {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Failed to get vault account asset:', error);
        res.status(500).json({ error: 'Failed to get vault account asset' });
    }
}
