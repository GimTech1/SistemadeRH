import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_2px_8px_0_rgb(37_99_235_/_0.15)] hover:shadow-[0_4px_16px_0_rgb(37_99_235_/_0.25)] hover:-translate-y-0.5',
      secondary: 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white border border-slate-200/60 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.03)] hover:shadow-[0_4px_12px_0_rgb(0_0_0_/_0.08)] hover:-translate-y-0.5 hover:border-slate-300/60',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-[0_2px_8px_0_rgb(220_38_38_/_0.15)] hover:shadow-[0_4px_16px_0_rgb(220_38_38_/_0.25)] hover:-translate-y-0.5',
      ghost: 'bg-transparent hover:bg-slate-100/60 text-slate-600 hover:text-slate-900 hover:-translate-y-0.5',
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

