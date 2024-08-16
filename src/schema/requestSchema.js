import { z } from "zod";

export const requestSchema = z.object({
  message: z.string().min(1, "Message can not be empty"),
  offer: z.number().min(1, "Offer can not be empty"),
});
export const messageSchema = z.object({
  message: z.string().min(1, "Message can not be empty"),
});
