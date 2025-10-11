import PracticeMode from '../PracticeMode';

export default function PracticeModeExample() {
  return (
    <PracticeMode 
      onSelectTopic={(topicId) => console.log('Selected topic:', topicId)} 
    />
  );
}
