import { OperationalException } from "../exceptions/operationalExceptions.js";
import { prismaClient } from "../routes/index.js";

export const addMessage = async (req, res, next) => {
  const userId = req.userId;
  const chatId = parseInt(req.params.chatId);
  const text = req.body.text;
  try {
    const chat = await prismaClient.chat.findUnique({
      where: {
        chatId,
        users: {
          some: {
            userId,
          },
        },
      },
    });
    if (!chat) {
      const error = new OperationalException("chat not found", 404);
      next(error);
    }
    const message = await prismaClient.message.create({
      data: {
        text,
        chatId,
        userId,
      },
    });
    await prismaClient.chat.update({
      where: {
        chatId,
      },
      data: {
        lastMessage: text,
      },
    });
    res.status(200).send(message);
  } catch (error) {
    next(error);
  }
};
