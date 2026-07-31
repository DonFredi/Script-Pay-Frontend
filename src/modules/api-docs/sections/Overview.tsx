import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const Overview = () => {
  return (
    <SectionWrapper>
      <h1>M-Pesa API documentation</h1>
      <h2>Overview</h2>
      <p>Use this API to integrate M-Pesa payments into your application</p>
      <h2>Base URL</h2>
      <div className="bg-gray-100 p-3 rounded mt-2 text-sm">https://mpesa-payments.vercel.app/api/mpesa</div>

      <h2>Authentication</h2>
      <p className="text-gray-600 mt-2">Include your API key in headers:</p>

      <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
        {`{
  "x-api-key": "your_api_key_here"
}`}
      </pre>
    </SectionWrapper>
  );
};
export default Overview;
