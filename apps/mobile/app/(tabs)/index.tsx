import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES } from '@khedma/shared';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-4">
          <Text className="text-2xl font-bold text-secondary">Bonjour 👋</Text>
          <Text className="text-gray-500">De quoi avez-vous besoin ?</Text>
        </View>

        {/* Categories Grid */}
        <View className="px-4 py-6">
          <Text className="text-lg font-semibold mb-4">Services</Text>
          <View className="flex-row flex-wrap gap-3">
            {CATEGORIES.slice(0, 8).map((cat) => (
              <TouchableOpacity
                key={cat.slug}
                className="bg-white p-4 rounded-xl w-[48%] items-center shadow-sm"
              >
                <Text className="text-3xl mb-2">{getCategoryEmoji(cat.slug)}</Text>
                <Text className="font-medium text-gray-800">{cat.nameFr}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Helpers */}
        <View className="px-4 py-6">
          <Text className="text-lg font-semibold mb-4">Helpers populaires</Text>
          <Text className="text-gray-500 text-center py-8">
            Connectez-vous pour voir les helpers près de vous
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getCategoryEmoji(slug: string): string {
  const emojis: Record<string, string> = {
    menage: '🧹',
    bricolage: '🔧',
    'montage-meubles': '🪑',
    jardinage: '🌱',
    demenagement: '📦',
    informatique: '💻',
    'garde-enfants': '👶',
    'cours-particuliers': '📚',
  };
  return emojis[slug] || '🛠️';
}
