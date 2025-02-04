/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useCallback, useState } from 'react';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

export const useApi = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const joinSpace = async (spaceId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.patch(`${API_BASE_URL}/space/${spaceId}/join`);
            console.log(response.data);
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
            console.log(response.data);
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
            console.log(response.data);
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

    return {
        createSpace,
        joinSpace,
        getUserSpaces,
        getSpace,
        isLoading,
        error
    };
};