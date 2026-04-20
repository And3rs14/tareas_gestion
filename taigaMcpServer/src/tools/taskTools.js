/**
 * Task related MCP tools
 */

import { z } from 'zod';
import { TaigaService } from '../taigaService.js';
import { SUCCESS_MESSAGES } from '../constants.js';
import { 
  resolveProjectId,
  findIdByName,
  getSafeValue,
  createErrorResponse,
  createSuccessResponse
} from '../utils.js';

const taigaService = new TaigaService();

/**
 * Tool to create a new task
 */
export const createTaskTool = {
  name: 'createTask',
  schema: {
    projectIdentifier: z.string().describe('Project ID or slug'),
    userStoryIdentifier: z.string().describe('User story ID or reference number'),
    subject: z.string().describe('Task title/subject'),
    description: z.string().optional().describe('Task description'),
    status: z.string().optional().describe('Status name (e.g., "New", "In progress")'),
    tags: z.array(z.string()).optional().describe('Array of tags'),
  },
  handler: async ({ projectIdentifier, userStoryIdentifier, subject, description, status, tags }) => {
    try {
      const projectId = await resolveProjectId(projectIdentifier);

      // Get user story ID if a reference number was provided
      let userStoryId = userStoryIdentifier;
      if (userStoryIdentifier.startsWith('#')) {
        // Remove the # prefix
        const refNumber = userStoryIdentifier.substring(1);
        // Get all user stories for the project
        const userStories = await taigaService.listUserStories(projectId);
        // Find the user story with the matching reference number
        const userStory = userStories.find(us => us.ref.toString() === refNumber);
        if (userStory) {
          userStoryId = userStory.id;
        } else {
          throw new Error(`User story with reference ${userStoryIdentifier} not found`);
        }
      }

      // Get status ID if a status name was provided
      let statusId = undefined;
      if (status) {
        const statuses = await taigaService.getTaskStatuses(projectId);
        statusId = findIdByName(statuses, status);
      }

      // Create the task
      const taskData = {
        project: projectId,
        user_story: userStoryId,
        subject,
        description,
        status: statusId,
        tags,
      };

      const createdTask = await taigaService.createTask(taskData);

      const creationDetails = `${SUCCESS_MESSAGES.TASK_CREATED}

Subject: ${createdTask.subject}
Reference: #${createdTask.ref}
Status: ${getSafeValue(createdTask.status_extra_info?.name, 'Default status')}
Project: ${getSafeValue(createdTask.project_extra_info?.name)}
User Story: #${createdTask.user_story_extra_info?.ref} - ${createdTask.user_story_extra_info?.subject}`;

      return createSuccessResponse(creationDetails);
    } catch (error) {
      return createErrorResponse(`Failed to create task: ${error.message}`);
    }
  }
};