import { test, expect } from '@playwright/test';
import { SettingsResponse, DuplicatesResponse, ContactActionResponse } from './api-types';

test.describe('Duplicate Contacts API (/api/contacts/duplicates)', () => {
  const createdIds: number[] = [];

  test.afterEach(async ({ request }) => {
    while (createdIds.length > 0) {
      const id = createdIds.pop();
      if (id) {
        try {
          await request.delete(`/api/contacts/${id}`);
        } catch {
          // ignore cleanup failures
        }
      }
    }
  });

  test('GET /api/contacts/duplicates - returns valid schema and active settings snapshot', async ({ request }) => {
    const res = await request.get('/api/contacts/duplicates');
    expect(res.status()).toBe(200);

    const body: DuplicatesResponse = await res.json();
    expect(body.status).toBe('success');
    expect(typeof body.duplicate_group_count).toBe('number');
    expect(Array.isArray(body.duplicate_contact_ids)).toBe(true);
    expect(Array.isArray(body.groups)).toBe(true);
    expect(body.settings).toBeDefined();
  });

  test('GET /api/contacts/duplicates - groups duplicate contacts according to the active database settings', async ({ request }) => {
    const settingsRes = await request.get('/api/settings');
    const { settings }: SettingsResponse = await settingsRes.json();

    const suffix = Date.now();
    const sharedLastName = `ApiDupNameTest_${suffix}`;
    const sharedPhoneFormatted = '+1 (555) 818-9292';
    const sharedPhonePlain = '555-818-9292';
    const sharedEmail = `shared_${suffix}@apidup.test`;
    const sharedDob = '1964-02-29';

    // Pair matching on Name, normalized Phone Number, Email, and Date of Birth
    const c1Res = await request.post('/api/contacts', {
      data: {
        first_name: 'ApiDupShared',
        last_name: sharedLastName,
        phone_number: sharedPhoneFormatted,
        email: sharedEmail,
        date_of_birth: sharedDob,
        category: 'Work'
      }
    });
    const c1: ContactActionResponse = await c1Res.json();
    createdIds.push(c1.id!);

    const c2Res = await request.post('/api/contacts', {
      data: {
        first_name: 'ApiDupShared',
        last_name: sharedLastName,
        phone_number: sharedPhonePlain,
        email: sharedEmail,
        date_of_birth: sharedDob,
        category: 'Work'
      }
    });
    const c2: ContactActionResponse = await c2Res.json();
    createdIds.push(c2.id!);

    const dupRes = await request.get('/api/contacts/duplicates');
    expect(dupRes.status()).toBe(200);
    const dupBody: DuplicatesResponse = await dupRes.json();
    expect(dupBody.status).toBe('success');

    if (!settings.duplicates_enabled) {
      expect(dupBody.duplicate_group_count).toBe(0);
      expect(dupBody.groups).toHaveLength(0);
      return;
    }

    const hasNameGroup = dupBody.groups.some(
      g => g.field === 'Name' && g.match_key === `apidupshared ${sharedLastName.toLowerCase()}`
    );
    const hasPhoneGroup = dupBody.groups.some(
      g => g.field === 'Phone Number' && g.match_key === '5558189292'
    );
    const hasEmailGroup = dupBody.groups.some(
      g => g.field === 'Email' && g.match_key === sharedEmail
    );
    const hasDobGroup = dupBody.groups.some(
      g => g.field === 'Date of Birth' && g.match_key === sharedDob
    );

    expect(hasNameGroup).toBe(Boolean(dupBody.settings.duplicates_match_name));
    expect(hasPhoneGroup).toBe(Boolean(dupBody.settings.duplicates_match_phone));
    expect(hasEmailGroup).toBe(Boolean(dupBody.settings.duplicates_match_email));
    expect(hasDobGroup).toBe(Boolean(dupBody.settings.duplicates_match_dob));
  });
});
