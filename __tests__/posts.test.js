const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

jest.mock('../lib/services/github.js');

describe('posts routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('GET /api/v1/posts should return a list of posts if authenticated', async () => {
    const agent = request.agent(app);
    const res1 = await agent.get('/api/v1/posts');

    expect(res1.status).toEqual(401);

    const res2 = await agent
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

    const res3 = await agent.get('/api/v1/posts');

    expect(res3.status).toEqual(200);
    expect(res3.body.post).toEqual('this is a test');
  });

  it('POST /api/v1/posts should add a post if authenticated', async () => {
    const agent = request.agent(app);
    const res1 = await agent
      .post('/api/v1/posts')
      .send({ post: 'this is another test' });

    expect(res1.status).toEqual(401);

    const res2 = await agent
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

    const res3 = await agent
      .post('/api/v1/posts')
      .send({ post: 'this is another test' });

    expect(res3.status).toEqual(200);
    expect(res3.body.post).toEqual('this is another test');
  });

  afterAll(() => {
    pool.end();
  });
});
