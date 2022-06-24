const pool = require('../utils/pool');

module.exports = class Post {
  id;
  post;
  created_at;

  constructor(row) {
    this.id = row.id;
    this.post = row.post;
    this.createdAt = row.created_at;
  }

  static async getAll() {
    const { rows } = await pool.query(
      `SELECT *
      FROM posts`
    );

    return new Post(rows[0]);
  }

  static async insert({ post }) {
    const { rows } = await pool.query(
      `INSERT INTO posts (post)
      VALUES ($1)
      RETURNING *`,
      [post]
    );

    return new Post(rows[0]);
  }
};
