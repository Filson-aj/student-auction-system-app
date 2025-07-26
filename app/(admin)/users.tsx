// AdminUsersScreen.tsx
import { images } from '@/constants';
import { RootState } from '@/lib/store';
import { useGetUsersQuery, useUpdateUserStatusMutation } from '@/lib/store/api/adminApi';
import { User } from '@/types/auction';
import { useRouter } from 'expo-router';
import {
    ArrowLeft,
    Ban,
    CircleCheck as CheckCircle,
    Search,
    User as UserIcon
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';

interface UserItemProps {
    user: User;
    onStatusChange: (userId: string, status: 'active' | 'suspended') => void;
}

function UserItem({ user, onStatusChange }: UserItemProps) {
    const isActive = !user.roles.includes('Suspended');
    const isAdmin =
        user.roles.includes('Admin')

    const displayRole = (() => {
        if (user.roles.includes('Admin') || user.roles.includes('SuperAdmin')) {
            return 'Admin';
        }
        if (user.roles.includes('Suspended')) {
            return 'Suspended';
        }
        // fallback to Student if nothing else
        return 'Student';
    })();

    return (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <Image
                    source={user.avatar ? { uri: user.avatar } : images.profile}
                    style={styles.avatar}
                />
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userCampus}>{user.campus}</Text>
                    <View style={[
                        styles.roleBadge,
                        displayRole === 'Admin'
                            ? styles.adminBadge
                            : displayRole === 'Suspended'
                                ? styles.suspendedBadge
                                : styles.studentBadge
                    ]}
                    >
                        <Text style={[
                            styles.roleText,
                            displayRole === 'Admin'
                                ? styles.adminText
                                : displayRole === 'Suspended'
                                    ? styles.suspendedText
                                    : styles.studentText
                        ]}
                        >
                            {displayRole}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionButtons}>
                {!isAdmin && (
                    <>
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                isActive ? styles.suspendButton : styles.activateButton,
                            ]}
                            onPress={() =>
                                onStatusChange(user._id, isActive ? 'suspended' : 'active')
                            }
                        >
                            {isActive ? (
                                <Ban size={16} color="#FFFFFF" />
                            ) : (
                                <CheckCircle size={16} color="#FFFFFF" />
                            )}
                            <Text style={styles.actionButtonText}>
                                {isActive ? 'Suspend' : 'Activate'}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

export default function AdminUsersScreen() {
    const router = useRouter();
    const admin = useSelector((state: RootState) => state.admin.admin);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<
        'all' | 'students' | 'admins' | 'suspended'
    >('all');

    const { data: usersRaw = [], isLoading, refetch } =
        useGetUsersQuery();
    const [updateUserStatus] = useUpdateUserStatusMutation();

    const users = useMemo(() => usersRaw, [usersRaw]);

    const filteredUsers = useMemo(() => {
        let list = users;

        if (selectedFilter !== 'all') {
            list = list.filter((u) => {
                switch (selectedFilter) {
                    case 'students':
                        return (
                            u.roles.includes('Student') &&
                            !u.roles.includes('Admin')
                        );
                    case 'admins':
                        return (
                            u.roles.includes('Admin') ||
                            u.roles.includes('SuperAdmin')
                        );
                    case 'suspended':
                        return u.roles.includes('Suspended');
                }
            });
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (u) =>
                    u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    u.campus.toLowerCase().includes(q)
            );
        }
        return [...list].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
    }, [users, selectedFilter, searchQuery]);

    const handleStatusChange = (
        userId: string,
        status: 'active' | 'suspended'
    ) => {
        const verb = status === 'suspended' ? 'Suspend' : 'Activate';
        Alert.alert(
            `${verb} User`,
            `Are you sure you want to ${verb.toLowerCase()} this user?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: verb,
                    style:
                        status === 'suspended' ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            await updateUserStatus({ userId, status }).unwrap();
                            Alert.alert(
                                'Success',
                                `User ${verb.toLowerCase()}d successfully.`
                            );
                            refetch();
                        } catch {
                            Alert.alert(
                                'Error',
                                `Failed to ${verb.toLowerCase()} user.`
                            );
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>User Management</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search size={20} color="#6B7280" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name, email, or campus"
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.filtersContainer}>
                {(['all', 'students', 'admins', 'suspended'] as const).map(
                    (key) => {
                        const label = {
                            all: 'All Users',
                            students: 'Students',
                            admins: 'Admins',
                            suspended: 'Suspended',
                        }[key];
                        const count = filteredUsers.filter((u) =>
                            key === 'all'
                                ? true
                                : key === 'students'
                                    ? u.roles.includes('Student') &&
                                    !u.roles.includes('Admin')
                                    : key === 'admins'
                                        ? u.roles.includes('Admin')
                                        : u.roles.includes('Suspended')
                        ).length;

                        return (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.filterButton,
                                    selectedFilter === key &&
                                    styles.activeFilterButton,
                                ]}
                                onPress={() => setSelectedFilter(key)}
                            >
                                <Text
                                    style={[
                                        styles.filterButtonText,
                                        selectedFilter === key &&
                                        styles.activeFilterButtonText,
                                    ]}
                                >
                                    {label} ({count})
                                </Text>
                            </TouchableOpacity>
                        );
                    }
                )}
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>
                        Loading users…
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    renderItem={({ item }) => (
                        <UserItem
                            user={item}
                            onStatusChange={handleStatusChange}
                        />
                    )}
                    keyExtractor={(u) => u._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <UserIcon size={64} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>
                                No users found
                            </Text>
                            <Text style={styles.emptyText}>
                                Try another search or filter.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#FFF',
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
        backgroundColor: '#FFF',
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
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
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
        color: '#FFF',
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
    listContent: {
        paddingBottom: 24,
    },
    userCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    userInfo: { flexDirection: 'row', marginBottom: 12 },
    avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
    userDetails: { flex: 1 },
    userName: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        color: '#1F2937',
        marginBottom: 2,
    },
    userEmail: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    userCampus: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    roleContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    roleBadge: {
        width: '40%',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 4,
    },
    studentBadge: { backgroundColor: '#EEF2FF' },
    adminBadge: { backgroundColor: '#FEF3C7' },
    suspendedBadge: { backgroundColor: '#FEE2E2' },
    roleText: { fontFamily: 'Inter-Medium', fontSize: 12, textAlign: 'center' },
    studentText: { color: '#4F46E5' },
    adminText: { color: '#D97706' },
    suspendedText: { color: '#DC2626' },
    actionButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 8,
    },
    suspendButton: { backgroundColor: '#DC2626' },
    activateButton: { backgroundColor: '#10B981' },
    adminButton: {
        backgroundColor: '#F59E0B',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 8,
    },
    actionButtonText: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: '#FFF',
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
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
