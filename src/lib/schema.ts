import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  // Cast readonly array to mutable tuple for z.enum compatibility
  category: z.string(),
  type: z.enum(["debit", "credit"]),
  date: z.string().min(1, "Date is required").refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
