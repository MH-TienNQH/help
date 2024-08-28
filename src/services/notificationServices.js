import { OperationalException } from "../exceptions/operationalExceptions.js";
import { prismaClient } from "../routes/index.js";

export const getAllNotification = async (userId) => {
  return await prismaClient.notification.findMany({
    where: {
      userId,
    },
  });
};

export const getById = async (userId, notiId) => {
  const notification = await prismaClient.notification.findUnique({
    where: {
      notificationId: notiId,
    },
  });
  if (!notification) {
    throw new OperationalException(404, false, "notification not found");
  }
  if (notification.userId !== userId) {
    throw new OperationalException(
      403,
      false,
      "You are not authorized to view this"
    );
  }
  await prismaClient.notification.update({
    where: {
      notificationId: notiId,
    },
    data: {
      status: true,
    },
  });
  return notification;
};

export const addNoti = async (userId, data) => {
  const user = await prismaClient.user.findUnique({
    where: {
      userId,
    },
  });
  if (!user) {
    throw new OperationalException(404, false, "No user found");
  }
  return await prismaClient.notification.create({
    data: {
      content: data.content,
      user: {
        connect: {
          userId,
        },
      },
    },
  });
};

export const deleteNoti = async (userId, notificationId) => {
  const notification = await prismaClient.notification.findUnique({
    where: {
      notificationId,
    },
  });
  if (!notification) {
    throw new OperationalException(404, false, "Notification not found");
  }
  if (notification.userId !== userId) {
    throw new OperationalException(
      403,
      false,
      "You do not have permission to delete this notification"
    );
  }
  await prismaClient.notification.delete({
    where: {
      notificationId,
    },
  });
  return true;
};
