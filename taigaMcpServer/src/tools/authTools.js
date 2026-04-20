/**
 * Authentication related MCP tools
 */

import { z } from 'zod';
import { TaigaService } from '../taigaService.js';
import { authenticate } from '../taigaAuth.js';
import { SUCCESS_MESSAGES } from '../constants.js';
import { 
  createErrorResponse,
  createSuccessResponse
} from '../utils.js';

const taigaService = new TaigaService();

/**
 * Tool to authenticate with Taiga
 */
export const authenticateTool = {
  name: 'authenticate',
  schema: {
    username: z.string().optional(),
    password: z.string().optional(),
  },
  handler: async ({ username, password }) => {
    try {
      // Use provided credentials or fall back to environment variables
      const user = username || process.env.TAIGA_USERNAME;
      const pass = password || process.env.TAIGA_PASSWORD;

      if (!user || !pass) {
        return createErrorResponse('Error: Username and password are required. Please provide them or set them in the environment variables.');
      }

      await authenticate(user, pass);
      const currentUser = await taigaService.getCurrentUser();

      return createSuccessResponse(`${SUCCESS_MESSAGES.AUTHENTICATED} as ${currentUser.full_name} (${currentUser.username}).`);
    } catch (error) {
      return createErrorResponse(`Authentication failed: ${error.message}`);
    }
  }
};