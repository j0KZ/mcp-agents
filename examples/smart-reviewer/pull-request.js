// Example code for review

export class UserService {
  constructor(db) {
    this.db = db;
  }

  // TODO: Add validation
  async createUser(data) {
    const user = await this.db.insert('users', data);
    return user;
  }

  async getUser(id) {
    // Performance: This causes N+1 query problem
    const user = await this.db.findOne('users', { id });
    const posts = [];
    for (const postId of user.postIds) {
      const post = await this.db.findOne('posts', { id: postId });
      posts.push(post);
    }
    user.posts = posts;
    return user;
  }

  updateUser(id, data) {
    // Bug: Missing await
    this.db.update('users', { id }, data);
    return { success: true };
  }

  deleteUser(id) {
    // Security: No authorization check
    return this.db.delete('users', { id });
  }

  // Code smell: Too many parameters
  sendWelcomeEmail(userId, email, name, template, language, timezone, preferences) {
    // Implementation
  }
}
