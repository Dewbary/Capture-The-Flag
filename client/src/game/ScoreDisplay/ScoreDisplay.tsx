import { Score } from "../../types";

type ScoreProps = {
  score: Score;
};
const ScoreDisplay = ({ score }: ScoreProps) => {
  return (
    <div className="fixed top-0 right-0">
      <div className="text-center">blue: {score.blue}</div>
      <div className="text-center">red: {score.red}</div>
    </div>
  );
};

export default ScoreDisplay;
