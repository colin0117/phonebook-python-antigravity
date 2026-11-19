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

export interface AppSettings {
  settings_display_enabled: boolean;
  duplicates_enabled: boolean;
  duplicates_match_name: boolean;
  duplicates_match_phone: boolean;
  duplicates_match_email: boolean;
  duplicates_match_dob: boolean;
  [key: string]: boolean | string | undefined;
}

export interface SettingItemRow {
  setting_key: string;
  setting_value: string;
  enabled: boolean | null;
  description: string;
  updated_at?: string;
}

export class ApiHelper {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getContacts(): Promise<APIResponse> {
    return await this.request.get('/api/contacts');
  }

  async getAllContacts(): Promise<ContactPayload[]> {
    const res = await this.getContacts();
    const body = await res.json();
    return body.data || [];
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

  async getSettings(): Promise<AppSettings> {
    const res = await this.request.get('/api/settings');
    const body = await res.json();
    return body.settings || {
      settings_display_enabled: true,
      duplicates_enabled: true,
      duplicates_match_name: true,
      duplicates_match_phone: true,
      duplicates_match_email: true,
      duplicates_match_dob: false
    };
  }

  async getSettingsItems(): Promise<SettingItemRow[]> {
    const res = await this.request.get('/api/settings');
    const body = await res.json();
    return body.items || [];
  }

  async updateSettings(payload: Partial<AppSettings>): Promise<AppSettings> {
    const res = await this.request.put('/api/settings', { data: payload });
    const body = await res.json();
    return body.settings;
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
