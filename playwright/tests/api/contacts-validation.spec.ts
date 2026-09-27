import { test, expect } from '@playwright/test';
import { ContactActionResponse } from './api-types';

test.describe('Contacts API Validation & Error Handling', () => {
  const createdIds: number[] = [];

  test.afterEach(async ({ request }) => {
    while (createdIds.length > 0) {
      const id = createdIds.pop();
      if (id) {
        try {
          await request.delete(`/api/contacts/${id}`);
        } catch {
          // ignore
        }
      }
    }
  });

  test('POST /api/contacts - rejects payload when first_name is missing (400 Bad Request)', async ({ request }) => {
    const res = await request.post('/api/contacts', {
      data: {
        last_name: 'SoloLast',
        phone_number: '+1 555-0101'
      }
    });

    expect(res.status()).toBe(400);
    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('First name, last name, and phone number are required.');
  });

  test('POST /api/contacts - rejects payload when last_name is missing (400 Bad Request)', async ({ request }) => {
    const res = await request.post('/api/contacts', {
      data: {
        first_name: 'SoloFirst',
        phone_number: '+1 555-0101'
      }
    });

    expect(res.status()).toBe(400);
    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('First name, last name, and phone number are required.');
  });

  test('POST /api/contacts - rejects payload when phone_number is missing (400 Bad Request)', async ({ request }) => {
    const res = await request.post('/api/contacts', {
      data: {
        first_name: 'NoPhone',
        last_name: 'Person'
      }
    });

    expect(res.status()).toBe(400);
    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('First name, last name, and phone number are required.');
  });

  test('POST /api/contacts - rejects whitespace-only required fields (400 Bad Request)', async ({ request }) => {
    const res = await request.post('/api/contacts', {
      data: {
        first_name: '   ',
        last_name: 'WhiteSpaced',
        phone_number: '+1 555-0101'
      }
    });

    expect(res.status()).toBe(400);
    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('First name, last name, and phone number are required.');
  });

  test('POST /api/contacts - allows omitting optional fields and sets General default (201 Created)', async ({ request }) => {
    const res = await request.post('/api/contacts', {
      data: {
        first_name: 'Minimal',
        last_name: `Contact_${Date.now()}`,
        phone_number: '+1 555-1234'
      }
    });

    expect(res.status()).toBe(201);
    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('success');
    expect(body.id).toBeDefined();
    expect(body.dob_details).toBeUndefined();
    expect(body.dob_fact).toBeUndefined();
    createdIds.push(body.id!);
  });

  test('PUT /api/contacts/:id - rejects update when required fields are cleared (400 Bad Request)', async ({ request }) => {
    // 1. Create a contact
    const createRes = await request.post('/api/contacts', {
      data: {
        first_name: 'Test',
        last_name: `UpdateVal_${Date.now()}`,
        phone_number: '+1 555-3333'
      }
    });
    const created: ContactActionResponse = await createRes.json();
    const id = created.id!;
    createdIds.push(id);

    // 2. Try to update with empty first_name
    const res = await request.put(`/api/contacts/${id}`, {
      data: {
        first_name: '',
        last_name: 'ValidLast',
        phone_number: '+1 555-3333'
      }
    });

    expect(res.status()).toBe(400);
    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('First name, last name, and phone number are required.');
  });

  test('PUT /api/contacts/:id - returns 404 when contact ID does not exist', async ({ request }) => {
    const res = await request.put('/api/contacts/99999999', {
      data: {
        first_name: 'Ghost',
        last_name: 'User',
        phone_number: '+1 555-0000'
      }
    });

    expect(res.status()).toBe(404);
    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('Contact not found');
  });

  test('DELETE /api/contacts/:id - returns 404 when contact ID does not exist', async ({ request }) => {
    const res = await request.delete('/api/contacts/99999999');

    expect(res.status()).toBe(404);
    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('Contact not found');
  });
});
