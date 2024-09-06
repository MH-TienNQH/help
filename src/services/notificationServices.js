import { OperationalException } from "../exceptions/operationalExceptions.js";
import { prismaClient } from "../routes/index.js";
import { formatVietnamTime } from "../utils/changeToVietnamTimezone.js";

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
    include: {
      user: true,
      product: true,
    },
    skip,
    take: limit,
  });

  // Format notifications with user names
  const formattedNotifications = notifications.map((notification) => {
    const { password, ...userWithoutPassword } = notification.user;
    let content = notification.content;
    const mentionedUserIds = content.match(/@\d+/g); // Extract all user IDs mentioned in the content

    if (mentionedUserIds) {
      mentionedUserIds.forEach((userIdMention) => {
        const id = parseInt(userIdMention.substring(1), 10); // Extract numeric user ID from @ID
        const user = notification.user; // Get the user details from the included user object

        if (user && user.userId === id) {
          // Replace the user ID with the username
          content = content.replace(userIdMention, `@${user.name}`);
        }
      });
    }

    return {
      ...notification,
      user: userWithoutPassword,
      content, // Update the content with user names
      createdAt: formatVietnamTime(notification.createdAt),
    };
  });

  const totalPages = Math.ceil(numberOfNotis / limit);
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  return {
    notifications: formattedNotifications,
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
    include: {
      user: true,
      product: true,
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
  const formattedCreatedAt = formatVietnamTime(notification.createdAt);
  return {
    ...notification,
    createdAt: formattedCreatedAt,
  };
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
