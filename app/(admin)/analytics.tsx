import { RootState } from '@/lib/store';
import { useGetAnalyticsQuery } from '@/lib/store/api/adminApi';
import { router } from 'expo-router';
import { ArrowLeft, ChartBar as BarChart3, DollarSign, Package, TrendingDown, TrendingUp, Users } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

interface MetricCardProps {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: React.ReactNode;
    color: string;
}

function MetricCard({ title, value, change, isPositive, icon, color }: MetricCardProps) {
    return (
        <View style={[styles.metricCard, { borderLeftColor: color }]}>
            <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
                    {icon}
                </View>
                <View style={styles.changeContainer}>
                    {isPositive ? (
                        <TrendingUp size={16} color="#10B981" />
                    ) : (
                        <TrendingDown size={16} color="#EF4444" />
                    )}
                    <Text style={[styles.changeText, { color: isPositive ? '#10B981' : '#EF4444' }]}>
                        {change}
                    </Text>
                </View>
            </View>
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricTitle}>{title}</Text>
        </View>
    );
}

interface ChartBarProps {
    label: string;
    value: number;
    maxValue: number;
    color: string;
}

function ChartBar({ label, value, maxValue, color }: ChartBarProps) {
    const percentage = (value / maxValue) * 100;

    return (
        <View style={styles.chartBarContainer}>
            <Text style={styles.chartLabel}>{label}</Text>
            <View style={styles.chartBarWrapper}>
                <View style={styles.chartBarBackground}>
                    <View
                        style={[
                            styles.chartBarFill,
                            { width: `${percentage}%`, backgroundColor: color }
                        ]}
                    />
                </View>
                <Text style={styles.chartValue}>{value}</Text>
            </View>
        </View>
    );
}

export default function AdminAnalyticsScreen() {
    const admin = useSelector((state: RootState) => state.admin.admin);
    const { data: analytics, isLoading } = useGetAnalyticsQuery();

    const categoryData = [
        { label: 'Electronics', value: 45, color: '#6366F1' },
        { label: 'Books', value: 32, color: '#10B981' },
        { label: 'Furniture', value: 28, color: '#F59E0B' },
        { label: 'Clothing', value: 22, color: '#EF4444' },
        { label: 'Sports', value: 18, color: '#8B5CF6' },
        { label: 'Other', value: 15, color: '#6B7280' },
    ];

    const maxCategoryValue = Math.max(...categoryData.map(item => item.value));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Analytics & Reports</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                <Text style={styles.sectionTitle}>Performance Metrics</Text>

                <View style={styles.metricsGrid}>
                    <MetricCard
                        title="Total Revenue"
                        value={`₦${analytics?.totalRevenue?.toLocaleString() || '0'}`}
                        change="+15.3%"
                        isPositive={true}
                        icon={<DollarSign size={24} color="#10B981" />}
                        color="#10B981"
                    />
                    <MetricCard
                        title="Active Users"
                        value={analytics?.activeUsers?.toString() || '0'}
                        change="+8.7%"
                        isPositive={true}
                        icon={<Users size={24} color="#6366F1" />}
                        color="#6366F1"
                    />
                    <MetricCard
                        title="Listings Created"
                        value={analytics?.newListings?.toString() || '0'}
                        change="+12.1%"
                        isPositive={true}
                        icon={<Package size={24} color="#F59E0B" />}
                        color="#F59E0B"
                    />
                    <MetricCard
                        title="Conversion Rate"
                        value={`${analytics?.conversionRate || 0}%`}
                        change="-2.3%"
                        isPositive={false}
                        icon={<BarChart3 size={24} color="#EF4444" />}
                        color="#EF4444"
                    />
                </View>

                <View style={styles.chartSection}>
                    <Text style={styles.sectionTitle}>Popular Categories</Text>
                    <View style={styles.chartContainer}>
                        {categoryData.map((item, index) => (
                            <ChartBar
                                key={index}
                                label={item.label}
                                value={item.value}
                                maxValue={maxCategoryValue}
                                color={item.color}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>System Statistics</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {analytics?.totalBids?.toLocaleString() || '0'}
                            </Text>
                            <Text style={styles.statLabel}>Total Bids</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {analytics?.averageBidAmount?.toFixed(2) || '0.00'}
                            </Text>
                            <Text style={styles.statLabel}>Avg Bid Amount</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {analytics?.completionRate || 0}%
                            </Text>
                            <Text style={styles.statLabel}>Completion Rate</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {analytics?.averageListingDuration || 0}
                            </Text>
                            <Text style={styles.statLabel}>Avg Duration (days)</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.recentActivity}>
                    <Text style={styles.sectionTitle}>Recent System Activity</Text>
                    <View style={styles.activityList}>
                        <View style={styles.activityItem}>
                            <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>High-value auction completed: ₦125,000</Text>
                                <Text style={styles.activityTime}>2 hours ago</Text>
                            </View>
                        </View>
                        <View style={styles.activityItem}>
                            <View style={[styles.activityDot, { backgroundColor: '#F59E0B' }]} />
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>Peak user activity detected</Text>
                                <Text style={styles.activityTime}>4 hours ago</Text>
                            </View>
                        </View>
                        <View style={styles.activityItem}>
                            <View style={[styles.activityDot, { backgroundColor: '#6366F1' }]} />
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>New campus registered: Tech University</Text>
                                <Text style={styles.activityTime}>1 day ago</Text>
                            </View>
                        </View>
                        <View style={styles.activityItem}>
                            <View style={[styles.activityDot, { backgroundColor: '#EF4444' }]} />
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>System maintenance completed</Text>
                                <Text style={styles.activityTime}>2 days ago</Text>
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
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    metricCard: {
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
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    metricIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    changeText: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        marginLeft: 4,
    },
    metricValue: {
        fontFamily: 'Inter-Bold',
        fontSize: 24,
        color: '#1F2937',
        marginBottom: 4,
    },
    metricTitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#6B7280',
    },
    chartSection: {
        marginBottom: 24,
    },
    chartContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    chartBarContainer: {
        marginBottom: 16,
    },
    chartLabel: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: '#1F2937',
        marginBottom: 8,
    },
    chartBarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chartBarBackground: {
        flex: 1,
        height: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        marginRight: 12,
    },
    chartBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    chartValue: {
        fontFamily: 'Inter-Bold',
        fontSize: 14,
        color: '#1F2937',
        minWidth: 30,
        textAlign: 'right',
    },
    statsSection: {
        marginBottom: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statItem: {
        width: '50%',
        alignItems: 'center',
        paddingVertical: 16,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F3F4F6',
    },
    statValue: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#1F2937',
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
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