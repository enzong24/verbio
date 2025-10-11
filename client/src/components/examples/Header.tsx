import Header from '../Header';

export default function HeaderExample() {
  return <Header username="Alex" elo={1547} onNavigate={(page) => console.log('Navigate to:', page)} currentPage="duel" />;
}
