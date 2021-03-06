import Product from "../models/Product";
import ImageProduct from "../models/ImageProduct";
import * as Yup from "yup";
import qr from "qr-image";
import fs from "fs";
import QrcodeProduct from "../models/QrcodeProduct";

class ProductController {
  async show(req, res) {
    const { id } = req.params;

    try {
      await Product.find({ _id: id }).exec(function (_, product) {
        return res.status(200).json(product);
      });
    } catch (err) {
      return res.status(400).json(err);
    }
  }
  async index(req, res) {
    try {
      await Product.find({ sold: false }).exec(function (_, products) {
        return res.status(200).json(products);
      });
    } catch (err) {
      return res.status(400).json(err);
    }
  }
  async sold(req, res) {
    const { admin } = req.user;

    if (!admin) {
      return res.status(401).json({ error: "access denied" });
    }
    
    try {
      await Product.find({ sold: true }).exec(function (_, products) {
        return res.status(200).json(products);
      });
    } catch (err) {
      return res.status(400).json(err);
    }
  }
  async store(req, res) {
    const schemaValidation = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string().required(),
      price: Yup.number().required().positive(),
      image: Yup.string().required(),
    });

    const { admin } = req.user;

    if (!admin) {
      return res.status(401).json({ error: "access denied" });
    }
  
    const checkSchema = await schemaValidation.isValid(req.body);

    if (!checkSchema) {
      return res.status(400).json({ error: "validations fails" });
    }

    const { name, description, price, image } = req.body;

    try {
      const product = await Product.create({
        name,
        description,
        price,
        image,
      });

      return res.status(200).json({ product: product });
    } catch (err) {
      return res.status(400).json(err);
    }
  }
  async update(req, res) {
    const schemaValidation = Yup.object().shape({
      name: Yup.string(),
      description: Yup.string(),
      price: Yup.number().positive(),
      quantity: Yup.number().positive().integer(),
    });

    const { admin } = req.user;

    if (!admin) {
      return res.status(401).json({ error: "validations fails" });
    }

    const { id } = req.params;

    const checkSchema = await schemaValidation.isValid(req.body);

    if (!checkSchema) {
      return res.status(400).json({ error: "validations fails" });
    }

    try {
      await Product.findOneAndUpdate({ _id: id }, req.body, {
        useFindAndModify: false,
      });

      return res.status(200).json(req.body);
    } catch (err) {
      return res.status(400).json(err);
    }
  }
  async delete(req, res) {
    try {
      const { id } = req.params;

      const { admin } = req.user;

      if (!admin) {
        return res.status(401).json({ error: "validations fails" });
      }

      await Product.findByIdAndDelete(id);

      return res.status(200).json({ message: "product deleted" });
    } catch (err) {
      return res.status(400).json(err);
    }
  }
}

export default new ProductController();
