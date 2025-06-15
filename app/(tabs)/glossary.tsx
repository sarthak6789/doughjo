import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '@/constants/Theme';
import { Search, ChevronDown, ChevronRight } from 'lucide-react-native';
import { glossaryTerms } from '@/constants/Glossary';

export default function GlossaryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  
  const filteredTerms = glossaryTerms.filter(term => 
    term.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleTermPress = (termId: string) => {
    setExpandedTerm(expandedTerm === termId ? null : termId);
  };
  
  const renderGlossaryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.termCard}
      onPress={() => handleTermPress(item.id)}
    >
      <View style={styles.termHeader}>
        <Text style={styles.termTitle}>{item.title}</Text>
        {expandedTerm === item.id ? (
          <ChevronDown color={Colors.text.secondary} size={20} />
        ) : (
          <ChevronRight color={Colors.text.secondary} size={20} />
        )}
      </View>
      {expandedTerm === item.id && (
        <View style={styles.termContent}>
          <Text style={styles.termDescription}>{item.description}</Text>
          {item.example && (
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleTitle}>Example:</Text>
              <Text style={styles.exampleText}>{item.example}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Glossary</Text>
        <Text style={styles.subtitle}>Learn the financial lingo</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Search color={Colors.text.tertiary} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search terms..."
          placeholderTextColor={Colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <FlatList
        data={filteredTerms}
        renderItem={renderGlossaryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No terms found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxl,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.full,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  termCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  termHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  termTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
  },
  termContent: {
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.background.tertiary,
  },
  termDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  exampleContainer: {
    marginTop: SPACING.md,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  exampleTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  exampleText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
  },
});