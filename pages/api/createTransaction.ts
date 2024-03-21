// /pages/api/createTransaction.ts

import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { FireblocksSDK } from 'fireblocks-sdk';
import { FireblocksRequestHandler } from './../../../config/Fireblocksrequesthandler';
import fs from 'fs';
import path from 'path';

// Initializing the cors middleware
const cors = Cors({
    methods: ['POST', 'HEAD'],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error if anything goes wrong
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

// Set up the API route
export default async function createTransaction(req: NextApiRequest, res: NextApiResponse) {
    // Run the middleware
    await runMiddleware(req, res, cors);

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        // Parse JSON body from the request
        const body = req.body;
        const transactionArguments = body;

        // Initialize FireblocksRequestHandler and sign the JWT token
        const fireblocksRequestHandler = new FireblocksRequestHandler();
        const jwtToken = await fireblocksRequestHandler.signJwt('/v1/transactions', body);

        // Read API Secret from file
        const privateKey = process.env.FIREBLOCKS_PRIVATE_KEY || '';
        const apiKey = process.env.FIREBLOCKS_API_KEY || '';
        const baseUrl = process.env.FIREBLOCKS_API_BASE_URL || 'https://api.fireblocks.io';
        const fireblocksSDK = new FireblocksSDK(privateKey, apiKey, baseUrl);
      

        // Initialize the Fireblocks SDK with the JWT token

        // Axios headers
        const headers = {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
        };

        // Create a new transaction using the SDK
        const transactionResponse = await axios.post(`${baseUrl}/v1/transactions`, transactionArguments, { headers });
        res.status(200).json(transactionResponse.data);
    } catch (error) {
        console.error('Failed to create transaction:', error);
        res.status(500).send('Internal Server Error');
    }
}
