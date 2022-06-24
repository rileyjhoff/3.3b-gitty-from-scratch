const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

jest.mock('../lib/services/github.js');

describe('github routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('GET /api/v1/github/login route should redirect to the oauth page upon login', async () => {
    const res = await request(app).get('/api/v1/github/login');

    expect(res.header.location).toMatch(
      /https:\/\/github.com\/login\/oauth\/authorize\?client_id=[\w\d]+&scope=user&redirect_uri=http:\/\/localhost:7890\/api\/v1\/github\/callback/i
    );
  });

  it('GET /api/v1/github/callback route should login and redirect users to /api/v1/github/dashboard', async () => {
    const res = await request
      .agent(app)
      .get('/api/v1/github/callback?code=55')
      .redirects(1);

    expect(res.body).toEqual({
      id: expect.any(Number),
      username: 'fake_github_user',
      email: 'not-real@example.com',
      avatar: 'https://www.placecage.com/gif/300/300',
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
  });

  it('DELETE /api/v1/github/sessions should log out a user', async () => {
    const res1 = await request(app).get('/api/v1/github/dashboard');

    expect(res1.status).toEqual(401);

    const res2 = await request
      .agent(app)
      .get('/api/v1/github/callback?code=55')
      .redirects(1);

    expect(res2.body).toEqual({
      id: expect.any(Number),
      username: 'fake_github_user',
      email: 'not-real@example.com',
      avatar: 'https://www.placecage.com/gif/300/300',
      iat: expect.any(Number),
      exp: expect.any(Number),
    });

    const res3 = await request(app).delete('/api/v1/github/sessions');

    expect(res3.status).toEqual(200);
    expect(res3.body.message).toEqual('Signed out successfully');
  });

  afterAll(() => {
    pool.end();
  });
});
