import { getProfile, login } from "@/api/user";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUserStore } from "@/stores/userStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useProfile = () => {
  const setUser = useUserStore((state) => state.setUser);

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const user = await getProfile();
      setUser(user);
      return user;
    },
  });
};

export const useLogin = () => {
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: async (data) => {
      await AsyncStorage.setItem("token", data.token);

      try {
        const userProfile = await getProfile(data.token);
        setUser(userProfile);
      } catch (error) {
        console.error("Failed to fetch profile after login:", error);
      }
    },
  });
};
