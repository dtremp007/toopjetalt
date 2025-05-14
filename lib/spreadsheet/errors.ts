export class MaliciousCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MaliciousCodeError";
  }
}
