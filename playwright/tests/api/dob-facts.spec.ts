import { test, expect } from '@playwright/test';
import { DobFactsResponse } from './api-types';

test.describe('Birthday Insights & Facts API (/api/dob-facts)', () => {
  test('GET /api/dob-facts?dob=YYYY-MM-DD - returns star sign and historical web facts (200 OK)', async ({ request }) => {
    const dob = '1990-07-15'; // Cancer
    const res = await request.get(`/api/dob-facts?dob=${dob}`);

    expect(res.status()).toBe(200);
    const body: DobFactsResponse = await res.json();
    expect(body.status).toBe('success');
    expect(body.data).toBeDefined();

    const data = body.data!;
    expect(data.dob).toBe('1990-07-15');
    expect(data.month).toBe(7);
    expect(data.day).toBe(15);
    expect(data.star_sign.sign).toBe('Cancer');
    expect(data.star_sign.symbol).toBe('♋');
    expect(typeof data.star_sign.traits).toBe('string');
    expect(data.star_sign.traits.length).toBeGreaterThan(0);
    expect(data.star_sign.formatted).toContain('Cancer ♋');
    expect(typeof data.primary_fact).toBe('string');
    expect(data.primary_fact.length).toBeGreaterThan(0);
    expect(Array.isArray(data.facts)).toBe(true);
    expect(data.facts.length).toBeGreaterThan(0);
  });

  test('GET /api/dob-facts - correctly resolves winter date star sign (Capricorn ♑)', async ({ request }) => {
    const res = await request.get('/api/dob-facts?dob=2000-01-01');
    expect(res.status()).toBe(200);

    const body: DobFactsResponse = await res.json();
    expect(body.status).toBe('success');
    expect(body.data?.star_sign.sign).toBe('Capricorn');
    expect(body.data?.star_sign.symbol).toBe('♑');
    expect(body.data?.star_sign.date_range).toContain('Dec 22 – Jan 19');
  });

  test('GET /api/dob-facts - rejects request without dob parameter (400 Bad Request)', async ({ request }) => {
    const res = await request.get('/api/dob-facts');
    expect(res.status()).toBe(400);

    const body: DobFactsResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe("Query parameter 'dob' is required (YYYY-MM-DD).");
  });

  test('GET /api/dob-facts - rejects empty dob parameter (400 Bad Request)', async ({ request }) => {
    const res = await request.get('/api/dob-facts?dob=');
    expect(res.status()).toBe(400);

    const body: DobFactsResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe("Query parameter 'dob' is required (YYYY-MM-DD).");
  });

  test('GET /api/dob-facts - rejects malformed date string (400 Bad Request)', async ({ request }) => {
    const res = await request.get('/api/dob-facts?dob=not-a-valid-date');
    expect(res.status()).toBe(400);

    const body: DobFactsResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('Invalid date format. Expected YYYY-MM-DD.');
  });

  test('GET /api/dob-facts - rejects invalid calendar dates (400 Bad Request)', async ({ request }) => {
    const res = await request.get('/api/dob-facts?dob=2024-02-31');
    expect(res.status()).toBe(400);

    const body: DobFactsResponse = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('Invalid date format. Expected YYYY-MM-DD.');
  });
});
