import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_2px_8px_0_rgb(37_99_235_/_0.15)] hover:shadow-[0_4px_16px_0_rgb(37_99_235_/_0.25)] hover:-translate-y-0.5',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 shadow-sm hover:shadow-md transition-all',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-[0_2px_8px_0_rgb(220_38_38_/_0.15)] hover:shadow-[0_4px_16px_0_rgb(220_38_38_/_0.25)] hover:-translate-y-0.5',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all',
      outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md transition-all',
      success: 'bg-green-600 text-white hover:bg-green-700 shadow-[0_2px_8px_0_rgb(34_197_94_/_0.15)] hover:shadow-[0_4px_16px_0_rgb(34_197_94_/_0.25)] hover:-translate-y-0.5',
      warning: 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-[0_2px_8px_0_rgb(234_179_8_/_0.15)] hover:shadow-[0_4px_16px_0_rgb(234_179_8_/_0.25)] hover:-translate-y-0.5',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-lg',
    }

    return (
      <button
        className={cn(
          'rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
          'font-roboto tracking-wide',
          'font-normal',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

