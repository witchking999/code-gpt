import { FireblocksSDK } from 'fireblocks-sdk';
import fs from 'fs';
import path from 'path';
import axios, { AxiosInstance } from 'axios';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import { auth } from './config/firebaseAdminConfig'; // Import Firebase Admin auth
import { UserRecord } from 'firebase-admin/lib/auth'; // Import UserRecord type

export class FireblocksService {
  private sdk: FireblocksSDK;
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private privateKey: string;

  constructor(
    privateKeyPath: string = process.env.REACT_APP_FIREBLOCKS_PRIVATE_KEY_PATH || '',
    apiKey: string = process.env.REACT_APP_FIREBLOCKS_API_KEY || '',
    baseUrl: string = 'https://api.fireblocks.io'
  ) {
    this.privateKey = fs.readFileSync(path.resolve(privateKeyPath), "utf8");
    this.apiKey = apiKey;
    this.sdk = new FireblocksSDK(this.privateKey, this.apiKey, baseUrl);
    this.axiosInstance = axios.create({ baseURL: baseUrl });
  }

  async signJwt(requestPath: string, bodyJson: Record<string, unknown> = {}): Promise<string> {
    const payload = {
      uri: requestPath,
      nonce: uuid(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      sub: this.apiKey,
      bodyHash: crypto.createHash("sha256").update(JSON.stringify(bodyJson)).digest("hex"),
    };
    return jwt.sign(payload, this.privateKey, { algorithm: "RS256" });
  }

  async makeAuthenticatedRequest(endpoint: string, data: object = {}, method: 'get' | 'post' = 'get') {
    const jwtToken = await this.signJwt(endpoint, data as Record<string, unknown>);
    const headers = { Authorization: `Bearer ${jwtToken}` };
    try {
      const response = await this.axiosInstance({
        method,
        url: endpoint,
        data: method === 'post' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error making authenticated request:', error);
      throw new Error('Failed to make authenticated request');
    }
  }

  public async useSdk<T>(callback: (sdk: FireblocksSDK) => Promise<T>): Promise<T> {
    return await callback(this.sdk);
  }

  async addUserWithFirebase(userDetails: { email: string; phoneNumber: string; password: string; displayName: string; }): Promise<UserRecord> {
    try {
      const userRecord = await auth.createUser({
        email: userDetails.email,
        phoneNumber: userDetails.phoneNumber,
        password: userDetails.password,
        displayName: userDetails.displayName,
      });
      console.log('Successfully created new user:', userRecord.uid);
      return userRecord;
    } catch (error) {
      console.error('Error creating new user:', error);
      throw error;
    }
  }

  // Example method to verify Firebase user token
  async verifyUser(token: string) {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  }
}