import MatchFinder from '../MatchFinder';

export default function MatchFinderExample() {
  return (
    <MatchFinder 
      onMatchFound={(opponent, isBot) => console.log('Match found:', opponent, 'Bot:', isBot)} 
    />
  );
}
