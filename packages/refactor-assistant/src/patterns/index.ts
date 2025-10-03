/**
 * Design pattern implementations for refactoring
 */

export function applySingletonPattern(code: string, _options: any): string {
  const className = code.match(/class\s+(\w+)/)?.[1] || 'Singleton';

  return `class ${className} {
  private static instance: ${className};

  private constructor() {
    // Private constructor prevents direct instantiation
  }

  public static getInstance(): ${className} {
    if (!${className}.instance) {
      ${className}.instance = new ${className}();
    }
    return ${className}.instance;
  }

${code.replace(/class\s+\w+\s*\{/, '').replace(/}\s*$/, '')}
}`;
}

export function applyFactoryPattern(code: string, options: any): string {
  const className = options.className || 'Product';

  return `interface ${className} {
  operation(): string;
}

class Concrete${className}A implements ${className} {
  operation(): string {
    return 'ConcreteProductA';
  }
}

class Concrete${className}B implements ${className} {
  operation(): string {
    return 'ConcreteProductB';
  }
}

class ${className}Factory {
  static create(type: 'A' | 'B'): ${className} {
    switch (type) {
      case 'A':
        return new Concrete${className}A();
      case 'B':
        return new Concrete${className}B();
      default:
        throw new Error('Unknown product type');
    }
  }
}

${code}`;
}

export function applyObserverPattern(code: string, _options: any): string {
  return `interface Observer {
  update(data: any): void;
}

class Subject {
  private observers: Observer[] = [];

  attach(observer: Observer): void {
    this.observers.push(observer);
  }

  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(data: any): void {
    this.observers.forEach(observer => observer.update(data));
  }
}

${code}`;
}

export function applyStrategyPattern(code: string, _options: any): string {
  return `interface Strategy {
  execute(data: any): any;
}

class Context {
  private strategy: Strategy;

  constructor(strategy: Strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: Strategy): void {
    this.strategy = strategy;
  }

  executeStrategy(data: any): any {
    return this.strategy.execute(data);
  }
}

${code}`;
}

export function applyDecoratorPattern(code: string, _options: any): string {
  return `interface Component {
  operation(): string;
}

class ConcreteComponent implements Component {
  operation(): string {
    return 'ConcreteComponent';
  }
}

abstract class Decorator implements Component {
  protected component: Component;

  constructor(component: Component) {
    this.component = component;
  }

  operation(): string {
    return this.component.operation();
  }
}

${code}`;
}

export function applyAdapterPattern(code: string, _options: any): string {
  return `interface Target {
  request(): string;
}

class Adaptee {
  specificRequest(): string {
    return 'Adaptee specific request';
  }
}

class Adapter implements Target {
  private adaptee: Adaptee;

  constructor(adaptee: Adaptee) {
    this.adaptee = adaptee;
  }

  request(): string {
    return this.adaptee.specificRequest();
  }
}

${code}`;
}

export function applyFacadePattern(code: string, _options: any): string {
  return `class SubsystemA {
  operationA(): string {
    return 'SubsystemA operation';
  }
}

class SubsystemB {
  operationB(): string {
    return 'SubsystemB operation';
  }
}

class Facade {
  private subsystemA: SubsystemA;
  private subsystemB: SubsystemB;

  constructor() {
    this.subsystemA = new SubsystemA();
    this.subsystemB = new SubsystemB();
  }

  operation(): string {
    return this.subsystemA.operationA() + ' ' + this.subsystemB.operationB();
  }
}

${code}`;
}

export function applyProxyPattern(code: string, _options: any): string {
  return `interface Subject {
  request(): void;
}

class RealSubject implements Subject {
  request(): void {
    // Handle request logic here
  }
}

class Proxy implements Subject {
  private realSubject: RealSubject;

  request(): void {
    if (!this.realSubject) {
      this.realSubject = new RealSubject();
    }
    this.preRequest();
    this.realSubject.request();
    this.postRequest();
  }

  private preRequest(): void {
    // Pre-processing logic here
  }

  private postRequest(): void {
    // Post-processing logic here
  }
}

${code}`;
}

export function applyCommandPattern(code: string, _options: any): string {
  return `interface Command {
  execute(): void;
}

class ConcreteCommand implements Command {
  private receiver: Receiver;

  constructor(receiver: Receiver) {
    this.receiver = receiver;
  }

  execute(): void {
    this.receiver.action();
  }
}

class Receiver {
  action(): void {
    // Perform action logic here
  }
}

class Invoker {
  private command: Command;

  setCommand(command: Command): void {
    this.command = command;
  }

  executeCommand(): void {
    this.command.execute();
  }
}

${code}`;
}

export function applyChainOfResponsibilityPattern(code: string, _options: any): string {
  return `abstract class Handler {
  protected nextHandler: Handler | null = null;

  setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  handle(request: any): any {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return null;
  }
}

class ConcreteHandler1 extends Handler {
  handle(request: any): any {
    if (request === 'handler1') {
      return 'Handled by ConcreteHandler1';
    }
    return super.handle(request);
  }
}

class ConcreteHandler2 extends Handler {
  handle(request: any): any {
    if (request === 'handler2') {
      return 'Handled by ConcreteHandler2';
    }
    return super.handle(request);
  }
}

${code}`;
}
