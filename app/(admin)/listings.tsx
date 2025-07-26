import ItemCard from '@/components/ItemCard';
import { RootState } from '@/lib/store';
import { useDeleteItemMutation, useGetItemsQuery } from '@/lib/store/api/itemsApi';
import { Item } from '@/types/auction';
import { router } from 'expo-router';
import { ArrowLeft, Search, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';

export default function AdminListingsScreen() {
    const admin = useSelector((state: RootState) => state.admin.admin);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'ended' | 'flagged'>('all');

    const { data: itemsRaw = [], isLoading, refetch } = useGetItemsQuery();
    const [deleteItem, { isLoading: deleting }] = useDeleteItemMutation();

    // Normalize items
    const items = useMemo<Item[]>(() => {
        if (Array.isArray(itemsRaw)) return itemsRaw;
        if ('ids' in itemsRaw && 'entities' in itemsRaw) {
            return (itemsRaw.ids as string[])
                .map((id) => itemsRaw.entities[id]!)
                .filter(Boolean);
        }
        return [];
    }, [itemsRaw]);

    // Filter and search items
    const filteredItems = useMemo(() => {
        let filtered = items;

        // Apply status filter
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(item => {
                switch (selectedFilter) {
                    case 'active':
                        return item.status === 'Active';
                    case 'ended':
                        return item.status === 'Ended' || item.status === 'Sold';
                    case 'flagged':
                        // In a real app, you'd have a flagged field
                        return false;
                    default:
                        return true;
                }
            });
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                (typeof item.seller === 'object' && item.seller?.name?.toLowerCase().includes(query))
            );
        }

        return filtered.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [items, selectedFilter, searchQuery]);

    const handleDeleteItem = (itemId: string) => {
        Alert.alert(
            'Delete Listing',
            'Are you sure you want to permanently delete this listing? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteItem({ _id: itemId }).unwrap();
                            Alert.alert('Success', 'Listing deleted successfully');
                            refetch();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete listing. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleItemPress = (itemId: string) => {
        router.push({ pathname: '/item/[id]', params: { id: itemId } });
    };

    const filterOptions = [
        { key: 'all', label: 'All Listings', count: items.length },
        { key: 'active', label: 'Active', count: items.filter(i => i.status === 'Active').length },
        { key: 'ended', label: 'Ended', count: items.filter(i => i.status === 'Ended' || i.status === 'Sold').length },
        { key: 'flagged', label: 'Flagged', count: 0 },
    ];

    const renderItem = ({ item }: { item: Item }) => (
        <View style={styles.itemWrapper}>
            <ItemCard
                item={item}
                onPress={handleItemPress}
                disabled={deleting}
            />
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteItem(item._id)}
                disabled={deleting}
            >
                <Trash2 size={16} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Listings</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search size={20} color="#6B7280" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search listings, users, categories..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.filtersContainer}>
                {filterOptions.map((option) => (
                    <TouchableOpacity
                        key={option.key}
                        style={[
                            styles.filterButton,
                            selectedFilter === option.key && styles.activeFilterButton,
                        ]}
                        onPress={() => setSelectedFilter(option.key as any)}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                selectedFilter === option.key && styles.activeFilterButtonText,
                            ]}
                        >
                            {option.label} ({option.count})
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading listings...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>No listings found</Text>
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'Try adjusting your search terms' : 'No listings match the selected filter'}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: '#1F2937',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#1F2937',
        marginLeft: 8,
        paddingVertical: 8,
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        marginRight: 8,
    },
    activeFilterButton: {
        backgroundColor: '#DC2626',
    },
    filterButtonText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: '#6B7280',
    },
    activeFilterButtonText: {
        color: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: 'Inter-Medium',
        fontSize: 16,
        color: '#6B7280',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    listContent: {
        paddingTop: 16,
        paddingBottom: 24,
    },
    itemWrapper: {
        position: 'relative',
        width: '48%',
        marginBottom: 16,
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#DC2626',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        marginTop: 40,
    },
    emptyTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#1F2937',
        marginBottom: 8,
    },
    emptyText: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
});