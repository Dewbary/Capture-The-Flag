import gameReducer from "./game/gameReducer";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
});

export type State = ReturnType<typeof store.getState>;
