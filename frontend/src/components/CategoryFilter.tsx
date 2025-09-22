import React from 'react'
import { Button } from 'antd'
import {
  getCategoryButtonStyle,
  getCategoryIndicatorStyle,
  getCategoryCountStyle,
  type CategoryConfig
} from '../utils/category'

interface CategoryFilterProps {
  categories: CategoryConfig[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  className?: string
  style?: React.CSSProperties
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  className,
  style
}) => {
  return (
    <div
      style={{
        marginBottom: 'var(--spacing-xl)',
        display: 'flex',
        justifyContent: 'flex-start',
        ...style
      }}
      className={className}
    >
      <Button.Group style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {categories.map((category, index) => {
          const isSelected = selectedCategory === category.key
          const buttonStyle = getCategoryButtonStyle(category.key, isSelected, index, categories.length)
          const indicatorStyle = getCategoryIndicatorStyle(category.key)
          const countStyle = getCategoryCountStyle(category.key)

          return (
            <Button
              key={category.key}
              type="default"
              onClick={() => onCategoryChange(category.key)}
              style={buttonStyle}
            >
              {indicatorStyle && <div style={indicatorStyle} />}

              <span style={{ fontSize: '13px' }}>
                {category.label}
              </span>

              <div style={countStyle}>
                {category.count}
              </div>
            </Button>
          )
        })}
      </Button.Group>
    </div>
  )
}