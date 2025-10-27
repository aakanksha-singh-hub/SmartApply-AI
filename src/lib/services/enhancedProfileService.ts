import axios from '@/utility/axiosInterceptor';
import { AxiosError } from 'axios';
import { EnhancedUserProfile } from '../types';

export class EnhancedProfileService {
  /**
   * Save enhanced profile to MongoDB
   */
  static async saveEnhancedProfile(profile: EnhancedUserProfile): Promise<EnhancedUserProfile> {
    try {
      console.log('Saving enhanced profile to database:', profile);
      const response = await axios.post('/user/enhanced-profile', profile);
      console.log('Enhanced profile saved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to save enhanced profile:', error);
      throw error;
    }
  }

  /**
   * Load enhanced profile from MongoDB
   */
  static async loadEnhancedProfile(): Promise<EnhancedUserProfile | null> {
    try {
      console.log('Loading enhanced profile from database...');
      const response = await axios.get('/user/enhanced-profile');
      console.log('Enhanced profile loaded successfully:', response.data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        console.log('No enhanced profile found in database');
        return null;
      }
      console.error('Failed to load enhanced profile:', error);
      throw error;
    }
  }

  /**
   * Update enhanced profile in MongoDB
   */
  static async updateEnhancedProfile(updates: Partial<EnhancedUserProfile>): Promise<EnhancedUserProfile> {
    try {
      console.log('Updating enhanced profile in database:', updates);
      const response = await axios.patch('/user/enhanced-profile', updates);
      console.log('Enhanced profile updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update enhanced profile:', error);
      throw error;
    }
  }

  /**
   * Delete enhanced profile from MongoDB
   */
  static async deleteEnhancedProfile(): Promise<void> {
    try {
      console.log('Deleting enhanced profile from database...');
      await axios.delete('/user/enhanced-profile');
      console.log('Enhanced profile deleted successfully');
    } catch (error) {
      console.error('Failed to delete enhanced profile:', error);
      throw error;
    }
  }
}