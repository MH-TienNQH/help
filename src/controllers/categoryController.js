import { prismaClient } from "../routes/index.js";

export const getAllCategory = async (req, res) => {
  try {
    let categories = await prismaClient.category.findMany();
    res.status(200).send(categories);
  } catch (error) {
    res.status(200).send(error);
  }
};
export const getCategoryById = async (req, res) => {
  const id = req.params.id;
  try {
    let category = await prismaClient.category.findFirst({
      where: {
        categoryId: parseInt(id),
      },
    });
    res.status(200).send(category);
  } catch (error) {
    res.status(200).send(error);
  }
};

export const addCategory = async (req, res) => {
  let userRole = req.userRole;
  if (userRole == "Admin") {
    const { categoryName } = req.body;
    try {
      let category = await prismaClient.category.findFirst({
        where: {
          categoryName,
        },
      });
      if (category) {
        res.status(401).send("category exist");
      }
      category = await prismaClient.category.create({
        data: {
          categoryName,
        },
      });
      res.status(200).send(category);
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.status(403).send("not Admin");
  }
};
export const updateCategory = async (req, res) => {
  let userRole = req.userRole;
  if (userRole == "Admin") {
    const id = req.params.id;
    const { categoryName } = req.body;
    try {
      let category = await prismaClient.category.update({
        where: {
          categoryId: parseInt(id),
        },
        data: {
          categoryName,
        },
      });
      res.status(200).send(category);
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.status(403).send("not Admin");
  }
};

export const deleteCategory = async (req, res) => {
  let userRole = req.userRole;
  if (userRole == "Admin") {
    const id = req.params.id;
    try {
      await prismaClient.category.delete({
        where: {
          categoryId: parseInt(id),
        },
      });
      res.status(200).send("ok");
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.status(403).send("not Admin");
  }
};
