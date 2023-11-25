import * as React from "react";
import { Flag } from "../../types";

type MapProps = {
  flags: Flag[];
};

const Map = ({ flags }: MapProps) => {
  return (
    <div className="relative w-full h-full">
      <div className="w-full h-1/2 bg-red-200" />
      <div className="w-full h-1/2 bg-blue-200" />

      {flags.map((flag, index) => {
        if (!flag.position) return null;
        const { x, y } = flag.position;

        return (
          <div
            key={index}
            className="absolute w-4 h-4"
            style={{
              left: x,
              top: y,
              backgroundColor: flag.color,
              transition: "top 0.3s ease-out, left 0.3s ease-out",
            }}
          />
        );
      })}
    </div>
  );
};

export default Map;
