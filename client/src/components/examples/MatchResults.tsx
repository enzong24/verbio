import MatchResults from '../MatchResults';

export default function MatchResultsExample() {
  return (
    <MatchResults 
      isWinner={true}
      eloChange={15}
      newElo={1562}
      scores={{
        grammar: 85,
        fluency: 78,
        vocabulary: 92,
        naturalness: 81
      }}
      feedback={[
        "Great use of 'destination' and 'adventure' in context",
        "Minor grammar issue: 'yo visitar' should be 'yo visito'",
        "Natural conversation flow maintained throughout"
      ]}
      onContinue={() => console.log('Continue clicked')}
    />
  );
}
