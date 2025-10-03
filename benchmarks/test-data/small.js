// Small test file - 100 lines
export class Calculator {
  add(a, b) {
    return a + b;
  }

  subtract(a, b) {
    return a - b;
  }

  multiply(a, b) {
    return a * b;
  }

  divide(a, b) {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }

  power(base, exponent) {
    return Math.pow(base, exponent);
  }

  sqrt(n) {
    if (n < 0) throw new Error('Cannot sqrt negative');
    return Math.sqrt(n);
  }

  percentage(value, percent) {
    return (value * percent) / 100;
  }

  average(...numbers) {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  max(...numbers) {
    return Math.max(...numbers);
  }

  min(...numbers) {
    return Math.min(...numbers);
  }

  factorial(n) {
    if (n < 0) throw new Error('Negative factorial');
    if (n === 0 || n === 1) return 1;
    return n * this.factorial(n - 1);
  }

  fibonacci(n) {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }

  isPrime(n) {
    if (n <= 1) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  }

  gcd(a, b) {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  lcm(a, b) {
    return (a * b) / this.gcd(a, b);
  }

  round(number, decimals = 0) {
    const factor = Math.pow(10, decimals);
    return Math.round(number * factor) / factor;
  }

  ceil(number, decimals = 0) {
    const factor = Math.pow(10, decimals);
    return Math.ceil(number * factor) / factor;
  }

  floor(number, decimals = 0) {
    const factor = Math.pow(10, decimals);
    return Math.floor(number * factor) / factor;
  }

  abs(n) {
    return Math.abs(n);
  }

  sign(n) {
    return Math.sign(n);
  }
}
