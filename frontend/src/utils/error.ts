// 汎用的なエラー判定ヘルパー
// 概要: AbortError相当の例外オブジェクトかを判定する
// 目的: fetchキャンセルなどで発生するAbortErrorの判定ロジックを一元化し、重複コードを防ぐ
export const isAbortError = (error: unknown): boolean => {
  if (
    typeof DOMException !== "undefined" &&
    error instanceof DOMException &&
    error.name === "AbortError"
  ) {
    return true;
  }

  if (typeof error === "object" && error !== null) {
    const abortLike = error as { name?: unknown; type?: unknown };
    if (abortLike.name === "AbortError") return true;
    if (abortLike.type === "abort") return true;
  }

  return false;
};
