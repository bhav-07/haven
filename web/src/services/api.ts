/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useCallback, useState } from 'react';
import { UserStatusType, validStatuses } from '../types';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

export const useApi = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const joinSpace = async (spaceId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.patch(`${API_BASE_URL}/space/${spaceId}/join`);
            // console.log(response.data);
            if (response.data.status == "error") {
                setError(response.data.status.error)
            }
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to join space';
            setError(errorMessage);
            console.error('Error joining space:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getUserSpaces = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/user/spaces`);
            // console.log(response.data);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to fetch user spaces';
            setError(errorMessage);
            console.error('Error fetching user spaces:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const createSpace = async (spaceName: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/space`, {
                name: spaceName
            });
            // console.log(response.data);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to create user spaces';
            setError(errorMessage);
            console.error('Error fetching user spaces:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getSpace = useCallback(async (spaceId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/space/${spaceId}`);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to fetch space';
            setError(errorMessage);
            console.error('Error fetching space:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteSpace = async (spaceId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.delete(`${API_BASE_URL}/space/${spaceId}`);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to delete space';
            setError(errorMessage);
            console.error('Error deleting space:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getUserStatus = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/user/status`);
            // console.log(response.data);
            const receivedStatus = response.data.data.status as UserStatusType;

            if (!validStatuses.includes(receivedStatus)) {
                throw new Error(`Invalid status received: ${receivedStatus}`);
            }
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch user status';
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getUserStatusOptions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/user/status/options`);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch user status option';
            setError(errorMessage);
            console.error('Error fetching user status option:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserStatus = async (newStatus: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.patch(`${API_BASE_URL}/user/status`, {
                status: newStatus
            });
            // console.log(response.data);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to update user status';
            setError(errorMessage);
            console.error('Error updating user status:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    return {
        createSpace,
        joinSpace,
        getUserSpaces,
        getSpace,
        deleteSpace,
        getUserStatus,
        getUserStatusOptions,
        updateUserStatus,
        isLoading,
        error
    };
};