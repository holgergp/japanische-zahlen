import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import App from "./App";
import { fullList } from "./numberUtils";

// jsdom has no matchMedia; the theme effect needs it.
beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    (() => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }));
});

beforeEach(() => {
  localStorage.clear(); // score persists to localStorage — isolate tests
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// Switch to Quiz tab (default mode: Zahl → Romaji) and skip the 3s countdown.
function showQuizOptions() {
  fireEvent.click(screen.getByRole("button", { name: "Quiz" }));
  act(() => vi.advanceTimersByTime(3000));
}

// In Zahl→Romaji mode the prompt shows the number; map it to its entry.
function correctEntry() {
  const num = Number(screen.getByText(/^\d+$/).textContent);
  return fullList.find((e) => e.num === num);
}

// Option buttons are the only buttons containing <span> children.
function optionButtons() {
  return screen.getAllByRole("button").filter((b) => b.querySelector("span"));
}

describe("Quiz interaction", () => {
  it("counts a correct answer in both correct and total", () => {
    render(<App />);
    showQuizOptions();
    fireEvent.click(screen.getByText(correctEntry().romaji).closest("button"));
    expect(screen.getByText(/✓ 1 \/ 1 richtig/)).toBeDefined();
  });

  it("counts a wrong answer only in total", () => {
    render(<App />);
    showQuizOptions();
    const correct = correctEntry().romaji;
    const wrong = optionButtons().find(
      (b) => b.querySelector("span").textContent !== correct,
    );
    fireEvent.click(wrong);
    expect(screen.getByText(/✓ 0 \/ 1 richtig/)).toBeDefined();
  });

  it("does not change the score when answering twice", () => {
    render(<App />);
    showQuizOptions();
    const correctBtn = screen
      .getByText(correctEntry().romaji)
      .closest("button");
    fireEvent.click(correctBtn);
    fireEvent.click(correctBtn); // options unmount; guard also blocks re-scoring
    expect(screen.getByText(/✓ 1 \/ 1 richtig/)).toBeDefined();
  });

  it("shows options again after 'Nächste Frage'", () => {
    render(<App />);
    showQuizOptions();
    fireEvent.click(screen.getByText(correctEntry().romaji).closest("button"));
    fireEvent.click(screen.getByRole("button", { name: /Nächste Frage/ }));
    act(() => vi.advanceTimersByTime(3000));
    expect(optionButtons()).toHaveLength(4);
  });
});

describe("Flashcard navigation", () => {
  it("wraps from the first card back to the last", () => {
    render(<App />);
    // Default tab is Lernen, card 1 / 101.
    fireEvent.click(screen.getByRole("button", { name: "← Zurück" }));
    expect(screen.getByText("101 / 101")).toBeDefined();
  });
});
