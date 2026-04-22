/**
 * User Story related MCP tools
 */

import { z } from 'zod';
import { TaigaService } from '../taigaService.js';
import { RESPONSE_TEMPLATES, SUCCESS_MESSAGES, STATUS_LABELS } from '../constants.js';
import {
  resolveProjectId,
  findIdByName,
  formatUserStoryList,
  formatDateTime,
  getSafeValue,
  createErrorResponse,
  createSuccessResponse
} from '../utils.js';

const taigaService = new TaigaService();

async function resolveAssignedNames(story) {
  const ids = story.assigned_users;
  if (!ids || ids.length === 0) return 'Unassigned';
  if (ids.length === 1) return getSafeValue(story.assigned_to_extra_info?.full_name, `User ${ids[0]}`);
  try {
    const members = await taigaService.getProjectMembers(story.project);
    const names = ids.map(id => members.find(m => m.user === id)?.full_name || `User ${id}`);
    return names.join(', ');
  } catch {
    return getSafeValue(story.assigned_to_extra_info?.full_name, 'Unassigned');
  }
}

/**
 * Tool to list user stories in a project
 */
export const listUserStoriesTool = {
  name: 'listUserStories',
  schema: {
    projectIdentifier: z.string().describe('Project ID or slug'),
  },
  handler: async ({ projectIdentifier }) => {
    try {
      const projectId = await resolveProjectId(projectIdentifier);
      const userStories = await taigaService.listUserStories(projectId);

      if (userStories.length === 0) {
        return createErrorResponse(RESPONSE_TEMPLATES.NO_USER_STORIES);
      }

      const userStoriesText = `User Stories in Project:\n\n${formatUserStoryList(userStories)}`;
      return createSuccessResponse(userStoriesText);
    } catch (error) {
      return createErrorResponse(`Failed to list user stories: ${error.message}`);
    }
  }
};

/**
 * Tool to get single user story details
 */
export const getUserStoryTool = {
  name: 'getUserStory',
  schema: {
    userStoryId: z.string().describe('User Story internal ID, or ref (#N) when projectIdentifier is provided'),
    projectIdentifier: z.string().optional().describe('Project ID or slug. If provided, userStoryId is treated as ref (#N)'),
  },
  handler: async ({ userStoryId, projectIdentifier }) => {
    try {
      let projectId = null;
      if (projectIdentifier) {
        projectId = await resolveProjectId(projectIdentifier);
      }
      const userStory = await taigaService.getUserStory(userStoryId, projectId);
      const assignedNames = await resolveAssignedNames(userStory);

      const storyDetails = `User Story Details: #${userStory.ref} - ${userStory.subject}

📋 Basic Information:
- Project: ${getSafeValue(userStory.project_extra_info?.name)}
- Status: ${getSafeValue(userStory.status_extra_info?.name)}
- Epic: ${getSafeValue(userStory.epic_extra_info?.subject, 'No Epic')}

🎯 Assignment:
- Assigned to: ${assignedNames}
- Sprint: ${getSafeValue(userStory.milestone_extra_info?.name, 'No Sprint')}

📊 Metrics:
- Points: ${getSafeValue(userStory.total_points, '0')}
- Tasks: ${userStory.tasks?.length || 0}

📝 Description:
${getSafeValue(userStory.description, 'No description')}

🏷️ Tags: ${getSafeValue(userStory.tags?.join(', '), 'No tags')}`;

      return createSuccessResponse(storyDetails);
    } catch (error) {
      return createErrorResponse(`Failed to get user story details: ${error.message}`);
    }
  }
};

/**
 * Tool to create a new user story
 */
export const createUserStoryTool = {
  name: 'createUserStory',
  schema: {
    projectIdentifier: z.string().describe('Project ID or slug'),
    subject: z.string().describe('User story title/subject'),
    description: z.string().optional().describe('User story description'),
    status: z.string().optional().describe('Status name (e.g., "New", "In progress")'),
    tags: z.array(z.string()).optional().describe('Array of tags'),
  },
  handler: async ({ projectIdentifier, subject, description, status, tags }) => {
    try {
      const projectId = await resolveProjectId(projectIdentifier);

      // Get status ID if a status name was provided
      let statusId = undefined;
      if (status) {
        const statuses = await taigaService.getUserStoryStatuses(projectId);
        statusId = findIdByName(statuses, status);
      }

      // Create the user story
      const userStoryData = {
        project: projectId,
        subject,
        description,
        status: statusId,
        tags,
      };

      const createdStory = await taigaService.createUserStory(userStoryData);

      const creationDetails = `${SUCCESS_MESSAGES.USER_STORY_CREATED}

Subject: ${createdStory.subject}
Reference: #${createdStory.ref}
Status: ${getSafeValue(createdStory.status_extra_info?.name, 'Default status')}
Project: ${getSafeValue(createdStory.project_extra_info?.name)}`;

      return createSuccessResponse(creationDetails);
    } catch (error) {
      return createErrorResponse(`Failed to create user story: ${error.message}`);
    }
  }
};

