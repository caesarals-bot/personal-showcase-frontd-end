/**
 * PageSkeletons - Componentes de skeleton específicos para cada página
 * 
 * Características:
 * - Skeletons personalizados por página
 * - Animaciones suaves
 * - Responsive design
 * - Mantiene la estructura visual
 */

import React from 'react'
import { motion } from 'framer-motion'

// Skeleton base reutilizable
const SkeletonBox: React.FC<{
  className?: string
  animate?: boolean
}> = ({ className = '', animate = true }) => (
  <div 
    className={`bg-muted rounded-md ${animate ? 'animate-pulse' : ''} ${className}`}
  />
)

// Skeleton para BlogPage
export const BlogPageSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="container mx-auto px-4 py-8 space-y-8"
  >
    {/* Header */}
    <div className="text-center space-y-4">
      <SkeletonBox className="h-12 w-64 mx-auto" />
      <SkeletonBox className="h-6 w-96 mx-auto" />
    </div>

    {/* Search and filters */}
    <div className="flex flex-col md:flex-row gap-4 justify-between">
      <SkeletonBox className="h-10 w-full md:w-80" />
      <div className="flex gap-2">
        <SkeletonBox className="h-10 w-24" />
        <SkeletonBox className="h-10 w-24" />
        <SkeletonBox className="h-10 w-24" />
      </div>
    </div>

    {/* Blog cards grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <SkeletonBox className="h-48 w-full" />
          <div className="space-y-2">
            <SkeletonBox className="h-6 w-3/4" />
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-2/3" />
          </div>
          <div className="flex justify-between items-center">
            <SkeletonBox className="h-4 w-20" />
            <div className="flex gap-2">
              <SkeletonBox className="h-4 w-12" />
              <SkeletonBox className="h-4 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
)

// Skeleton para PortfolioPage
export const PortfolioPageSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="container mx-auto px-4 py-8 space-y-8"
  >
    {/* Header */}
    <div className="text-center space-y-4">
      <SkeletonBox className="h-12 w-72 mx-auto" />
      <SkeletonBox className="h-6 w-96 mx-auto" />
    </div>

    {/* Filter tabs */}
    <div className="flex justify-center">
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBox key={i} className="h-10 w-24" />
        ))}
      </div>
    </div>

    {/* Projects grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <SkeletonBox className="h-64 w-full" />
          <div className="space-y-2">
            <SkeletonBox className="h-6 w-3/4" />
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-2/3" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <SkeletonBox key={j} className="h-6 w-16" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </motion.div>
)

// Skeleton para AboutPage
export const AboutPageSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="container mx-auto px-4 py-8"
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left column */}
      <div className="space-y-8">
        {/* Profile section */}
        <div className="space-y-4">
          <SkeletonBox className="h-10 w-48" />
          <div className="flex items-center gap-4">
            <SkeletonBox className="h-24 w-24 rounded-full" />
            <div className="space-y-2 flex-1">
              <SkeletonBox className="h-6 w-3/4" />
              <SkeletonBox className="h-4 w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-3/4" />
          </div>
        </div>

        {/* Skills section */}
        <div className="space-y-4">
          <SkeletonBox className="h-8 w-32" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonBox key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Right column - Timeline */}
      <div className="space-y-6">
        <SkeletonBox className="h-10 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <SkeletonBox className="h-4 w-4 rounded-full" />
              <SkeletonBox className="h-16 w-0.5" />
            </div>
            <div className="flex-1 space-y-2">
              <SkeletonBox className="h-6 w-3/4" />
              <SkeletonBox className="h-4 w-1/2" />
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
)

// Skeleton para ContactPage
export const ContactPageSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="container mx-auto px-4 py-8"
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Contact info */}
      <div className="space-y-8">
        <div className="space-y-4">
          <SkeletonBox className="h-10 w-48" />
          <SkeletonBox className="h-6 w-full" />
          <SkeletonBox className="h-6 w-3/4" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <SkeletonBox className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <SkeletonBox className="h-5 w-1/2" />
                <SkeletonBox className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <SkeletonBox className="h-6 w-32" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBox key={i} className="h-10 w-10 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Contact form */}
      <div className="space-y-6">
        <SkeletonBox className="h-10 w-56" />
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SkeletonBox className="h-10 w-full" />
            <SkeletonBox className="h-10 w-full" />
          </div>
          <SkeletonBox className="h-10 w-full" />
          <SkeletonBox className="h-32 w-full" />
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-4 w-4" />
            <SkeletonBox className="h-4 w-48" />
          </div>
          <SkeletonBox className="h-12 w-full" />
        </div>
      </div>
    </div>
  </motion.div>
)

// Skeleton para Auth Pages
export const AuthPageSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen flex items-center justify-center py-12 px-4"
  >
    <div className="w-full max-w-md space-y-6">
      <SkeletonBox className="h-8 w-32" />
      
      <div className="space-y-6 p-6 border rounded-lg">
        <div className="text-center space-y-4">
          <SkeletonBox className="h-12 w-12 rounded-full mx-auto" />
          <SkeletonBox className="h-8 w-48 mx-auto" />
          <SkeletonBox className="h-4 w-64 mx-auto" />
        </div>

        <div className="space-y-4">
          <SkeletonBox className="h-10 w-full" />
          <SkeletonBox className="h-10 w-full" />
          <SkeletonBox className="h-10 w-full" />
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-4 w-4" />
            <SkeletonBox className="h-4 w-32" />
          </div>
          <SkeletonBox className="h-12 w-full" />
        </div>

        <div className="space-y-4">
          <SkeletonBox className="h-px w-full" />
          <SkeletonBox className="h-10 w-full" />
          <SkeletonBox className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  </motion.div>
)

// Skeleton genérico para páginas admin
export const AdminPageSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="p-6 space-y-6"
  >
    {/* Header */}
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <SkeletonBox className="h-8 w-48" />
        <SkeletonBox className="h-4 w-64" />
      </div>
      <SkeletonBox className="h-10 w-32" />
    </div>

    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-2">
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="h-8 w-16" />
          <SkeletonBox className="h-3 w-20" />
        </div>
      ))}
    </div>

    {/* Table */}
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <SkeletonBox className="h-6 w-32" />
      </div>
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <SkeletonBox className="h-4 w-4" />
            <SkeletonBox className="h-4 flex-1" />
            <SkeletonBox className="h-4 w-20" />
            <SkeletonBox className="h-4 w-16" />
            <SkeletonBox className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  </motion.div>
)