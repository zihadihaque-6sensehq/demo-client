export class HomeLaptopServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly userVisibleError?: string,
  ) {
    super(message);
    this.name = "HomeLaptopServiceError";
  }
}