/**
 * Tool to update user story fields (subject, description, tags)
 */
export const updateUserStoryTool = {
  name: 'updateUserStory',
  schema: {
    userStoryId: z.string().describe('User Story internal ID, or ref (#N) when projectIdentifier is provided'),
    projectIdentifier: z.string().optional().describe('Project ID or slug (required if userStoryId is a ref)'),
    subject: z.string().optional().describe('New title'),
    description: z.string().optional().describe('New description (supports Markdown)'),
    tags: z.array(z.string()).optional().describe('Replace tags with this list'),
  },
  handler: async ({ userStoryId, projectIdentifier, subject, description, tags }) => {
    try {
      const projectId = projectIdentifier ? await resolveProjectId(projectIdentifier) : null;
      const story = await taigaService.getUserStory(userStoryId, projectId);
      const updateData = {};
      if (subject !== undefined) updateData.subject = subject;
      if (description !== undefined) updateData.description = description;
      if (tags !== undefined) updateData.tags = tags;
      if (Object.keys(updateData).length === 0) {
        return createErrorResponse('Provide at least one field to update (subject, description, tags).');
      }
      const updated = await taigaService.updateUserStory(story.id, updateData);
      return createSuccessResponse(`User Story #${updated.ref} updated: ${Object.keys(updateData).join(', ')}`);
    } catch (error) {
      return createErrorResponse(`Failed to update user story: ${error.message}`);
    }
  }
};

/**
 * Tool to assign a user story to one or more team members (by name/email/id)
 */
export const assignUserStoryTool = {
  name: 'assignUserStory',
  schema: {
    userStoryId: z.string().describe('User Story internal ID, or ref (#N) when projectIdentifier is provided'),
    assignee: z.string().describe('Full name, username, email, or user_id. For multiple assignees, separate with commas (e.g. "Neyer, Bill"). Use "unassign" to clear all.'),
    projectIdentifier: z.string().optional().describe('Project ID or slug (required if userStoryId is a ref)'),
  },
  handler: async ({ userStoryId, assignee, projectIdentifier }) => {
    try {
      let projectId = projectIdentifier ? await resolveProjectId(projectIdentifier) : null;
      const userStory = await taigaService.getUserStory(userStoryId, projectId);
      if (!projectId) projectId = userStory.project;

      const assigneeList = assignee.split(',').map(a => a.trim());
      const isUnassign = assigneeList.length === 1 &&
        (assigneeList[0].toLowerCase() === 'unassign' || assigneeList[0].toLowerCase() === 'none');

      let assignedUserIds = [];
      if (!isUnassign) {
        const members = await taigaService.getProjectMembers(projectId);
        for (const name of assigneeList) {
          const needle = name.toLowerCase();
          const member = members.find(m =>
            m.user === parseInt(name) ||
            m.full_name?.toLowerCase() === needle ||
            m.full_name?.toLowerCase().includes(needle) ||
            m.user_email?.toLowerCase() === needle ||
            m.email?.toLowerCase() === needle
          );
          if (!member) {
            const available = members.map(m => `- ${m.full_name} (id:${m.user})`).join('\n');
            return createErrorResponse(`User "${name}" not found. Available:\n${available}`);
          }
          assignedUserIds.push(member.user);
        }
      }

      const updateData = {
        assigned_to: assignedUserIds.length > 0 ? assignedUserIds[0] : null,
        assigned_users: assignedUserIds,
      };
      await taigaService.updateUserStory(userStory.id, updateData);
      const fresh = await taigaService.getUserStory(userStory.id);
      const who = await resolveAssignedNames(fresh);
      return createSuccessResponse(`User Story #${fresh.ref} "${fresh.subject}" -> ${who}`);
    } catch (error) {
      return createErrorResponse(`Failed to assign user story: ${error.message}`);
    }
  }
};

