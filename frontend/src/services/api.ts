import { supabase } from '../lib/supabase';

const rawApiUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = (rawApiUrl && !rawApiUrl.includes('localhost')) 
  ? rawApiUrl 
  : 'https://civoai-backend.onrender.com/api/v1';

export interface ReportDetail {
  report_id: string;
  status: string;
  image: {
    path: string;
    url?: string;
  };
  location: {
    latitude?: number;
    longitude?: number;
    road_name?: string;
    landmark?: string;
  };
  description?: string;
  citizen_danger: boolean;
  water_visible: boolean;
  ai: {
    detection?: any;
    visual_analysis?: any;
    severity?: string;
    priority?: string;
    repair_recommendation?: string;
    estimated_cost?: any;
    ai_summary?: string;
    no_pothole?: boolean;
  };
  created_at: string;
  updated_at?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  deletion_reason?: string;
  deletion_note?: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) return {};
  return { 'Authorization': `Bearer ${token}` };
}

export const api = {
  // Existing Endpoints
  createReport: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create report');
    }
    return response.json();
  },

  getReport: async (reportId: string): Promise<ReportDetail> => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get report');
    }
    return response.json();
  },

  processReport: async (reportId: string) => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/process`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to process report with AI');
    }
    return response.json();
  },

  // Blocked Endpoints (Mock Interfaces)
  getReports: async (): Promise<ReportDetail[]> => {
    const response = await fetch(`${API_BASE_URL}/reports`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get reports');
    }
    return response.json();
  },

  updateEngineerAssessment: async (reportId: string, assessmentData: any) => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/engineer-assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit engineer assessment');
    }
    return response.json();
  },

  getAnalytics: async () => {
    console.warn("BLOCKED - backend endpoint GET /analytics not implemented");
    return null; // Return null for blocked state
  },

  syncUser: async (userId: string, email: string, role: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sync-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, email, role }),
      });
      return await response.json();
    } catch (err) {
      console.error("Failed to sync user to Supabase via backend:", err);
    }
  },

  getEngineers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users?role=engineer`);
      if (!response.ok) return [];
      return await response.json();
    } catch (err) {
      console.error("Failed to fetch engineers:", err);
      return [];
    }
  },

  updateReportStatus: async (reportId: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update report status');
    }
    return response.json();
  },

  removeReport: async (reportId: string, reason: string, note: string = '') => {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ reason, note }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to remove report');
    }
    return response.json();
  },

  getAuditHistory: async (): Promise<any[]> => {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/reports/audit-history`, {
      headers: { ...authHeaders },
    });
    if (!response.ok) {
      return [];
    }
    return response.json();
  }
};
