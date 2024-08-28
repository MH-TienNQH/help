import { OperationalException } from "../exceptions/operationalExceptions.js";
import { prismaClient } from "../routes/index.js";

export const getAllNotification = async (
  userId,
  order = "desc",
  page,
  limit
) => {
  const orderDirection = ["asc", "desc"].includes(order.toLowerCase())
    ? order.toLowerCase()
    : "desc";
  const skip = (page - 1) * limit;
  const numberOfNotis = await prismaClient.notification.count({
    where: {
      userId,
    },
  });

  const notifications = await prismaClient.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      notificationId: orderDirection,
    },
    skip,
    take: limit,
  });
  const totalPages = Math.ceil(numberOfComments / limit);
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  return {
    notifications,
    meta: {
      previous_page: previousPage,
      current_page: page,
      next_page: nextPage,
      total: totalPages,
    },
  };
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
