import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  applyIngredientSelection,
  filterIngredientNames,
  findOpenIngContext,
  findUnresolvedReferences,
  parseStepDisplaySegments,
} from "@/lib/ing-syntax";
import { Colors, Spacing } from "@/constants/theme";
import { IconMinus } from "@/components/icons/icon-minus";

type SelectionChangeEvent = {
  nativeEvent: { selection: { start: number; end: number } };
};

type StepRowProps = {
  id: string;
  index: number;
  command: string;
  editable: boolean;
  ingredientNames: string[];
  onChangeCommand: (id: string, command: string) => void;
  onRemove: (id: string) => void;
};

export function StepRow({
  id,
  index,
  command,
  editable,
  ingredientNames,
  onChangeCommand,
  onRemove,
}: StepRowProps) {
  const [cursorPosition, setCursorPosition] = useState(0);

  const openContext = findOpenIngContext(command, cursorPosition);
  const suggestions = openContext
    ? filterIngredientNames(ingredientNames, openContext.query)
    : [];
  const unresolved = openContext
    ? []
    : findUnresolvedReferences(command, ingredientNames);

  function handleSelectionChange(event: SelectionChangeEvent) {
    setCursorPosition(event.nativeEvent.selection.start);
  }

  function selectSuggestion(name: string) {
    if (!openContext) return;
    const result = applyIngredientSelection(
      command,
      openContext,
      cursorPosition,
      name,
    );
    onChangeCommand(id, result.text);
    setCursorPosition(result.cursorPosition);
  }

  function applyFix(raw: string, suggestion: string) {
    onChangeCommand(id, command.replace(`ing(${raw})`, `ing(${suggestion})`));
  }

  return (
    <View style={styles.row}>
      {editable ? (
        <Pressable onPress={() => onRemove(id)} style={styles.iconButton}>
          <IconMinus size={46} />
        </Pressable>
      ) : (
        <View style={styles.iconButton} />
      )}
      <Text style={styles.stepNumber}>{index + 1}.</Text>
      <View style={styles.inputColumn}>
        {editable ? (
          <TextInput
            value={command}
            onChangeText={(text) => onChangeCommand(id, text)}
            onSelectionChange={handleSelectionChange}
            placeholder="Describe this step"
            style={styles.rowInputName}
            multiline
          />
        ) : (
          <Text style={styles.rowInputName}>
            {parseStepDisplaySegments(command).map((segment, i) =>
              segment.type === "value" ? (
                <Text key={i} style={styles.boldValue}>
                  {segment.text}
                </Text>
              ) : (
                <Text key={i}>{segment.text}</Text>
              ),
            )}
          </Text>
        )}

        {editable && suggestions.length > 0 && (
          <View style={styles.suggestionBox}>
            {suggestions.map((name) => (
              <Pressable
                key={name}
                onPress={() => selectSuggestion(name)}
                style={styles.suggestionItem}
              >
                <Text style={styles.suggestionText}>{name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {editable &&
          unresolved.map((reference, i) => (
            <View key={i} style={styles.warningBox}>
              <Text style={styles.warningText}>
                "{reference.raw}" doesn&apos;t match any ingredient
              </Text>
              {reference.suggestion && (
                <Pressable
                  onPress={() => applyFix(reference.raw, reference.suggestion!)}
                >
                  <Text style={styles.fixText}>
                    Did you mean "{reference.suggestion}"? Fix
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    padding: Spacing.one,
    marginBottom: Spacing.one,
    borderRadius: Spacing.two,
  },
  iconButton: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: {
    fontSize: 33,
    fontWeight: "600",
    color: Colors.textSecondary,
    paddingTop: Spacing.one,
  },
  inputColumn: {
    flex: 1,
  },
  rowInputName: {
    fontSize: 33,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundElement,
    paddingVertical: Spacing.one,
  },
  boldValue: {
    fontWeight: "700",
  },
  suggestionBox: {
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.backgroundSelected,
    borderRadius: Spacing.two,
    marginTop: Spacing.one,
    overflow: "hidden",
  },
  suggestionItem: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  suggestionText: {
    fontSize: 22,
    color: Colors.text,
  },
  warningBox: {
    marginTop: Spacing.one,
    gap: Spacing.half,
  },
  warningText: {
    fontSize: 16,
    color: "#c44536",
  },
  fixText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.accent,
  },
});
