import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Entry } from "../utils/types";
import { useFocusEffect } from "@react-navigation/native";

export default function JournalList() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filter, setFilter] = useState({
    mood: "all",
    minIntensity: 0,
    maxIntensity: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchEntries();
    }, [filter])
  );

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("entries")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .order("created_at", { ascending: false });

      if (filter.mood !== "all") {
        query = query.eq("mood", filter.mood);
      }

      query = query
        .gte("intensity", filter.minIntensity)
        .lte("intensity", filter.maxIntensity);

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      setEntries(data || []);
    } catch (err) {
      setError("Failed to load entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const moods = [
    "all",
    "happy",
    "sad",
    "neutral",
    "angry",
    "fearful",
    "surprised",
  ];

  const handleIntensityButtonPress = (
    minIntensity: number,
    maxIntensity: number
  ) => {
    if (
      filter.minIntensity === minIntensity &&
      filter.maxIntensity === maxIntensity
    ) {
      setFilter({ ...filter, minIntensity: 0, maxIntensity: 10 });
    } else {
      setFilter({ ...filter, minIntensity, maxIntensity });
    }
  };

  const clearIntensityFilter = () => {
    setFilter({ ...filter, minIntensity: 0, maxIntensity: 10 });
  };

  const renderIntensityButton = (
    minIntensity: number,
    maxIntensity: number
  ) => (
    <TouchableOpacity
      key={`${minIntensity}-${maxIntensity}`}
      style={[
        styles.intensityButton,
        filter.minIntensity === minIntensity &&
        filter.maxIntensity === maxIntensity
          ? styles.selectedIntensityButton
          : styles.unselectedIntensityButton,
      ]}
      onPress={() => handleIntensityButtonPress(minIntensity, maxIntensity)}
    >
      <Text
        style={[
          styles.intensityText,
          filter.minIntensity === minIntensity &&
          filter.maxIntensity === maxIntensity
            ? styles.selectedIntensityText
            : styles.unselectedIntensityText,
        ]}
      >
        {minIntensity} - {maxIntensity}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Mood Filter Section */}
      <Text style={styles.filterLabel}>Mood Filter:</Text>
      <View style={styles.filterContainer}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood}
            style={[
              styles.moodButton,
              filter.mood === mood && styles.selectedMoodButton,
            ]}
            onPress={() => setFilter({ ...filter, mood })}
          >
            <Text
              style={[
                styles.moodText,
                filter.mood === mood && styles.selectedMoodText,
              ]}
            >
              {mood}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Intensity Filter Section */}
      <Text style={styles.filterLabel}>Intensity Filter:</Text>
      <View style={styles.filterContainer}>
        {renderIntensityButton(0, 3)}
        {renderIntensityButton(4, 6)}
        {renderIntensityButton(7, 10)}
      </View>

      {/* Clear Filter Button */}
      <TouchableOpacity onPress={clearIntensityFilter}>
        <Text style={styles.clearButtonText}>Clear filters</Text>
      </TouchableOpacity>

      {/* Loading, Error, and Entries */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView style={styles.entriesContainer}>
          {entries.length > 0 ? (
            entries.map((entry) => (
              <View style={styles.entryContainer} key={entry.id}>
                <Text style={styles.entryContent}>{entry.content}</Text>
                <Text style={styles.entryMood}>
                  Mood: {entry.mood} (Intensity: {entry.intensity})
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noEntriesText}>No entries available.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
    marginTop: 20,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  moodButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    marginRight: 10,
  },
  selectedMoodButton: {
    backgroundColor: "#007AFF",
  },
  moodText: {
    fontSize: 16,
    color: "#333",
  },
  selectedMoodText: {
    color: "#fff",
  },
  intensityButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    marginRight: 10,
  },
  unselectedIntensityButton: {
    backgroundColor: "#e0e0e0",
  },
  selectedIntensityButton: {
    backgroundColor: "#007AFF",
  },
  intensityText: {
    fontSize: 16,
    color: "#333",
  },
  unselectedIntensityText: {
    color: "#333",
  },
  selectedIntensityText: {
    color: "#fff",
  },
  entriesContainer: {
    paddingBottom: 20,
  },
  entryContainer: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  entryContent: {
    fontSize: 18,
    color: "#333",
  },
  entryMood: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  noEntriesText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  clearButtonText: {
    marginTop: -8,
    marginBottom: 16,
    fontSize: 16,
    color: "#6F6F6F",
  },
});
