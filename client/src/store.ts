import gameReducer from "./game/gameReducer";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  game: gameReducer,
});

export function setupStore(preloadedState?: Partial<State>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof setupStore>;
export type State = ReturnType<typeof rootReducer>;
