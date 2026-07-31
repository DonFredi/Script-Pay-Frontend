import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const HowItWorks = () => {
  const process = [
    {
      id: 1,
      title: " 1  Send payment request",
      description: "You initiate a payment using our STK Push API",
    },
    {
      id: 2,
      title: "2  Customer enters pin",
      description: "The customer receives the STK prompt and enters pin",
    },
    {
      id: 3,
      title: "3  Payment confirmed",
      description: "We receive the callback and update the transaction status",
    },
  ];
  return (
    <SectionWrapper>
      <h2 className="my-12 text-center">How it works</h2>
      <div className="flex flex-col md:flex-row justify-between gap-2">
        {process.map((p) => (
          <div key={p.id} className="py-8 px-3 my-4 bg-white rounded-2xl shadow-lg  ">
            <h5 className="my-4">{p.title}</h5>
            <p>{p.description}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};
export default HowItWorks;
