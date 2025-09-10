import api from '../api/axiosConfig';

class PageViewService {
  async fetchAnalytics(pageViewData) {
    try {
      const response = await api.get(`/documents/${pageViewData.pageview_id}/analytics`);
      
      if (response.status === 200) {
        return { success: true, analytics: response.data.analytics };
      } else {
        return { success: false, error: "Server error while fetching analytics" };
      }
    } catch (error) {
      console.error('Error tracking page view:', error);
      return { success: false, error: "Server error while fetching analytics" };
    }
  }
}

// Create a singleton instance
const pageViewService = new PageViewService();

export default pageViewService;
