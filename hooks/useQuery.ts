'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  saveWeek,
  getAllWeeks,
  uploadMedia,
  getWeekMedia,
  deleteMedia,
  getMe,
  updateProfile,
} from '@/lib/api'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
}

export const weekKeys = {
  all: ['weeks'] as const,
  lists: () => [...weekKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...weekKeys.lists(), filters] as const,
}

export const mediaKeys = {
  all: ['media'] as const,
  lists: () => [...mediaKeys.all, 'list'] as const,
  weekMedia: (weekIndex: number) => [...mediaKeys.lists(), weekIndex] as const,
}

// ============================================================================
// AUTH HOOKS
// ============================================================================

/**
 * ✅ useGetMe - Fetch current user
 * Stale time: 5 minutes (profile rarely changes)
 */
export const useGetMe = () => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await getMe()
      return response?.user || null
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * ✅ useUpdateProfile - Update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // ✅ Update cache with new user data
      if (data?.user) {
        queryClient.setQueryData(authKeys.me(), data.user)
      }
    },
    onError: (error) => {
      console.error('Profile update error:', error)
    },
  })
}

// ============================================================================
// WEEK HOOKS
// ============================================================================

/**
 * ✅ useGetAllWeeks - Fetch all weeks
 * Stale time: 2 minutes (more dynamic than profile)
 */
export const useGetAllWeeks = () => {
  return useQuery({
    queryKey: weekKeys.lists(),
    queryFn: getAllWeeks,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * ✅ useSaveWeek - Save/create a week
 */
export const useSaveWeek = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveWeek,
    onSuccess: () => {
      // ✅ Invalidate weeks list to refetch
      queryClient.invalidateQueries({
        queryKey: weekKeys.lists(),
      })
    },
    onError: (error) => {
      console.error('Save week error:', error)
    },
  })
}

// ============================================================================
// MEDIA HOOKS
// ============================================================================

/**
 * ✅ useGetWeekMedia - Fetch media for a specific week
 */
export const useGetWeekMedia = (weekIndex: number, enabled = true) => {
  return useQuery({
    queryKey: mediaKeys.weekMedia(weekIndex),
    queryFn: () => getWeekMedia(weekIndex),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * ✅ useUploadMedia - Upload media file
 */
export const useUploadMedia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, weekIndex, type }: { file: File; weekIndex: number; type: string }) =>
      uploadMedia(file, weekIndex, type),
    onSuccess: (data, variables) => {
      // ✅ Invalidate week media cache
      queryClient.invalidateQueries({
        queryKey: mediaKeys.weekMedia(variables.weekIndex),
      })
    },
    onError: (error) => {
      console.error('Upload media error:', error)
    },
  })
}

/**
 * ✅ useDeleteMedia - Delete media file
 */
export const useDeleteMedia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      // ✅ Invalidate all media
      queryClient.invalidateQueries({
        queryKey: mediaKeys.all,
      })
    },
    onError: (error) => {
      console.error('Delete media error:', error)
    },
  })
}

// ============================================================================
// COMPOSITE HOOKS
// ============================================================================

/**
 * ✅ useAuth - All auth operations in one hook
 */
export const useAuth = () => {
  const { data: user, isLoading, error } = useGetMe()
  const updateProfileMutation = useUpdateProfile()

  return {
    // State
    user,
    isLoading,
    isError: !!error,
    isAuthenticated: !!user,

    // Mutations
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error,
  }
}

/**
 * ✅ useWeeks - All week operations in one hook
 */
export const useWeeks = () => {
  const { data, isLoading, error } = useGetAllWeeks()
  const saveMutation = useSaveWeek()

  return {
    // State
    weeks: data?.weeks || [],
    isLoading,
    error,

    // Mutations
    save: saveMutation.mutate,
    saveAsync: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
  }
}

/**
 * ✅ useMedia - All media operations for a specific week
 */
export const useMedia = (weekIndex: number, enabled = true) => {
  const { data, isLoading, error } = useGetWeekMedia(weekIndex, enabled)
  const uploadMutation = useUploadMedia()
  const deleteMutation = useDeleteMedia()

  return {
    // State
    media: data?.media || [],
    isLoading,
    error,

    // Mutations
    upload: uploadMutation.mutate,
    uploadAsync: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,

    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  }
}