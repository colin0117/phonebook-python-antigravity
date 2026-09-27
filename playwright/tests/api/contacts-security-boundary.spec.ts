import { test, expect } from '@playwright/test';
import { ContactActionResponse, ContactsResponse } from './api-types';

test.describe('Security, Unicode, & Boundary API Testing', () => {
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

  test('POST /api/contacts - rejects invalid date of birth format (400 Bad Request)', async ({ request }) => {
    const res = await request.post('/api/contacts', {
      data: {
        first_name: 'Invalid',
        last_name: 'DobUser',
        phone_number: '+1 555-0199',
        date_of_birth: 'not-a-valid-date'
      }
    });

    expect(res.status()).toBe(400);
    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('Invalid date of birth format. Expected YYYY-MM-DD.');
  });

  test('POST /api/contacts - rejects non-existent calendar date (e.g. 2025-02-31) (400 Bad Request)', async ({ request }) => {
    const res = await request.post('/api/contacts', {
      data: {
        first_name: 'Leap',
        last_name: 'Fail',
        phone_number: '+1 555-0199',
        date_of_birth: '2025-02-31'
      }
    });

    expect(res.status()).toBe(400);
    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('Invalid date of birth format. Expected YYYY-MM-DD.');
  });

  test('PUT /api/contacts/:id - rejects invalid date of birth on update (400 Bad Request)', async ({ request }) => {
    // 1. Create valid contact
    const createRes = await request.post('/api/contacts', {
      data: {
        first_name: 'ValidFirst',
        last_name: `UpdateDob_${Date.now()}`,
        phone_number: '+1 555-0123'
      }
    });
    expect(createRes.status()).toBe(201);
    const created: ContactActionResponse = await createRes.json();
    const id = created.id!;
    createdIds.push(id);

    // 2. Try to update with malformed DOB
    const res = await request.put(`/api/contacts/${id}`, {
      data: {
        first_name: 'ValidFirst',
        last_name: 'UpdateDob',
        phone_number: '+1 555-0123',
        date_of_birth: '31/12/1990' // Wrong date format
      }
    });

    expect(res.status()).toBe(400);
    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('Invalid date of birth format. Expected YYYY-MM-DD.');
  });

  test('POST /api/contacts - enforces maximum length boundary on names (400 Bad Request)', async ({ request }) => {
    const overlyLongName = 'A'.repeat(105); // Schema limit is VARCHAR(100)
    const res = await request.post('/api/contacts', {
      data: {
        first_name: overlyLongName,
        last_name: 'BoundaryTest',
        phone_number: '+1 555-0199'
      }
    });

    expect(res.status()).toBe(400);
    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('First and last names cannot exceed 100 characters.');
  });

  test('SQL Injection resistance: parameterized queries safely store payload as literal string', async ({ request }) => {
    const sqlInjectionPayload = "Robert'); DROP TABLE contacts;--";
    const res = await request.post('/api/contacts', {
      data: {
        first_name: sqlInjectionPayload,
        last_name: "O'Reilly-SQL",
        phone_number: "+1 (555) 666-7777",
        notes: "Trying: ' OR '1'='1"
      }
    });

    expect(res.status()).toBe(201);
    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('success');
    const id = body.id!;
    createdIds.push(id);

    // Verify contact table was NOT dropped and record is preserved literally
    const listRes = await request.get('/api/contacts');
    expect(listRes.status()).toBe(200);
    const listBody: ContactsResponse = await listRes.json();
    const saved = listBody.data?.find(c => c.id === id);

    expect(saved).toBeDefined();
    expect(saved?.first_name).toBe(sqlInjectionPayload);
    expect(saved?.last_name).toBe("O'Reilly-SQL");
    expect(saved?.notes).toBe("Trying: ' OR '1'='1");
  });

  test('Unicode & Multi-Byte UTF-8: safely handles accents, umlauts, and emojis (utf8mb4)', async ({ request }) => {
    const unicodeContact = {
      first_name: 'Zoë 🌺✨',
      last_name: 'Müller-Świętochowski',
      phone_number: '+44 (0) 20 7946 0958',
      email: 'zoe.muller@example.co.uk',
      date_of_birth: '1995-07-28', // Leo ♌
      category: 'Friends',
      notes: 'Testing Japanese 漢字, Arabic مرحبا, and emojis 🚀🎉'
    };

    const res = await request.post('/api/contacts', { data: unicodeContact });
    expect(res.status()).toBe(201);
    const body: ContactActionResponse = await res.json();
    expect(body.status).toBe('success');
    const id = body.id!;
    createdIds.push(id);

    // Read back and assert 100% character fidelity
    const listRes = await request.get('/api/contacts');
    expect(listRes.status()).toBe(200);
    const listBody: ContactsResponse = await listRes.json();
    const saved = listBody.data?.find(c => c.id === id);

    expect(saved).toBeDefined();
    expect(saved?.first_name).toBe(unicodeContact.first_name);
    expect(saved?.last_name).toBe(unicodeContact.last_name);
    expect(saved?.notes).toBe(unicodeContact.notes);
  });

  test('XSS script tag handling: accepts and preserves script tags as text without execution', async ({ request }) => {
    const xssPayload = '<script>alert("xss")</script><img src="x" onerror="alert(1)">';
    const res = await request.post('/api/contacts', {
      data: {
        first_name: 'Security',
        last_name: 'Tester',
        phone_number: '+1 555-0011',
        notes: xssPayload
      }
    });

    expect(res.status()).toBe(201);
    const body: ContactActionResponse = await res.json();
    const id = body.id!;
    createdIds.push(id);

    // Read back and verify exact preservation in JSON
    const listRes = await request.get('/api/contacts');
    const listBody: ContactsResponse = await listRes.json();
    const saved = listBody.data?.find(c => c.id === id);

    expect(saved).toBeDefined();
    expect(saved?.notes).toBe(xssPayload);
  });
});
