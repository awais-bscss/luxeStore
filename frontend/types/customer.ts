export interface Customer {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  isEmailVerified: boolean;
  joinDate: string;
  status: 'active' | 'inactive' | 'vip' | 'blocked';
  totalOrders: number;
  totalSpent: number;
  lastOrder: string | null;
  phone?: string;
  location?: string;
}

export interface CustomerStats {
  total: number;
  active: number;
  vip: number;
  inactive: number;
  totalRevenue: number;
  avgOrderValue: number;
}
