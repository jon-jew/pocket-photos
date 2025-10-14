import './bubbles.scss';

const Bubbles = () => (
  <div className="bubbles">
    {Array.from({ length: 50 }).map((_, index) => (
      <div key={`bubble-${index}`} className="bubble" />
    ))}
  </div>
);

export default Bubbles;
