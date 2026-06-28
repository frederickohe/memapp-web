interface MockDataBannerProps {
  message?: string
}

export function MockDataBanner({
  message = 'This page is not yet wired to a live backend endpoint — figures shown are sample data.',
}: MockDataBannerProps) {
  return (
    <div className="mock-banner">
      <i className="ri-flask-line" />
      <span>
        <strong>Preview data.</strong> {message}
      </span>
      <style>{`
        .mock-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #9a3412;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 12.5px;
          font-weight: 500;
          margin-bottom: 18px;
        }
        .mock-banner i {
          font-size: 16px;
          flex-shrink: 0;
        }
        .mock-banner strong {
          font-weight: 700;
        }
      `}</style>
    </div>
  )
}
