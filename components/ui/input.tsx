import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm text-slate-900 placeholder:text-slate-500 caret-slate-900 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.02)]",
          "focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-100/40 focus:bg-white",
          "hover:bg-white hover:border-slate-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-300",
          "font-roboto font-light tracking-wide",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }






