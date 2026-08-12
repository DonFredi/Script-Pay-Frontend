import z from "zod";

export const phoneValidator = z
  .string()
  .regex(/^(\+?254|0)[71][0-9]{8}$/, "Invalid Kenyan phone number")
  .transform(p => p.startsWith('0') ? `254${p.slice(1)}` : p.startsWith('+') ? p.slice(1) : p);

export const amountValidator = z
  .number()
  .min(50, "Minimum amount is KES 0.50")
  .max(9999999, "Maximum amount is KES 99,999.99");

// modules/payments/stk-push/initiate-stk-push.dto.ts
export const InitiateStkPushSchema = z.object({
  msisdn: phoneValidator,
  amountMinorUnits: amountValidator,
  accountReference: z.string().min(1).max(20),
  transactionDesc: z.string().min(1).max(50),
  channel: z.enum(['TILL', 'PAYBILL']),
  metadata:z.record(z.string(), z.any()).optional(),
});

export type InitiateStkPushDto = z.infer<typeof InitiateStkPushSchema>;

// In controller
@Post('initiate')
@UsePipes(new ZodValidationPipe(InitiateStkPushSchema))
async initiate(@Body() dto: InitiateStkPushDto) {
  // dto is guaranteed valid
}