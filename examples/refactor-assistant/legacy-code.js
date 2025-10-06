// Legacy code with multiple refactoring opportunities

// Example 1: Callback hell
function getUserData(userId, callback) {
  db.findUser(userId, (err, user) => {
    if (err) {
      callback(err);
    } else {
      db.findPosts(user.id, (err, posts) => {
        if (err) {
          callback(err);
        } else {
          db.findComments(posts[0].id, (err, comments) => {
            if (err) {
              callback(err);
            } else {
              callback(null, { user, posts, comments });
            }
          });
        }
      });
    }
  });
}

// Example 2: Nested conditionals
function processOrder(order) {
  if (order) {
    if (order.items && order.items.length > 0) {
      if (order.status === 'pending') {
        if (order.total > 0) {
          if (order.paymentMethod) {
            return processPayment(order);
          } else {
            return { error: 'No payment method' };
          }
        } else {
          return { error: 'Invalid total' };
        }
      } else {
        return { error: 'Order not pending' };
      }
    } else {
      return { error: 'No items' };
    }
  } else {
    return { error: 'No order' };
  }
}

// Example 3: Repeated code (needs extraction)
function calculateUserStats() {
  const totalPosts = user.posts.length;
  const totalComments = user.comments.length;
  const totalLikes = user.likes.length;

  const postsPerDay = totalPosts / user.daysSinceJoined;
  const commentsPerDay = totalComments / user.daysSinceJoined;
  const likesPerDay = totalLikes / user.daysSinceJoined;

  return {
    posts: { total: totalPosts, perDay: postsPerDay },
    comments: { total: totalComments, perDay: commentsPerDay },
    likes: { total: totalLikes, perDay: likesPerDay },
  };
}

// Example 4: Dead code
import { oldFunction, deprecatedUtil } from './utils';
import { helper1, helper2, unusedHelper } from './helpers';

function activeFunction() {
  return helper1() + helper2();
}
