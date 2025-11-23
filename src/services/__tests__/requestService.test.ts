import { vi, describe, test, expect } from 'vitest';
import { sendRequest } from '../requestService';
import axios from 'axios';

vi.mock('axios');

describe('RequestService sendRequest', () => {
  const mockedAxios = axios as any;

  test('successful request returns request and response shape', async () => {
    mockedAxios.create.mockReturnValue({
      request: vi.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        data: { ok: true }
      })
    });

    const service = {
      protocol: 'http',
      host: 'example.com',
      port: 80
    } as any;

    const apiConfig = {
      id: 'a',
      name: 'test',
      url: '/ping',
      method: 'GET',
      parameters: [],
      headers: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    } as any;

    const result = await sendRequest(service, apiConfig);
    expect(result).toHaveProperty('request');
    expect(result).toHaveProperty('response');
    expect(result.response.status).toBe(200);
    expect(result.request.url).toContain('/ping');
  });
});
