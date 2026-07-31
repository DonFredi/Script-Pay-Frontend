import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const DocCard = () => {
  return (
    <SectionWrapper>
      {/* STK PUSH */}
      <section className="mt-6">
        <h2>STK Push</h2>

        <p className="text-gray-600 mt-2">Initiate payment request to customer's phone.</p>

        <div className="bg-gray-100 p-3 rounded mt-2 text-sm">POST /transactions</div>

        <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
          {`{
  "transactionType": "stkPush",
  "phone": "2547XXXXXXXX",
  "amount": 100
}`}
        </pre>
      </section>

      {/* PAYBILL */}
      <section className="mt-6">
        <h2>Paybill</h2>

        <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
          {`{
  "transactionType": "paybill",
  "phone": "2547XXXXXXXX",
  "amount": 100,
  "shortcode": "123456",
  "accountNumber": "INV001"
}`}
        </pre>
      </section>

      {/* RESPONSE */}
      <section className="mt-6">
        <h2>Response</h2>

        <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
          {`{
  "CheckoutRequestID": "ws_CO_123...",
  "ResponseCode": "0",
  "CustomerMessage": "Success. Request accepted"
}`}
        </pre>
      </section>
    </SectionWrapper>
  );
};
export default DocCard;
