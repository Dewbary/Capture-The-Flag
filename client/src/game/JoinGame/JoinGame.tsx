type JoinGameProps = {
  handleJoinGame: (teamId: "red" | "blue") => void;
};

const JoinGame = ({ handleJoinGame }: JoinGameProps) => {
  return (
    <div className="absolute top-[50%] left-[50%] flex justify-center content-center">
      <button
        className="p-4 rounded border-2 border-black bg-red-600 text-black"
        onClick={() => handleJoinGame("red")}
      >
        Join Red Team
      </button>
      <button
        className="p-4 rounded border-2 border-black bg-blue-600 text-black"
        onClick={() => handleJoinGame("blue")}
      >
        Join Blue Team
      </button>
    </div>
  );
};

export default JoinGame;
