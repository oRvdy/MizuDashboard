import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'md', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-gray-800 hover:bg-gray-700 text-white',
      primary: 'bg-purple-600 hover:bg-purple-700 text-white',
      secondary: 'bg-white/10 hover:bg-white/20 text-white'
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    }

    const classes = cn(
      "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
      variantClasses[variant],
      sizeClasses[size],
      className
    )

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }
