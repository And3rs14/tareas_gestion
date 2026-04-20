/**
 * Project-related MCP tools
 */

import { z } from 'zod';
import { TaigaService } from '../taigaService.js';
import { RESPONSE_TEMPLATES } from '../constants.js';
import {
  formatProjectList,
  formatDateTime,
  createErrorResponse,
  createSuccessResponse,
  getSafeValue,
  resolveProjectId
} from '../utils.js';

const taigaService = new TaigaService();

/**
 * Tool to list project members
 */
export const listProjectMembersTool = {
  name: 'listProjectMembers',
  schema: {
    projectIdentifier: z.string().describe('Project ID or slug'),
  },
  handler: async ({ projectIdentifier }) => {
    try {
      const projectId = await resolveProjectId(projectIdentifier);
      const members = await taigaService.getProjectMembers(projectId);
      if (!members || members.length === 0) {
        return createErrorResponse('No members found in this project.');
      }
      const list = members.map(m =>
        `- ${getSafeValue(m.full_name, m.user_email || m.email || 'unknown')} (user_id: ${m.user}, email: ${getSafeValue(m.user_email || m.email)})`
      ).join('\n');
      return createSuccessResponse(`Project Members:\n\n${list}`);
    } catch (error) {
      return createErrorResponse(`Failed to list project members: ${error.message}`);
    }
  }
};

/**
 * Tool to list all user projects
 */
export const listProjectsTool = {
  name: 'listProjects',
  schema: {},
  handler: async () => {
    try {
      const projects = await taigaService.listProjects();

      if (projects.length === 0) {
        return createErrorResponse(RESPONSE_TEMPLATES.NO_PROJECTS);
      }

      const projectsText = `Your Taiga Projects:\n\n${formatProjectList(projects)}`;
      return createSuccessResponse(projectsText);
    } catch (error) {
      return createErrorResponse(`Failed to list projects: ${error.message}`);
    }
  }
};

/**
 * Tool to get project details
 */
export const getProjectTool = {
  name: 'getProject',
  schema: {
    projectIdentifier: z.string().describe('Project ID or slug'),
  },
  handler: async ({ projectIdentifier }) => {
    try {
      let project;

      // Try to get project by ID first
      if (!isNaN(projectIdentifier)) {
        try {
          project = await taigaService.getProject(projectIdentifier);
        } catch (error) {
          // If that fails, try by slug
          project = await taigaService.getProjectBySlug(projectIdentifier);
        }
      } else {
        // If it's not a number, try by slug
        project = await taigaService.getProjectBySlug(projectIdentifier);
      }

      const projectDetails = `Project Details:

Name: ${project.name}
ID: ${project.id}
Slug: ${project.slug}
Description: ${getSafeValue(project.description, 'No description')}
Created: ${formatDateTime(project.created_date)}
Total Members: ${project.total_memberships}`;

      return createSuccessResponse(projectDetails);
    } catch (error) {
      return createErrorResponse(`Failed to get project details: ${error.message}`);
    }
  }
};