/**
 * ⚠️ INTENTIONALLY VULNERABLE CODE - FOR TESTING ONLY ⚠️
 *
 * This file contains deliberately vulnerable code patterns to demonstrate
 * the security-scanner MCP tool's capabilities. DO NOT use this code in
 * production or copy these patterns into real applications.
 *
 * Each vulnerability is a realistic example that the security-scanner should detect.
 *
 * @see https://github.com/j0KZ/mcp-agents/tree/main/examples/security-scanner
 */

// SQL Injection vulnerability
function getUserByEmail(email) {
  const query = "SELECT * FROM users WHERE email = '" + email + "'";
  return db.execute(query);
}

// XSS vulnerability
function displayUserComment(comment) {
  document.getElementById('comments').innerHTML = comment;
}

// Hardcoded secrets
const API_KEY = 'sk_live_1234567890abcdef';
const DB_PASSWORD = 'MySecretPassword123!';
const AWS_SECRET = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';

// Command injection
const exec = require('child_process').exec;
function backupFile(filename) {
  exec('cp ' + filename + ' /backup/', (error, stdout) => {
    console.log(stdout);
  });
}

// Insecure deserialization
function loadUserPreferences(data) {
  return JSON.parse(localStorage.getItem('userPrefs'));
}

// Path traversal
const fs = require('fs');
function readUserFile(filename) {
  const path = '/uploads/' + filename;
  return fs.readFileSync(path, 'utf8');
}

// Weak cryptography - CodeQL: js/insufficient-password-hash
// This intentionally uses MD5 (insecure) instead of bcrypt/scrypt/PBKDF2/Argon2
const crypto = require('crypto');
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex'); // Intentionally vulnerable
}

// No input validation
function createUser(req, res) {
  const user = {
    username: req.body.username,
    email: req.body.email,
    role: req.body.role, // User can set their own role!
  };
  return db.insert(user);
}

// SSRF vulnerability
function fetchUrl(url) {
  return fetch(url).then(res => res.text());
}

// Insecure random
function generateToken() {
  return Math.random().toString(36).substring(7);
}
