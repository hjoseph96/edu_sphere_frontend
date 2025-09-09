import api from '../api/axiosConfig';

class UserService {
  // Cache for user profile data
  static userProfileCache = null;
  static cacheTimestamp = null;
  static CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Get user profile with caching
  static async getUserProfile() {
    // Check if we have valid cached data
    if (this.userProfileCache && 
        this.cacheTimestamp && 
        Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.userProfileCache;
    }

    try {
      const response = await api.get('/users/profile');
      const userData = response.data;
      
      // Cache the data
      this.userProfileCache = userData;
      this.cacheTimestamp = Date.now();
      
      return userData;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(profileData) {
    try {
      const response = await api.patch('/users/profile', { user: profileData });
      const updatedData = response.data;
      
      // Update cache
      this.userProfileCache = updatedData;
      this.cacheTimestamp = Date.now();
      
      return updatedData;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  // Get user courses with caching
  static async getUserCourses() {
    try {
      const response = await api.get('/users/courses');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user courses:', error);
      throw error;
    }
  }

  // Get user assignments with caching
  static async getUserAssignments() {
    try {
      const response = await api.get('/users/assignments');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user assignments:', error);
      throw error;
    }
  }

  // Get user grades with caching
  static async getUserGrades() {
    try {
      const response = await api.get('/users/grades');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user grades:', error);
      throw error;
    }
  }

  // Clear user profile cache
  static clearUserProfileCache() {
    this.userProfileCache = null;
    this.cacheTimestamp = null;
  }

  // Get cached user profile (synchronous)
  static getCachedUserProfile() {
    if (this.userProfileCache && 
        this.cacheTimestamp && 
        Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.userProfileCache;
    }
    return null;
  }
}

export default UserService;
