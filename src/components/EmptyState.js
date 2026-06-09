export default function EmptyState({
  text,
}) {

  return (

    <div className="empty-state-box">

      <img
        src="/images/empty.png"
        alt="empty"
        className="empty-state-image"
      />

      <h2>

        {text}

      </h2>

    </div>

  );

}