import { BaseClient } from '../client/base';
import { SendEmailRequest, SendEmailResponse, GoogleDriveDownloadRequest } from '../types';

/**
 * Email and integrations module
 */
export class Integrations extends BaseClient {
  /**
   * Send an email
   */
  async sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
    return this.post<SendEmailResponse>('/api/email/send', request);
  }

  /**
   * Download file from Google Drive
   */
  async downloadFromGoogleDrive(request: GoogleDriveDownloadRequest): Promise<Blob> {
    const response = await this.axios.request({
      method: 'POST',
      url: '/api/google-drive/download',
      data: request,
      responseType: 'blob',
    });
    return response.data;
  }
}