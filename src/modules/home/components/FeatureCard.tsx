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
    <SectionWrapper>
      <div className="flex flex-col md:flex-row justify-between gap-2 ">
        {features.map((feature) => (
          <div key={feature.id} className="py-12 px-3 my-4 bg-white rounded-2xl shadow-lg ">
            <h5 className="my-4">{feature.title}</h5>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};
export default FeatureCard;
