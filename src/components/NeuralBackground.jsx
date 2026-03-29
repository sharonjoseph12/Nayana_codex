export default function NeuralBackground() {
  const nodes = [
    [8, 22],
    [21, 12],
    [30, 28],
    [45, 18],
    [58, 36],
    [72, 20],
    [84, 44],
    [64, 70],
    [38, 76],
    [18, 62],
  ];

  const connections = [
    [0, 1],
    [1, 2],
    [2, 4],
    [1, 3],
    [3, 5],
    [5, 6],
    [4, 7],
    [7, 8],
    [8, 9],
    [2, 9],
  ];

  return (
    <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="neuralLine" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#00ffaa" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#bf80ff" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      {connections.map(([start, end], index) => (
        <line
          key={`${start}-${end}`}
          x1={nodes[start][0]}
          y1={nodes[start][1]}
          x2={nodes[end][0]}
          y2={nodes[end][1]}
          stroke="url(#neuralLine)"
          strokeWidth="0.18"
          opacity="0.9"
        >
          <animate attributeName="stroke-opacity" values="0.15;0.45;0.15" dur={`${6 + index}s`} repeatCount="indefinite" />
        </line>
      ))}
      {nodes.map(([x, y], index) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.55" fill="#00d4ff">
          <animate attributeName="r" values="0.45;0.9;0.45" dur={`${4 + index * 0.35}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.35;0.95;0.35" dur={`${4 + index * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}