/**
 * Tool to assign a user story to a sprint
 */
export const assignUserStoryToSprintTool = {
  name: 'assignUserStoryToSprint',
  schema: {
    userStoryId: z.string().describe('User Story ID'),
    milestoneId: z.string().optional().describe('Milestone (Sprint) ID. Set to null or omit to unassign from sprint.'),
  },
  handler: async ({ userStoryId, milestoneId }) => {
    try {
      const updateData = {
        milestone: milestoneId === 'null' || !milestoneId ? null : parseInt(milestoneId),
      };

      const updatedStory = await taigaService.updateUserStory(userStoryId, updateData);

      const status = updatedStory.milestone ?
        `User story #${updatedStory.ref} assigned to sprint ${updatedStory.milestone_extra_info?.name}` :
        `User story #${updatedStory.ref} unassigned from sprint`;

      return createSuccessResponse(status);
    } catch (error) {
      return createErrorResponse(`Failed to assign user story to sprint: ${error.message}`);
    }
  }
};

/**
 * Tool to reorder a user story in the kanban (move to top or bottom of its column)
 */
export const moveUserStoryTool = {
  name: 'moveUserStory',
  schema: {
    userStoryId: z.string().describe('User Story internal ID, or ref (#N) when projectIdentifier is provided'),
    projectIdentifier: z.string().optional().describe('Project ID or slug (required if userStoryId is a ref)'),
    position: z.union([
      z.enum(['top', 'bottom']),
      z.string().regex(/^\d+$/)
    ]).describe('"top" to move to first position in its column, "bottom" to last, or a numeric kanban_order value'),
  },
  handler: async ({ userStoryId, projectIdentifier, position }) => {
    try {
      const projectId = projectIdentifier ? await resolveProjectId(projectIdentifier) : null;
      const story = await taigaService.getUserStory(userStoryId, projectId);
      const updated = await taigaService.moveUserStoryInKanban(story.id, position);
      return createSuccessResponse(
        `User Story #${updated.ref} "${updated.subject}" moved to position ${updated.position} of column "${updated.status_extra_info?.name}".`
      );
    } catch (error) {
      return createErrorResponse(`Failed to move user story: ${error.message}`);
    }
  }
};

/**
 * Tool to update the status of a user story
 * Mirrors updateIssueStatus functionality for user stories
 */
export const updateUserStoryStatusTool = {
  name: 'updateUserStoryStatus',
  schema: {
    userStoryId: z.string().describe('User Story ID or reference number'),
    status: z.string().describe('Name of the target status (e.g., "New", "Ready", "In Progress", "Done")'),
    projectIdentifier: z.string().optional().describe('Project ID or slug (required if using reference number)'),
  },
  handler: async ({ userStoryId, status, projectIdentifier }) => {
    try {
      // Get the user story first to determine project
      const userStory = await taigaService.getUserStory(userStoryId);
      const projectId = userStory.project;

      // Get available statuses for this project
      const statuses = await taigaService.getUserStoryStatuses(projectId);
      const statusId = findIdByName(statuses, status);

      if (!statusId) {
        const availableStatuses = statuses.map(s => `- ${s.name} (ID: ${s.id})`).join('\n');
        return createErrorResponse(
          `Invalid status name: "${status}". Available statuses for project "${userStory.project_extra_info?.name}":\n${availableStatuses}`
        );
      }

      // Update the user story status
      const updatedStory = await taigaService.updateUserStory(userStoryId, { status: statusId });

      const successMessage = `Successfully updated status for user story #${updatedStory.ref} to "${updatedStory.status_extra_info?.name}".

User Story Details:
- Subject: ${updatedStory.subject}
- Project: ${getSafeValue(updatedStory.project_extra_info?.name)}
- New Status: ${getSafeValue(updatedStory.status_extra_info?.name)}
- Assigned to: ${updatedStory.assigned_users_extra_info?.length > 0 ? updatedStory.assigned_users_extra_info.map(u => u.full_name).join(', ') : 'Unassigned'}
- Sprint: ${getSafeValue(updatedStory.milestone_extra_info?.name, 'No Sprint')}`;

      return createSuccessResponse(successMessage);
    } catch (error) {
      return createErrorResponse(`Failed to update user story status: ${error.message}`);
    }
  }
};