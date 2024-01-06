import Game from "./page";
import { renderWithProviders } from "../test/testUtils";

describe("game", () => {
  it("should pass", () => {
    expect(1 + 1).toBe(2);
  });

  it("should render the game", () => {
    renderWithProviders(<Game />);

    // screen.getByText("Join Game");
  });
});
