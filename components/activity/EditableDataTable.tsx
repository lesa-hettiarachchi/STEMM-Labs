import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { DataTableColumn, DataTableRow } from '@/constants/types';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';

interface Props {
  columns: DataTableColumn[];
  initialRows?: string[][];
  colors: Record<string, string>;
  accentColor: string;
  onDataChange: (rows: DataTableRow[]) => void;
}

export default function EditableDataTable({
  columns,
  initialRows = [],
  colors,
  accentColor,
  onDataChange,
}: Props) {
  const [rows, setRows] = useState<string[][]>(() => {
    if (initialRows.length > 0) return initialRows.map((r) => [...r]);
    // Start with one empty row
    return [columns.map(() => '')];
  });

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const updated = rows.map((row, ri) =>
      ri === rowIndex
        ? row.map((cell, ci) => (ci === colIndex ? value : cell))
        : [...row]
    );
    setRows(updated);

    // Convert to DataTableRow objects
    const tableRows: DataTableRow[] = updated.map((row) => {
      const obj: DataTableRow = {};
      columns.forEach((col, ci) => {
        obj[col.key] = row[ci] ?? '';
      });
      return obj;
    });
    onDataChange(tableRows);
  };

  const addRow = () => {
    const newRow = columns.map(() => '');
    const updated = [...rows, newRow];
    setRows(updated);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);

    const tableRows: DataTableRow[] = updated.map((row) => {
      const obj: DataTableRow = {};
      columns.forEach((col, ci) => {
        obj[col.key] = row[ci] ?? '';
      });
      return obj;
    });
    onDataChange(tableRows);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header Row */}
          <View style={[styles.row, { backgroundColor: accentColor + '15' }]}>
            {columns.map((col) => (
              <View key={col.key} style={styles.headerCell}>
                <Text style={[styles.headerText, { color: accentColor }]}>
                  {col.label}
                </Text>
              </View>
            ))}
            <View style={styles.actionCell} />
          </View>

          {/* Data Rows */}
          {rows.map((row, ri) => (
            <View
              key={ri}
              style={[styles.row, { borderBottomColor: colors.border }]}
            >
              {row.map((cell, ci) => (
                <View key={ci} style={styles.dataCell}>
                  {columns[ci]?.editable !== false ? (
                    <TextInput
                      style={[
                        styles.cellInput,
                        {
                          backgroundColor: colors.backgroundElement,
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                      value={cell}
                      onChangeText={(text) => updateCell(ri, ci, text)}
                      placeholder="—"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="default"
                      accessibilityLabel={`${columns[ci]?.label} row ${ri + 1}`}
                    />
                  ) : (
                    <Text style={[styles.readonlyCell, { color: colors.text }]}>
                      {cell || '—'}
                    </Text>
                  )}
                </View>
              ))}
              {/* Remove button */}
              <View style={styles.actionCell}>
                {rows.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeRow(ri)}
                    style={[styles.removeBtn, { backgroundColor: colors.error + '15' }]}
                    accessibilityLabel={`Remove row ${ri + 1}`}
                  >
                    <Text style={{ color: colors.error, fontSize: 14 }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Row Button */}
      <TouchableOpacity
        style={[styles.addButton, { borderColor: accentColor }]}
        onPress={addRow}
        accessibilityLabel="Add data row"
      >
        <Text style={[styles.addButtonText, { color: accentColor }]}>
          + Add Row
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  headerCell: {
    width: 130,
    padding: Spacing.sm,
  },
  headerText: {
    fontSize: Typography.labelSmall.fontSize,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dataCell: {
    width: 130,
    padding: Spacing.xs,
  },
  cellInput: {
    height: 36,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.bodyMedium.fontSize,
  },
  readonlyCell: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: Typography.bodyMedium.fontSize,
  },
  actionCell: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  addButtonText: {
    fontSize: Typography.labelLarge.fontSize,
    fontWeight: '600',
  },
});
