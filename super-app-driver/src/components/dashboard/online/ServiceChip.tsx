import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ServiceChipProps {
  title: string;
  selected: boolean;
}

export default function ServiceChip({ title, selected }: ServiceChipProps) {
  const chipStyle = selected ? styles.selectedChip : styles.unselectedChip;
  const textStyle = selected ? styles.selectedText : styles.unselectedText;

  return (
    <View style={[styles.chip, chipStyle]}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0,
  },
  selectedChip: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  selectedText: {
    color: '#166534',
  },
  unselectedChip: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  unselectedText: {
    color: '#6B7280',
  },
});
