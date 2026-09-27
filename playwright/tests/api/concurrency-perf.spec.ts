import { test, expect } from '@playwright/test';
import { ContactsResponse, ContactActionResponse, DobFactsResponse } from './api-types';

test.describe('Minimal Performance & Concurrency Tests (10 Concurrent Users)', () => {
  const cleanupIds: number[] = [];

  test.afterEach(async ({ request }) => {
    if (cleanupIds.length > 0) {
      await Promise.all(
        cleanupIds.map(id =>
          request.delete(`/api/contacts/${id}`).catch(() => {
            // ignore cleanup errors
          })
        )
      );
      cleanupIds.length = 0;
    }
  });

  test('10 concurrent readers: verifies HTTP 200, latency SLA, and identical data integrity', async ({ request }) => {
    const userCount = 10;
    const startTime = performance.now();

    // 1. Fire 10 simultaneous GET requests
    const responses = await Promise.all(
      Array.from({ length: userCount }, () => request.get('/api/contacts'))
    );
    const totalDuration = performance.now() - startTime;

    // 2. Status verification: All 10 must return HTTP 200
    for (const res of responses) {
      expect(res.status()).toBe(200);
    }

    // 3. Content correctness & consistency verification
    const bodies: ContactsResponse[] = await Promise.all(responses.map(r => r.json()));

    const baseLength = bodies[0].data?.length ?? 0;
    expect(baseLength).toBeGreaterThan(0);

    const baseIds = bodies[0].data!.map(c => c.id);

    // Verify all 10 users received identical dataset and ordering without data corruption
    for (let i = 0; i < userCount; i++) {
      expect(bodies[i].status).toBe('success');
      expect(bodies[i].data).toBeDefined();
      expect(bodies[i].data!.length).toBe(baseLength);

      const userIds = bodies[i].data!.map(c => c.id);
      expect(userIds).toEqual(baseIds);
    }

    // 4. Latency SLA check
    expect(totalDuration).toBeLessThan(2000); // 10 concurrent reads served within 2s
  });

  test('10 concurrent writers: verifies HTTP 201, unique IDs, correct response content, and database persistence', async ({ request }) => {
    const userCount = 10;
    const batchId = Date.now();

    const sampleDobs = [
      { dob: '1990-01-15', sign: 'Capricorn' },
      { dob: '1991-02-15', sign: 'Aquarius' },
      { dob: '1992-03-15', sign: 'Pisces' },
      { dob: '1993-04-15', sign: 'Aries' },
      { dob: '1994-05-15', sign: 'Taurus' },
      { dob: '1995-06-15', sign: 'Gemini' },
      { dob: '1996-07-15', sign: 'Cancer' },
      { dob: '1997-08-15', sign: 'Leo' },
      { dob: '1998-09-15', sign: 'Virgo' },
      { dob: '1999-10-15', sign: 'Libra' }
    ];

    const payloads = Array.from({ length: userCount }, (_, i) => ({
      first_name: `Concurrent_${i}`,
      last_name: `Writer_${batchId}_${i}`,
      phone_number: `+1 (555) 800-${1000 + i}`,
      email: `user_${i}_${batchId}@example.com`,
      date_of_birth: sampleDobs[i].dob,
      category: i % 2 === 0 ? 'Work' : 'Family',
      notes: `Concurrency test payload for user ${i}`
    }));

    // 1. Execute 10 simultaneous POST requests
    const responses = await Promise.all(
      payloads.map(payload => request.post('/api/contacts', { data: payload }))
    );

    // 2. Status verification: All 10 must succeed with HTTP 201 Created
    for (const res of responses) {
      expect(res.status()).toBe(201);
    }

    // 3. Content verification of individual POST responses
    const responseBodies: ContactActionResponse[] = await Promise.all(responses.map(r => r.json()));
    const createdIds: number[] = [];

    for (let i = 0; i < userCount; i++) {
      const body = responseBodies[i];
      expect(body.status).toBe('success');
      expect(body.message).toBe('Contact added successfully!');
      expect(typeof body.id).toBe('number');
      expect(body.id).toBeGreaterThan(0);

      // Verify specific birthday insights match the submitted user's DOB
      expect(body.dob_details?.star_sign.sign).toBe(sampleDobs[i].sign);
      expect(body.dob_details?.dob).toBe(sampleDobs[i].dob);
      expect(body.dob_fact).toContain('🎉 Fun Date Fact:');

      createdIds.push(body.id!);
      cleanupIds.push(body.id!);
    }

    // Verify 10 unique IDs were generated (no database auto-increment race conditions)
    const uniqueIds = new Set(createdIds);
    expect(uniqueIds.size).toBe(userCount);

    // 4. Content verification: Read database to ensure all 10 records are fully persisted
    const listRes = await request.get('/api/contacts');
    expect(listRes.status()).toBe(200);
    const listBody: ContactsResponse = await listRes.json();
    const contactMap = new Map((listBody.data || []).map(c => [c.id, c]));

    for (let i = 0; i < userCount; i++) {
      const id = createdIds[i];
      const payload = payloads[i];
      const saved = contactMap.get(id);

      expect(saved).toBeDefined();
      expect(saved?.first_name).toBe(payload.first_name);
      expect(saved?.last_name).toBe(payload.last_name);
      expect(saved?.phone_number).toBe(payload.phone_number);
      expect(saved?.email).toBe(payload.email);
      expect(saved?.date_of_birth).toBe(payload.date_of_birth);
      expect(saved?.category).toBe(payload.category);
      expect(saved?.notes).toBe(payload.notes);
    }
  });

  test('10 concurrent independent user sessions: verifies isolated CRUD lifecycle and content correctness', async ({ request }) => {
    const userCount = 10;
    const sessionBatch = Date.now();

    // Define an independent full-lifecycle user journey
    const runUserJourney = async (userIndex: number) => {
      const dob = '1994-08-20'; // Leo ♌
      const initialPayload = {
        first_name: `SessionUser_${userIndex}`,
        last_name: `Batch_${sessionBatch}_${userIndex}`,
        phone_number: `+1 555-700-${1000 + userIndex}`,
        email: `session_${userIndex}@example.com`,
        date_of_birth: dob,
        category: 'Work',
        notes: `Initial session note ${userIndex}`
      };

      // Step A: Create contact
      const createRes = await request.post('/api/contacts', { data: initialPayload });
      expect(createRes.status()).toBe(201);
      const createBody: ContactActionResponse = await createRes.json();
      expect(createBody.status).toBe('success');
      expect(createBody.dob_details?.star_sign.sign).toBe('Leo');
      const contactId = createBody.id!;

      // Step B: Query birthday facts
      const factsRes = await request.get(`/api/dob-facts?dob=${dob}`);
      expect(factsRes.status()).toBe(200);
      const factsBody: DobFactsResponse = await factsRes.json();
      expect(factsBody.status).toBe('success');
      expect(factsBody.data?.star_sign.sign).toBe('Leo');
      expect(factsBody.data?.facts.length).toBeGreaterThan(0);

      // Step C: Update contact
      const updatedPhone = `+1 555-777-${2000 + userIndex}`;
      const updatedNotes = `Updated session note ${userIndex}`;
      const updateRes = await request.put(`/api/contacts/${contactId}`, {
        data: {
          ...initialPayload,
          phone_number: updatedPhone,
          notes: updatedNotes
        }
      });
      expect(updateRes.status()).toBe(200);
      const updateBody: ContactActionResponse = await updateRes.json();
      expect(updateBody.status).toBe('success');

      // Step D: Verify update in list
      const listRes = await request.get('/api/contacts');
      const listBody: ContactsResponse = await listRes.json();
      const found = listBody.data?.find(c => c.id === contactId);
      expect(found).toBeDefined();
      expect(found?.phone_number).toBe(updatedPhone);
      expect(found?.notes).toBe(updatedNotes);

      // Step E: Delete contact
      const deleteRes = await request.delete(`/api/contacts/${contactId}`);
      expect(deleteRes.status()).toBe(200);
      const deleteBody: ContactActionResponse = await deleteRes.json();
      expect(deleteBody.status).toBe('success');
      expect(deleteBody.message).toBe('Contact deleted successfully.');

      // Step F: Verify deletion returns 404
      const verifyDelRes = await request.delete(`/api/contacts/${contactId}`);
      expect(verifyDelRes.status()).toBe(404);

      return { userIndex, contactId, success: true };
    };

    // Run all 10 independent user workflows simultaneously
    const results = await Promise.all(
      Array.from({ length: userCount }, (_, i) => runUserJourney(i))
    );

    expect(results.length).toBe(userCount);
    for (const res of results) {
      expect(res.success).toBe(true);
    }
  });

  test('Latency benchmarking: measures individual response times across 10 concurrent requests', async ({ request }) => {
    const userCount = 10;
    const latencies: number[] = [];

    // Issue 10 concurrent requests and measure individual round-trip times
    await Promise.all(
      Array.from({ length: userCount }, async () => {
        const t0 = performance.now();
        const res = await request.get('/api/contacts');
        const t1 = performance.now();

        expect(res.status()).toBe(200);
        latencies.push(t1 - t0);
      })
    );

    // Calculate latency metrics
    latencies.sort((a, b) => a - b);
    const min = latencies[0];
    const max = latencies[latencies.length - 1];
    const avg = latencies.reduce((sum, val) => sum + val, 0) / latencies.length;
    const p95Index = Math.min(Math.floor(latencies.length * 0.95), latencies.length - 1);
    const p95 = latencies[p95Index];

    // Assert reasonable performance thresholds for 10 concurrent users
    expect(avg).toBeLessThan(350); // average latency < 350ms
    expect(p95).toBeLessThan(800); // 95th percentile < 800ms

    // Log latency summary for visibility
    console.log(`[Performance 10 Concurrent Users] Min: ${min.toFixed(1)}ms | Avg: ${avg.toFixed(1)}ms | Max: ${max.toFixed(1)}ms | P95: ${p95.toFixed(1)}ms`);
  });
});
