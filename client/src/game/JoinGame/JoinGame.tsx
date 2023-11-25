type JoinGameProps = {
  handleJoinGame: () => void;
  isVisible: boolean;
};

const JoinGame = ({ handleJoinGame, isVisible }: JoinGameProps) => {
  if (!isVisible) return null;

  return (
    <button
      className="p-4 rounded border-2 border-black absolute top-[50%] left-[50%] text-black"
      onClick={handleJoinGame}
    >
      Join Game
    </button>
  );
};

export default JoinGame;
