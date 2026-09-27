import { APIRequestContext, APIResponse } from '@playwright/test';

export interface ContactPayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email?: string;
  date_of_birth?: string | null;
  category?: string;
  notes?: string;
}

export class ApiHelper {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getContacts(): Promise<APIResponse> {
    return await this.request.get('/api/contacts');
  }

  async createContact(payload: ContactPayload | Record<string, string>): Promise<APIResponse> {
    return await this.request.post('/api/contacts', { data: payload });
  }

  async updateContact(id: number, payload: ContactPayload | Record<string, string>): Promise<APIResponse> {
    return await this.request.put(`/api/contacts/${id}`, { data: payload });
  }

  async deleteContact(id: number): Promise<APIResponse> {
    return await this.request.delete(`/api/contacts/${id}`);
  }

  async getDobFacts(dob?: string): Promise<APIResponse> {
    const url = dob ? `/api/dob-facts?dob=${encodeURIComponent(dob)}` : '/api/dob-facts';
    return await this.request.get(url);
  }

  async cleanupContactsMatching(filterFn: (lastName: string) => boolean): Promise<number> {
    let deletedCount = 0;
    try {
      const res = await this.getContacts();
      if (res.ok()) {
        const body = await res.json();
        const contacts = body.data || [];
        for (const c of contacts) {
          if (filterFn(c.last_name || '')) {
            await this.deleteContact(c.id);
            deletedCount++;
          }
        }
      }
    } catch {
      // Ignored during cleanup
    }
    return deletedCount;
  }
}
