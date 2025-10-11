import VocabularyBadge from '../VocabularyBadge';

export default function VocabularyBadgeExample() {
  return (
    <div className="flex gap-2 p-4">
      <VocabularyBadge chinese="旅行" pinyin="lǚxíng" />
      <VocabularyBadge chinese="目的地" pinyin="mùdìdì" />
      <VocabularyBadge chinese="探索" pinyin="tànsuǒ" />
    </div>
  );
}
