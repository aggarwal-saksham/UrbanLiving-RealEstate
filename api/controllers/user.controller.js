import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get users" });
  }
};
export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get user" });
  }
};
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...inputs } = req.body;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorised!" });
  }

  let updatedPassword = null;

  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    const { password: userPassword, ...rest } = updatedUser;
    res.status(200).json(rest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update user" });
  }
};
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorised!" });
  }
  try {
    await prisma.user.delete({
      where: { id },
    });
    return res.status(200).json({ message: "User Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;
  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });

      res.status(200).json({ message: "Post removed from saved list" });
    } else {
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: "Post saved" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId;
  const now = new Date();

  try {
    // Get userPosts with buyers info
    const userPostsRaw = await prisma.post.findMany({
      where: { userId: tokenUserId },
      include: {
        buyers: true,
      },
    });

    const userPosts = userPostsRaw.map((post) => ({
      ...post,
      isBought: post.buyers.length > 0,
      comingSoon: post.availableFrom && new Date(post.availableFrom) > now,
    }));

    // Get savedPosts with buyers info
    const saved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: {
          include: {
            buyers: true,
          },
        },
      },
    });

    const savedPosts = saved.map((item) => ({
      ...item.post,
      isBought: item.post.buyers.length > 0,
      comingSoon:
        item.post.availableFrom && new Date(item.post.availableFrom) > now,
    }));

    // Get boughtPosts (already bought, so isBought is true)
    const bought = await prisma.boughtPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: {
          include: {
            user: true,
            postDetail: true,
          },
        },
      },
    });

    const boughtPosts = bought.map((item) => ({
      ...item.post,
      isBought: true,
      comingSoon:
        item.post.availableFrom && new Date(item.post.availableFrom) > now,
    }));

    res.status(200).json({ userPosts, savedPosts, boughtPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get profile posts" });
  }
};

export const getNotificationNumber = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
        NOT: {
          seenBy: {
            hasSome: [tokenUserId],
          },
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    const count = chats.filter(
      (chat) =>
        chat.messages.length > 0 && chat.messages[0].userId !== tokenUserId
    ).length;

    res.status(200).json(count);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get notifications" });
  }
};
