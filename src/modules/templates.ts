import { BaseClient } from '../client/base';
import { Template } from '../types';

/**
 * Templates module for managing AI templates (Admin only)
 */
export class Templates extends BaseClient {
  /**
   * List all templates (Super admin only)
   */
  async list(): Promise<Template[]> {
    return this.post<Template[]>('/api/templates/list', {});
  }

  /**
   * Create a new template (Super admin only)
   */
  async create(data: {
    type: string;
    template_name: string;
    template: string;
  }): Promise<Template[]> {
    return this.post<Template[]>('/api/templates/new', data);
  }

  /**
   * Update an existing template (Super admin only)
   */
  async update(templateId: string, template: string): Promise<Template[]> {
    return this.post<Template[]>('/api/templates/edit', {
      id: templateId,
      templateToEdit: template,
    });
  }

  /**
   * Delete a template (Super admin only)
   */
  async deleteTemplate(templateId: string): Promise<Template[]> {
    return this.post<Template[]>('/api/templates/delete', {
      templateToDelete: templateId,
    });
  }

  /**
   * Set a template as active (Super admin only)
   */
  async setActive(templateId: string): Promise<Template[]> {
    return this.post<Template[]>('/api/templates/set-active', { id: templateId });
  }
}