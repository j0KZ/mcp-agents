// Example source file for test generation
export class Calculator {
  /**
   * Add two numbers
   */
  add(a, b) {
    return a + b;
  }

  /**
   * Subtract two numbers
   */
  subtract(a, b) {
    return a - b;
  }

  /**
   * Multiply two numbers
   */
  multiply(a, b) {
    return a * b;
  }

  /**
   * Divide two numbers
   * @throws {Error} When dividing by zero
   */
  divide(a, b) {
    if (b === 0) {
      throw new Error('Division by zero');
    }
    return a / b;
  }

  /**
   * Calculate percentage
   */
  percentage(value, percent) {
    return (value * percent) / 100;
  }
}
