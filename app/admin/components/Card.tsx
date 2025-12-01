import React from "react";

interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export default function Card({ title, className = "", children }: CardProps) {
  return (
    <div className={`bg-white bg-opacity-90 rounded-lg shadow p-6 mb-4 ${className}`}>
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      {children}
    </div>
  );
}
