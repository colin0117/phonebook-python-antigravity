import { test, expect } from '@playwright/test';
import { ContactsResponse, ContactActionResponse } from './api-types';

test.describe('Contacts CRUD API (/api/contacts)', () => {
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

  test('GET /api/contacts - returns array of contacts with 200 OK and valid schema', async ({ request }) => {
    const res = await request.get('/api/contacts');
    expect(res.status()).toBe(200);

    const body: ContactsResponse = await res.json();
    expect(body.status).toBe('success');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data!.length).toBeGreaterThan(0);

    // Verify first contact schema
    const contact = body.data![0];
    expect(contact).toHaveProperty('id');
    expect(contact).toHaveProperty('first_name');
    expect(contact).toHaveProperty('last_name');
    expect(contact).toHaveProperty('phone_number');
    expect(typeof contact.id).toBe('number');
    expect(typeof contact.first_name).toBe('string');
    expect(typeof contact.last_name).toBe('string');
  });

  test('POST /api/contacts - creates contact with DOB and receives 201 Created and birthday insights', async ({ request }) => {
    const uniqueSuffix = Date.now();
    const newContact = {
      first_name: `CrudFirst_${uniqueSuffix}`,
      last_name: `CrudLast_${uniqueSuffix}`,
      phone_number: '+1 (555) 777-8888',
      email: `crud_${uniqueSuffix}@example.com`,
      date_of_birth: '1992-04-18', // Aries
      category: 'Work',
      notes: 'Automated Playwright API test contact'
    };

    const res = await request.post('/api/contacts', { data: newContact });
    expect(res.status()).toBe(201);

    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('success');
    expect(body.message).toBe('Contact added successfully!');
    expect(body.id).toBeDefined();
    expect(typeof body.id).toBe('number');
    createdIds.push(body.id!);

    // Content verification: birthday insights returned
    expect(body.dob_details).toBeDefined();
    expect(body.dob_details?.star_sign.sign).toBe('Aries');
    expect(body.dob_details?.star_sign.symbol).toBe('♈');
    expect(body.dob_fact).toContain('🎉 Fun Date Fact:');

    // Content verification: check GET /api/contacts reflects newly created contact
    const listRes = await request.get('/api/contacts');
    const listBody: ContactsResponse = await listRes.json();
    const found = listBody.data?.find(c => c.id === body.id);
    expect(found).toBeDefined();
    expect(found?.first_name).toBe(newContact.first_name);
    expect(found?.last_name).toBe(newContact.last_name);
    expect(found?.phone_number).toBe(newContact.phone_number);
    expect(found?.email).toBe(newContact.email);
    expect(found?.date_of_birth).toBe(newContact.date_of_birth);
    expect(found?.category).toBe(newContact.category);
    expect(found?.notes).toBe(newContact.notes);
  });

  test('PUT /api/contacts/:id - updates an existing contact and verifies persisted state', async ({ request }) => {
    // 1. Create a contact first
    const createRes = await request.post('/api/contacts', {
      data: {
        first_name: 'OriginalFirst',
        last_name: `OrigLast_${Date.now()}`,
        phone_number: '+1 555-1111',
        category: 'General'
      }
    });
    expect(createRes.status()).toBe(201);
    const created: ContactActionResponse = await createRes.json();
    const contactId = created.id!;
    createdIds.push(contactId);

    // 2. Update the contact
    const updatedPayload = {
      first_name: 'UpdatedFirst',
      last_name: 'UpdatedLast',
      phone_number: '+1 555-9999',
      email: 'updated@example.com',
      date_of_birth: '1985-11-20', // Scorpio
      category: 'Family',
      notes: 'Updated notes via API'
    };

    const updateRes = await request.put(`/api/contacts/${contactId}`, { data: updatedPayload });
    expect(updateRes.status()).toBe(200);

    const updateBody: ContactActionResponse = await updateRes.json();
    expect(updateBody.status).toBe('success');
    expect(updateBody.message).toBe('Contact updated successfully!');
    expect(updateBody.dob_details?.star_sign.sign).toBe('Scorpio');
    expect(updateBody.dob_details?.star_sign.symbol).toBe('♏');

    // 3. Verify changes persisted in GET /api/contacts
    const getRes = await request.get('/api/contacts');
    const getBody: ContactsResponse = await getRes.json();
    const found = getBody.data?.find(c => c.id === contactId);
    expect(found).toBeDefined();
    expect(found?.first_name).toBe('UpdatedFirst');
    expect(found?.last_name).toBe('UpdatedLast');
    expect(found?.phone_number).toBe('+1 555-9999');
    expect(found?.category).toBe('Family');
    expect(found?.date_of_birth).toBe('1985-11-20');
  });

  test('DELETE /api/contacts/:id - deletes contact and prevents subsequent access', async ({ request }) => {
    // 1. Create contact to delete
    const createRes = await request.post('/api/contacts', {
      data: {
        first_name: 'ToDelete',
        last_name: `DeleteMe_${Date.now()}`,
        phone_number: '+1 555-0000'
      }
    });
    expect(createRes.status()).toBe(201);
    const created: ContactActionResponse = await createRes.json();
    const contactId = created.id!;

    // 2. Delete contact
    const delRes = await request.delete(`/api/contacts/${contactId}`);
    expect(delRes.status()).toBe(200);
    const delBody: ContactActionResponse = await delRes.json();
    expect(delBody.status).toBe('success');
    expect(delBody.message).toBe('Contact deleted successfully.');

    // 3. Verify contact is no longer in GET /api/contacts
    const listRes = await request.get('/api/contacts');
    const listBody: ContactsResponse = await listRes.json();
    const exists = listBody.data?.some(c => c.id === contactId);
    expect(exists).toBe(false);

    // 4. Repeated DELETE returns 404
    const repeatDelRes = await request.delete(`/api/contacts/${contactId}`);
    expect(repeatDelRes.status()).toBe(404);
  });
});
