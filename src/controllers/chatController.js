import { OperationalException } from "../exceptions/operationalExceptions.js";
import { prismaClient } from "../routes/index.js";

export const getAllChats = async (req, res, next) => {
  const userId = req.userId;
  try {
    const chats = await prismaClient.chat.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
    });

    for (const chat of chats) {
      const receiverId = chat.users.find((id) => id !== userId);

      const receiver = await prismaClient.user.findUnique({
        where: {
          userId: receiverId,
        },

        select: {
          userId: true,
          username: true,
          avatar: true,
        },
      });
      chat.receiver = receiver;
    }

    res.status(200).send(chats);
  } catch (error) {
    next(error);
  }
};

export const getChatById = async (req, res, next) => {
  const userId = req.userId;
  const chatId = parseInt(req.params.id);
  try {
    let chat = await prismaClient.chat.findUnique({
      where: {
        chatId,
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        message: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    if (!chat) {
      const error = new OperationalException("chat not found", 404);
      next(error);
    }
    res.status(200).send(chat);
  } catch (error) {
    next(error);
  }
};

export const addChat = async (req, res, next) => {
  const userId = req.userId;
  const receiverId = req.body.receiverId;

  try {
    const newChat = await prismaClient.chat.create({
      data: {
        users: {
          connect: [
            {
              userId,
            },
            {
              userId: receiverId,
            },
          ],
        },
      },
      include: {
        users: true,
      },
    });
    res.status(200).send(newChat);
  } catch (error) {
    next(error);
  }
};
