import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { TodoApp } from "../../src/components/TodoApp";

// 概要: Todo画面におけるオフライン検知と通知表示をテスト
// 目的: ネットワーク切断時にユーザーへ明確な警告を表示することを保証

describe("TodoApp UI/UX", () => {
  beforeEach(() => {
    // 既存のStorageやイベントを汚さない
    window.localStorage.clear();
  });

  // 概要: navigator.onLine=false または offlineイベント時に警告が表示される
  // 目的: 画面がオフライン状態を通知することを保証
  it("shows offline alert when offline", async () => {
    // onLineをfalseに見せる
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      get() {
        return false;
      },
    });

    render(<TodoApp />);

    expect(screen.getByText(/オフライン/)).toBeInTheDocument();
  });
});
