import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Welcome() {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-5xl font-bold text-white mb-2">Khedma</Text>
        <Text className="text-xl text-white/80 mb-8">خدمة</Text>

        <Text className="text-lg text-white text-center mb-12">
          Trouvez de l'aide près de chez vous au Maroc
        </Text>

        <View className="w-full gap-4">
          <Link href="/(auth)/register?role=CLIENT" asChild>
            <TouchableOpacity className="bg-white py-4 rounded-xl">
              <Text className="text-primary text-center font-semibold text-lg">
                Je cherche de l'aide
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/register?role=HELPER" asChild>
            <TouchableOpacity className="border-2 border-white py-4 rounded-xl">
              <Text className="text-white text-center font-semibold text-lg">
                Je propose mes services
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="mt-8">
            <Text className="text-white/80">
              Déjà inscrit ? <Text className="text-white font-semibold">Connexion</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
