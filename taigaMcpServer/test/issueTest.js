import chai from 'chai';
import sinon from 'sinon';
import { updateIssueStatusTool } from '../src/tools/issueTools.js';
import * as utils from '../src/utils.js'; // To mock resolveIssue
import { TaigaService } from '../src/taigaService.js';
import { STATUS_LABELS } from '../src/constants.js';

const { expect } = chai;

describe('updateIssueStatusTool', () => {
  let sandbox;
  let mockTaigaService;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    // Mock TaigaService methods
    mockTaigaService = sandbox.stub(TaigaService.prototype);
    // Mock utility functions
    sandbox.stub(utils, 'resolveIssue');
    // findIdByName is also from utils, but it's pure logic, so we might not need to mock it unless complex.
    // For now, let's assume findIdByName works as expected or mock it if tests become complex.
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should successfully update an issue status', async () => {
    const issueIdentifier = '123';
    const statusName = 'In Progress';
    const projectIdentifier = undefined; // Not using projectIdentifier in this specific case for resolveIssue

    const mockIssue = {
      id: 123,
      ref: 123,
      subject: 'Test Issue',
      project: 1,
      project_extra_info: { name: 'Test Project' },
      status_extra_info: { name: 'New' },
      assigned_to_extra_info: null,
      milestone_extra_info: null,
    };
    utils.resolveIssue.resolves(mockIssue);

    const mockStatuses = [
      { id: 1, name: 'New', project: 1 },
      { id: 2, name: 'In Progress', project: 1 },
      { id: 3, name: 'Done', project: 1 },
    ];
    mockTaigaService.getIssueStatuses.resolves(mockStatuses);

    const targetStatusId = 2; // 'In Progress'
    const updatedIssueDetails = {
      ...mockIssue,
      status: targetStatusId,
      status_extra_info: { name: 'In Progress' },
    };
    mockTaigaService.updateIssue.resolves(updatedIssueDetails);

    const result = await updateIssueStatusTool.handler({
      issueIdentifier,
      status: statusName,
      projectIdentifier,
    });

    expect(utils.resolveIssue.calledOnceWith(issueIdentifier, projectIdentifier)).to.be.true;
    expect(mockTaigaService.getIssueStatuses.calledOnceWith(mockIssue.project)).to.be.true;
    expect(mockTaigaService.updateIssue.calledOnceWith(mockIssue.id, { status: targetStatusId })).to.be.true;
    expect(result.success).to.be.true;
    expect(result.message).to.include(`Successfully updated status for issue #${updatedIssueDetails.ref} to "In Progress"`);
    expect(result.message).to.include(`Subject: ${updatedIssueDetails.subject}`);
    expect(result.message).to.include(`Project: ${updatedIssueDetails.project_extra_info.name}`);
    expect(result.message).to.include(`New Status: In Progress`);
  });

  it('should return error for invalid status name and list available statuses', async () => {
    const issueIdentifier = '123';
    const invalidStatusName = 'NonExistentStatus';
    const projectIdentifier = undefined;

    const mockIssue = {
      id: 123,
      ref: 123,
      subject: 'Test Issue',
      project: 1,
      project_extra_info: { name: 'Test Project' },
    };
    utils.resolveIssue.resolves(mockIssue);

    const mockStatuses = [
      { id: 1, name: 'New', project: 1 },
      { id: 2, name: 'Open', project: 1 },
    ];
    mockTaigaService.getIssueStatuses.resolves(mockStatuses);

    const result = await updateIssueStatusTool.handler({
      issueIdentifier,
      status: invalidStatusName,
      projectIdentifier,
    });

    expect(utils.resolveIssue.calledOnceWith(issueIdentifier, projectIdentifier)).to.be.true;
    expect(mockTaigaService.getIssueStatuses.calledOnceWith(mockIssue.project)).to.be.true;
    expect(mockTaigaService.updateIssue.called).to.be.false; // Crucially, updateIssue should not be called
    expect(result.success).to.be.false;
    expect(result.message).to.include(`Invalid status name: "${invalidStatusName}"`);
    expect(result.message).to.include(`Available statuses for project "${mockIssue.project_extra_info.name}":`);
    expect(result.message).to.include('- New (ID: 1)');
    expect(result.message).to.include('- Open (ID: 2)');
  });

  it('should return error if resolveIssue throws (e.g., issue not found)', async () => {
    const issueIdentifier = '999'; // Non-existent issue
    const statusName = 'In Progress';
    const projectIdentifier = 'proj-slug';
    const errorMessage = 'Issue not found';

    utils.resolveIssue.rejects(new Error(errorMessage));

    const result = await updateIssueStatusTool.handler({
      issueIdentifier,
      status: statusName,
      projectIdentifier,
    });

    expect(utils.resolveIssue.calledOnceWith(issueIdentifier, projectIdentifier)).to.be.true;
    expect(mockTaigaService.getIssueStatuses.called).to.be.false;
    expect(mockTaigaService.updateIssue.called).to.be.false;
    expect(result.success).to.be.false;
    expect(result.message).to.equal(`Failed to update issue status: ${errorMessage}`);
  });

  it('should successfully update status when using issue reference and project identifier', async () => {
    const issueIdentifier = '#42'; // Issue reference
    const statusName = 'Done';
    const projectIdentifier = 'my-project-slug';

    const mockIssue = {
      id: 789,
      ref: 42,
      subject: 'Another Test Issue',
      project: 2, // Different project ID
      project_extra_info: { name: 'My Project' },
      status_extra_info: { name: 'In Progress' },
      assigned_to_extra_info: { full_name: 'Test User' },
      milestone_extra_info: { name: 'Sprint 1' },
    };
    utils.resolveIssue.resolves(mockIssue); // Mock resolveIssue to return this issue

    const mockStatuses = [
      { id: 1, name: 'Open', project: 2 },
      { id: 2, name: 'In Progress', project: 2 },
      { id: 3, name: 'Done', project: 2 },
    ];
    mockTaigaService.getIssueStatuses.resolves(mockStatuses);

    const targetStatusId = 3; // 'Done'
    const updatedIssueDetails = {
      ...mockIssue,
      status: targetStatusId,
      status_extra_info: { name: 'Done' },
    };
    mockTaigaService.updateIssue.resolves(updatedIssueDetails);

    const result = await updateIssueStatusTool.handler({
      issueIdentifier,
      status: statusName,
      projectIdentifier,
    });

    // Crucially check that resolveIssue was called with both identifiers
    expect(utils.resolveIssue.calledOnceWith(issueIdentifier, projectIdentifier)).to.be.true;
    expect(mockTaigaService.getIssueStatuses.calledOnceWith(mockIssue.project)).to.be.true;
    expect(mockTaigaService.updateIssue.calledOnceWith(mockIssue.id, { status: targetStatusId })).to.be.true;
    expect(result.success).to.be.true;
    expect(result.message).to.include(`Successfully updated status for issue #${updatedIssueDetails.ref} to "Done"`);
    expect(result.message).to.include(`Project: ${updatedIssueDetails.project_extra_info.name}`);
    expect(result.message).to.include(`New Status: Done`);
    expect(result.message).to.include(`Assigned to: ${mockIssue.assigned_to_extra_info.full_name}`);
    expect(result.message).to.include(`Sprint: ${mockIssue.milestone_extra_info.name}`);
  });

});
