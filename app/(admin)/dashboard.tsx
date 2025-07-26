import { RootState } from '@/lib/store';
import { useGetAdminStatsQuery } from '@/lib/store/api/adminApi';
import { router } from 'expo-router';
import { ChartBar as BarChart3, DollarSign, LogOut, Package, TrendingUp, Users } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    trend?: string;
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
    return (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                    {icon}
                </View>
                {trend && (
                    <View style={styles.trendContainer}>
                        <TrendingUp size={16} color="#10B981" />
                        <Text style={styles.trendText}>{trend}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </View>
    );
}

export default function AdminDashboard() {
    const admin = useSelector((state: RootState) => state.admin.admin);
    const { data: stats, isLoading } = useGetAdminStatsQuery();

    const handleLogout = () => {
        router.replace('/(auth)/login');
    };

    const navigationItems = [
        {
            title: 'Manage Listings',
            description: 'View, edit, and delete student listings',
            icon: <Package size={24} color="#6366F1" />,
            route: '/(admin)/listings',
            color: '#6366F1',
        },
        {
            title: 'User Management',
            description: 'Manage student accounts and permissions',
            icon: <Users size={24} color="#10B981" />,
            route: '/(admin)/users',
            color: '#10B981',
        },
        {
            title: 'Analytics & Reports',
            description: 'Performance metrics and detailed analytics',
            icon: <BarChart3 size={24} color="#F59E0B" />,
            route: '/(admin)/analytics',
            color: '#F59E0B',
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back, Admin</Text>
                    <Text style={styles.adminName}>{admin?.name || 'Administrator'}</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={24} color="#DC2626" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                <Text style={styles.sectionTitle}>System Overview</Text>

                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers?.toString() || '0'}
                        icon={<Users size={24} color="#6366F1" />}
                        color="#6366F1"
                        trend="+12%"
                    />
                    <StatCard
                        title="Active Listings"
                        value={stats?.activeListings?.toString() || '0'}
                        icon={<Package size={24} color="#10B981" />}
                        color="#10B981"
                        trend="+8%"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`₦${stats?.totalRevenue?.toLocaleString() || '0'}`}
                        icon={<DollarSign size={24} color="#F59E0B" />}
                        color="#F59E0B"
                        trend="+15%"
                    />
                    <StatCard
                        title="Completed Auctions"
                        value={stats?.completedAuctions?.toString() || '0'}
                        icon={<TrendingUp size={24} color="#EF4444" />}
                        color="#EF4444"
                        trend="+5%"
                    />
                </View>

                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <View style={styles.navigationGrid}>
                    {navigationItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.navCard}
                            onPress={() => router.push(item.route as any)}
                        >
                            <View style={[styles.navIcon, { backgroundColor: item.color + '20' }]}>
                                {item.icon}
                            </View>
                            <Text style={styles.navTitle}>{item.title}</Text>
                            <Text style={styles.navDescription}>{item.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.recentActivity}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={styles.activityList}>
                        <View style={styles.activityItem}>
                            <View style={styles.activityDot} />
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>New user registration: John Doe</Text>
                                <Text style={styles.activityTime}>2 minutes ago</Text>
                            </View>
                        </View>
                        <View style={styles.activityItem}>
                            <View style={styles.activityDot} />
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>Listing flagged for review: MacBook Pro</Text>
                                <Text style={styles.activityTime}>15 minutes ago</Text>
                            </View>
                        </View>
                        <View style={styles.activityItem}>
                            <View style={styles.activityDot} />
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>Auction completed: Physics Textbook</Text>
                                <Text style={styles.activityTime}>1 hour ago</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    greeting: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#6B7280',
    },
    adminName: {
        fontFamily: 'Inter-Bold',
        fontSize: 24,
        color: '#1F2937',
    },
    logoutButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#1F2937',
        marginTop: 24,
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendText: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: '#10B981',
        marginLeft: 4,
    },
    statValue: {
        fontFamily: 'Inter-Bold',
        fontSize: 24,
        color: '#1F2937',
        marginBottom: 4,
    },
    statTitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#6B7280',
    },
    navigationGrid: {
        marginBottom: 8,
    },
    navCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    navIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    navTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: '#1F2937',
        marginBottom: 4,
    },
    navDescription: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#6B7280',
    },
    recentActivity: {
        marginBottom: 40,
    },
    activityList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6366F1',
        marginTop: 6,
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: '#1F2937',
        marginBottom: 2,
    },
    activityTime: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: '#6B7280',
    },
});