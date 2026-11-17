export class MathUtils {
  public static lerp(a: number, b: number, val: number): number {
    return a * (1 - val) + b * val;
  }

  public static inverseLerp(a: number, b: number, val: number) {
    return this.clamp(0, 1, (val - a) / (b - a));
  }

  public static clamp(a: number, b: number, val: number) {
    return Math.min(b, Math.max(a, val));
  }
}
