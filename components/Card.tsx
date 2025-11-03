interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export default function Card({
  children,
  className = "",
  title,
  actions,
}: CardProps) {
  return (
    <>
      <style jsx>{`
        .card {
          background: var(--card);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 24px;
          transition: all 0.3s ease;
        }
        .card:hover {
          box-shadow: 0 12px 40px rgba(2, 6, 23, 0.4);
          transform: translateY(-2px);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .card-header h3 {
          margin: 0;
          font-size: 17px;
          color: #0b1220;
          font-weight: 600;
        }
      `}</style>

      <div className={`card ${className}`}>
        {(title || actions) && (
          <div className="card-header">
            {title && <h3>{title}</h3>}
            {actions && <div className="card-actions">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </>
  );
}
