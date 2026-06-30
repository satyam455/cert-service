type Metric = {
  label: string;
  value: string | number;
};

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="grid" aria-label="Dashboard metrics">
      {metrics.map((metric) => (
        <div className="metric" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </div>
      ))}
    </section>
  );
}
