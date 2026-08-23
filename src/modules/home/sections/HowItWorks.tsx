import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const HowItWorks = () => {
  const process = [
    {
      id: 1,
      title: "Send payment request",
      description: "You initiate a payment using our STK Push API",
    },
    {
      id: 2,
      title: "Customer enters PIN",
      description: "The customer receives the STK prompt and enters their M-Pesa PIN",
    },
    {
      id: 3,
      title: "You get notified instantly",
      description:
        "A webhook fires the moment Safaricom confirms — and reconciliation catches it even if that webhook doesn't arrive",
    },
  ];
  return (
    <SectionWrapper id="how-it-works" className="py-10">
      <h2 className="mb-12 text-center">How it works</h2>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {process.map((p) => (
          <div key={p.id} className="flex-1 py-8 px-5 rounded-2xl border bg-card shadow-sm">
            <div className="mb-3 flex size-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
              {p.id}
            </div>
            <h5 className="mb-2">{p.title}</h5>
            <p className="text-foreground-muted">{p.description}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};
export default HowItWorks;
