"use client";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function Reveal({ children, delay, className = "", style = {} }: RevealProps) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}