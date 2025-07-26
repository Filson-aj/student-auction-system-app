export interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    totalListings: number;
    activeListings: number;
    completedAuctions: number;
    totalRevenue: number;
    averageAuctionValue: number;
    newUsersThisMonth: number;
    newListingsThisMonth: number;
    topCategories: CategoryStat[];
    recentActivity: ActivityItem[];
}

export interface CategoryStat {
    category: string;
    count: number;
    percentage: number;
}

export interface ActivityItem {
    id: string;
    type: 'user_registration' | 'listing_created' | 'auction_completed' | 'user_suspended' | 'system_event';
    description: string;
    timestamp: string;
    userId?: string;
    itemId?: string;
}

export interface Analytics {
    totalRevenue: number;
    activeUsers: number;
    newListings: number;
    conversionRate: number;
    totalBids: number;
    averageBidAmount: number;
    completionRate: number;
    averageListingDuration: number;
    categoryBreakdown: CategoryStat[];
    monthlyRevenue: MonthlyData[];
    userGrowth: MonthlyData[];
}

export interface MonthlyData {
    month: string;
    value: number;
}

export interface UserManagement {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    adminUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
}

export interface SystemHealth {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
    databaseStatus: 'healthy' | 'warning' | 'error';
    serverLoad: number;
}