import { test, expect } from '@playwright/test';
import { SettingsResponse, SettingsMap } from './api-types';

test.describe('Application Settings API (/api/settings)', () => {
  let initialSettings: SettingsMap | null = null;

  test.beforeEach(async ({ request }) => {
    const res = await request.get('/api/settings');
    expect(res.status()).toBe(200);
    const body: SettingsResponse = await res.json();
    initialSettings = { ...body.settings };
  });

  test.afterEach(async ({ request }) => {
    if (initialSettings) {
      await request.put('/api/settings', { data: initialSettings });
    }
  });

  test('GET /api/settings - returns all configured boolean settings and metadata items', async ({ request }) => {
    const res = await request.get('/api/settings');
    expect(res.status()).toBe(200);

    const body: SettingsResponse = await res.json();
    expect(body.status).toBe('success');
    expect(body.settings).toBeDefined();

    const expectedKeys = [
      'settings_display_enabled',
      'duplicates_enabled',
      'duplicates_match_name',
      'duplicates_match_phone',
      'duplicates_match_email',
      'duplicates_match_dob'
    ];

    for (const key of expectedKeys) {
      expect(typeof body.settings[key]).toBe('boolean');
    }

    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items!.length).toBeGreaterThanOrEqual(expectedKeys.length);

    for (const key of expectedKeys) {
      const item = body.items!.find(i => i.setting_key === key);
      expect(item, `Expected settings items to include "${key}"`).toBeDefined();
      expect(typeof item!.description).toBe('string');
      expect(item!.description.length).toBeGreaterThan(5);
      expect(['true', 'false']).toContain(item!.setting_value);
    }
  });

  test('PUT /api/settings - updates boolean settings and persists changes in MySQL', async ({ request }) => {
    const currentVal = Boolean(initialSettings?.duplicates_match_dob);
    const toggledVal = !currentVal;

    const putRes = await request.put('/api/settings', {
      data: { duplicates_match_dob: toggledVal }
    });
    expect(putRes.status()).toBe(200);

    const putBody: SettingsResponse = await putRes.json();
    expect(putBody.status).toBe('success');
    expect(putBody.settings.duplicates_match_dob).toBe(toggledVal);

    const getRes = await request.get('/api/settings');
    expect(getRes.status()).toBe(200);
    const getBody: SettingsResponse = await getRes.json();
    expect(getBody.settings.duplicates_match_dob).toBe(toggledVal);

    const item = getBody.items?.find(i => i.setting_key === 'duplicates_match_dob');
    expect(item?.setting_value).toBe(toggledVal ? 'true' : 'false');
  });

  test('PUT /api/settings - normalizes string boolean values ("true"/"false") into boolean settings', async ({ request }) => {
    const putRes = await request.put('/api/settings', {
      data: { settings_display_enabled: 'false' }
    });
    expect(putRes.status()).toBe(200);

    const putBody: SettingsResponse = await putRes.json();
    expect(putBody.status).toBe('success');
    expect(putBody.settings.settings_display_enabled).toBe(false);

    const restoreRes = await request.put('/api/settings', {
      data: { settings_display_enabled: 'true' }
    });
    expect(restoreRes.status()).toBe(200);
    const restoreBody: SettingsResponse = await restoreRes.json();
    expect(restoreBody.settings.settings_display_enabled).toBe(true);
  });
});
