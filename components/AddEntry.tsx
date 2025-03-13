import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";
import { analyzeMood } from "../lib/openai";

export default function AddEntry() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const { mood, intensity } = await analyzeMood(content);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        throw new Error("User not found");
      }

      await supabase.from("entries").insert({
        user_id: user.id,
        content,
        mood,
        intensity,
      });

      setContent("");
      Alert.alert("Success", "Your entry has been saved.");
    } catch (error) {
      console.error("Error adding an entry:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add an Entry</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Write your thoughts..."
        multiline
        value={content}
        onChangeText={setContent}
        numberOfLines={6}
        textAlignVertical="top"
      />

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Saving..." : "Save Entry"}
          onPress={handleSubmit}
          disabled={loading}
        />
        {loading && <ActivityIndicator style={styles.loader} color="#007AFF" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 140,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    marginLeft: 10,
  },
  errorText: {
    fontSize: 14,
    color: "red",
    marginBottom: 8,
    textAlign: "center",
  },
});
