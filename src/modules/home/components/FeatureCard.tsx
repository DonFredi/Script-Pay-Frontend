import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const FeatureCard = () => {
  const features = [
    {
      id: 1,
      title: "STK Push Integration",
      description: "Initiate M-Pesa payments with a simple API call",
    },
    {
      id: 2,
      title: "Real-time Callbacks",
      description: "Get instant updates when payments are completed",
    },

    {
      id: 3,
      title: "Transaction Tracking",
      description: "Track, filter and analyze all your transactions",
    },
    {
      id: 4,
      title: "Developer Friendly",
      description: "Well documented APIs and easy to integrate",
    },
  ];
  return (
    <SectionWrapper className="py-10">
      <div className="mb-6 text-center">
        <h2>Everything you need to accept payments</h2>
        <p className="text-foreground-muted">One integration, the whole M-Pesa payment lifecycle.</p>
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="flex-1 py-8 px-5 rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <h5 className="mb-2">{feature.title}</h5>
            <p className="text-foreground-muted">{feature.description}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};
export default FeatureCard;
