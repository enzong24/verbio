import DuelInterface from '../DuelInterface';

export default function DuelInterfaceExample() {
  return (
    <DuelInterface 
      topic="Travel & Tourism"
      vocabulary={["journey", "destination", "explore", "adventure", "culture"]}
      opponentName="Maria García"
      opponentElo={1520}
      userElo={1547}
      onComplete={() => console.log('Duel completed')}
    />
  );
}
